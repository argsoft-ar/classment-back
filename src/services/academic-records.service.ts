import { AcademicStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../middlewares/error.middleware";
import { JwtPayload } from "../types/common.types";
import { assertCanAccessStudent } from "../utils/access.utils";
import { BulkUpsertRecordsInput } from "../schemas/academic-record.validation";
import {
  ICareerProgress,
  IStudentProgress,
  ISubjectProgress,
  IYearProgress,
} from "../interfaces/academic-record.interface";
import { SubjectStatus } from "../domain/correlatives";
import { institutionService } from "./institution.service";

/** DB LIBRE (lost regularity) behaves like DESAPROBADA for the engine contract. */
export function toEngineStatus(status: AcademicStatus): SubjectStatus {
  return status === "LIBRE" ? "DESAPROBADA" : status;
}

async function findStudent(studentId: string) {
  const student = await prisma.user.findUnique({
    where: { id: studentId },
    include: {
      studentCareers: {
        include: {
          studyPlan: {
            include: {
              career: true,
              subjects: {
                where: { isActive: true },
                orderBy: [{ yearLevel: "asc" }, { name: "asc" }],
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!student || student.role !== "Alumno") throw new AppError(404, "Student not found");
  return student;
}

export const academicRecordsService = {
  async getStudentStatuses(studentId: string): Promise<Record<string, SubjectStatus>> {
    const records = await prisma.academicRecord.findMany({
      where: { studentId },
      select: { subjectId: true, status: true },
    });
    const statuses: Record<string, SubjectStatus> = {};
    for (const r of records) statuses[r.subjectId] = toEngineStatus(r.status);
    return statuses;
  },

  async getStudentProgress(studentId: string, actor: JwtPayload): Promise<IStudentProgress> {
    assertCanAccessStudent(actor, studentId);
    const student = await findStudent(studentId);

    const records = await prisma.academicRecord.findMany({ where: { studentId } });
    const recordBySubject = new Map(records.map((r) => [r.subjectId, r]));

    const careers: ICareerProgress[] = student.studentCareers.map((sc) => {
      const plan = sc.studyPlan;
      const yearsCount = Math.max(
        plan.career.durationYears,
        ...plan.subjects.map((s) => s.yearLevel),
      );
      const years: IYearProgress[] = Array.from({ length: yearsCount }, (_, i) => ({
        yearLevel: i + 1,
        subjects: [],
      }));
      const summary = { total: 0, aprobadas: 0, regularizadas: 0, cursando: 0, pendientes: 0 };

      for (const subject of plan.subjects) {
        const record = recordBySubject.get(subject.id);
        const entry: ISubjectProgress = {
          subjectId: subject.id,
          name: subject.name,
          yearLevel: subject.yearLevel,
          status: record?.status ?? "SIN_CURSAR",
          origin: record?.origin ?? null,
          finalGrade: record?.finalGrade ? record.finalGrade.toNumber() : null,
          regularizedAt: record?.regularizedAt ?? null,
          approvedAt: record?.approvedAt ?? null,
        };
        years[subject.yearLevel - 1]?.subjects.push(entry);

        summary.total++;
        if (entry.status === "APROBADA") summary.aprobadas++;
        else if (entry.status === "REGULARIZADA") summary.regularizadas++;
        else if (entry.status === "CURSANDO") summary.cursando++;
        else summary.pendientes++;
      }

      return {
        careerId: plan.career.id,
        careerName: plan.career.name,
        studyPlanId: plan.id,
        cohortYear: sc.cohortYear,
        summary,
        years,
      };
    });

    return {
      student: {
        id: student.id,
        dni: student.dni,
        firstName: student.firstName,
        lastName: student.lastName,
        email: student.email,
      },
      careers,
    };
  },

  /** "Día Cero" grid: bulk set previous history (initial load / equivalences). */
  async bulkUpsert(
    studentId: string,
    dto: BulkUpsertRecordsInput,
    actor: JwtPayload,
  ): Promise<IStudentProgress> {
    const student = await findStudent(studentId);
    const config = await institutionService.getConfig();

    const planSubjectIds = new Set(
      student.studentCareers.flatMap((sc) => sc.studyPlan.subjects.map((s) => s.id)),
    );
    const invalid = dto.records.filter((r) => !planSubjectIds.has(r.subjectId));
    if (invalid.length > 0) {
      throw new AppError(422, "Some subjects do not belong to the student's study plan", {
        subjectIds: invalid.map((r) => r.subjectId),
      });
    }

    const lowGrade = dto.records.filter(
      (r) => r.finalGrade != null && r.finalGrade < config.passingGrade,
    );
    if (lowGrade.length > 0) {
      throw new AppError(
        422,
        `finalGrade for APROBADA must be >= passingGrade (${config.passingGrade})`,
        { subjectIds: lowGrade.map((r) => r.subjectId) },
      );
    }

    // Removing the record (SIN_CURSAR) would orphan a live enrollment: the student must drop first.
    const toClear = dto.records.filter((r) => r.status === "SIN_CURSAR").map((r) => r.subjectId);
    if (toClear.length > 0) {
      const activeEnrollments = await prisma.enrollment.findMany({
        where: { studentId, status: "ACTIVA", offering: { subjectId: { in: toClear } } },
        select: { offering: { select: { subjectId: true } } },
      });
      if (activeEnrollments.length > 0) {
        throw new AppError(
          409,
          "Cannot set SIN_CURSAR: the student has an active enrollment for these subjects (drop the enrollment first)",
          { subjectIds: [...new Set(activeEnrollments.map((e) => e.offering.subjectId))] },
        );
      }
    }

    const existing = await prisma.academicRecord.findMany({
      where: { studentId, subjectId: { in: dto.records.map((r) => r.subjectId) } },
    });
    const existingBySubject = new Map(existing.map((r) => [r.subjectId, r]));
    const now = new Date();

    const operations: Prisma.PrismaPromise<unknown>[] = dto.records.map((entry) => {
      if (entry.status === "SIN_CURSAR") {
        return prisma.academicRecord.deleteMany({
          where: { studentId, subjectId: entry.subjectId },
        });
      }

      const prev = existingBySubject.get(entry.subjectId);
      const status = entry.status;
      const regularizedAt =
        status === "REGULARIZADA"
          ? (prev?.regularizedAt ?? now)
          : status === "APROBADA"
            ? (prev?.regularizedAt ?? null)
            : null;
      const approvedAt = status === "APROBADA" ? (prev?.approvedAt ?? now) : null;
      const finalGrade = status === "APROBADA" ? (entry.finalGrade ?? null) : null;

      const data = { status, origin: entry.origin, regularizedAt, approvedAt, finalGrade };
      return prisma.academicRecord.upsert({
        where: { studentId_subjectId: { studentId, subjectId: entry.subjectId } },
        create: { studentId, subjectId: entry.subjectId, ...data },
        update: data,
      });
    });

    await prisma.$transaction(operations);
    return academicRecordsService.getStudentProgress(studentId, actor);
  },
};
