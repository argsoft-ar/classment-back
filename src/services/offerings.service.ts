import { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../middlewares/error.middleware";
import { JwtPayload } from "../types/common.types";
import { RoleLevel } from "../types/rbac.types";
import {
  CreateOfferingInput,
  ListOfferingsQuery,
  UpdateOfferingInput,
} from "../schemas/offering.validation";
import { IAvailableOffering } from "../interfaces/offering.interface";
import { EnrollmentModality, EnrollmentValidationResult } from "../domain/correlatives";
import { institutionService } from "./institution.service";
import { academicRecordsService } from "./academic-records.service";
import { enrollmentValidationService } from "./enrollment-validation.service";

const offeringInclude = {
  period: true,
  subject: { select: { id: true, name: true, yearLevel: true, studyPlanId: true } },
  teacher: { select: { id: true, firstName: true, lastName: true, email: true } },
  _count: { select: { enrollments: { where: { status: "ACTIVA" } } } },
} satisfies Prisma.OfferingInclude;

async function assertTeacher(teacherId: string | null | undefined): Promise<void> {
  if (!teacherId) return;
  const teacher = await prisma.user.findUnique({ where: { id: teacherId } });
  if (!teacher || teacher.role !== "Docente" || teacher.status === "INACTIVE") {
    throw new AppError(422, "teacherId must reference an active Docente");
  }
}

function assertExamDate(periodType: "CURSADA" | "FINAL", examDate: Date | null | undefined): void {
  if (periodType === "CURSADA" && examDate) {
    throw new AppError(422, "examDate is only allowed for FINAL periods");
  }
}

export const offeringsService = {
  /** Docentes only see the offerings assigned to them. */
  async findAll(query: ListOfferingsQuery, actor: JwtPayload) {
    return prisma.offering.findMany({
      where: {
        periodId: query.periodId,
        subjectId: query.subjectId,
        ...(actor.role === RoleLevel.DOCENTE && { teacherId: actor.userId }),
      },
      include: offeringInclude,
      orderBy: [{ period: { startsAt: "desc" } }, { subject: { yearLevel: "asc" } }],
    });
  },

  async findById(id: string, actor: JwtPayload) {
    const offering = await prisma.offering.findUnique({ where: { id }, include: offeringInclude });
    if (!offering) throw new AppError(404, "Offering not found");
    if (actor.role === RoleLevel.DOCENTE && offering.teacherId !== actor.userId) {
      throw new AppError(403, "Forbidden: offering is not assigned to you");
    }
    return offering;
  },

  async findEnrollments(id: string, actor: JwtPayload) {
    await offeringsService.findById(id, actor);
    return prisma.enrollment.findMany({
      where: { offeringId: id, status: { in: ["ACTIVA", "CERRADA"] } },
      include: {
        student: { select: { id: true, dni: true, firstName: true, lastName: true, email: true } },
      },
      orderBy: [{ student: { lastName: "asc" } }, { student: { firstName: "asc" } }],
    });
  },

  async create(dto: CreateOfferingInput) {
    const period = await prisma.enrollmentPeriod.findUnique({ where: { id: dto.periodId } });
    if (!period) throw new AppError(404, "Enrollment period not found");
    const subject = await prisma.subject.findUnique({ where: { id: dto.subjectId } });
    if (!subject || !subject.isActive) throw new AppError(404, "Subject not found");

    assertExamDate(period.type, dto.examDate);
    await assertTeacher(dto.teacherId);

    const duplicate = await prisma.offering.findUnique({
      where: { periodId_subjectId: { periodId: dto.periodId, subjectId: dto.subjectId } },
    });
    if (duplicate) throw new AppError(409, "Subject is already offered in this period");

    return prisma.offering.create({
      data: {
        periodId: dto.periodId,
        subjectId: dto.subjectId,
        teacherId: dto.teacherId ?? null,
        examDate: dto.examDate ?? null,
        maxCapacity: dto.maxCapacity ?? null,
      },
      include: offeringInclude,
    });
  },

  async update(id: string, dto: UpdateOfferingInput) {
    const offering = await prisma.offering.findUnique({ where: { id }, include: { period: true } });
    if (!offering) throw new AppError(404, "Offering not found");

    assertExamDate(offering.period.type, dto.examDate);
    await assertTeacher(dto.teacherId);

    return prisma.offering.update({ where: { id }, data: dto, include: offeringInclude });
  },

  async delete(id: string): Promise<void> {
    const offering = await prisma.offering.findUnique({ where: { id } });
    if (!offering) throw new AppError(404, "Offering not found");
    const enrollments = await prisma.enrollment.count({ where: { offeringId: id } });
    if (enrollments > 0) throw new AppError(409, "Offering has enrollments and cannot be deleted");
    await prisma.offering.delete({ where: { id } });
  },

  /** Open offerings of the student's study plan(s), each validated by the correlatives engine. */
  async findAvailable(actor: JwtPayload): Promise<IAvailableOffering[]> {
    const now = new Date();
    const careers = await prisma.studentCareer.findMany({
      where: { studentId: actor.userId },
      select: { studyPlanId: true },
    });
    const studyPlanIds = careers.map((c) => c.studyPlanId);
    if (studyPlanIds.length === 0) return [];

    const offerings = await prisma.offering.findMany({
      where: {
        period: { isActive: true, startsAt: { lte: now }, endsAt: { gte: now } },
        subject: { studyPlanId: { in: studyPlanIds }, isActive: true },
      },
      include: offeringInclude,
      orderBy: [
        { period: { type: "asc" } },
        { subject: { yearLevel: "asc" } },
        { subject: { name: "asc" } },
      ],
    });
    if (offerings.length === 0) return [];

    const [config, statuses, correlatives, activeEnrollments] = await Promise.all([
      institutionService.getConfig(),
      academicRecordsService.getStudentStatuses(actor.userId),
      enrollmentValidationService.loadCorrelatives(offerings.map((o) => o.subjectId)),
      prisma.enrollment.findMany({
        where: {
          studentId: actor.userId,
          status: "ACTIVA",
          offeringId: { in: offerings.map((o) => o.id) },
        },
        select: { id: true, offeringId: true },
      }),
    ]);
    const activeByOffering = new Map(activeEnrollments.map((e) => [e.offeringId, e.id]));
    const ctx = { now, statuses, validateFinalCorrelatives: config.validateFinalCorrelatives };

    return offerings.map((o) => {
      const rules = correlatives.get(o.subjectId) ?? [];
      const activeEnrollmentId = activeByOffering.get(o.id) ?? null;
      const run = (modality: EnrollmentModality): EnrollmentValidationResult =>
        enrollmentValidationService.validate(
          ctx, o.period, o.subject, modality, rules, activeEnrollmentId !== null,
        );

      let modality: EnrollmentModality = "REGULAR";
      const validationByModality: IAvailableOffering["validationByModality"] = {};
      if (o.period.type === "CURSADA") {
        validationByModality.REGULAR = run("REGULAR");
      } else {
        validationByModality.REGULAR = run("REGULAR");
        validationByModality.LIBRE = run("LIBRE");
        modality = statuses[o.subjectId] === "REGULARIZADA" ? "REGULAR" : "LIBRE";
      }

      return {
        id: o.id,
        examDate: o.examDate,
        maxCapacity: o.maxCapacity,
        period: {
          id: o.period.id,
          type: o.period.type,
          name: o.period.name,
          academicYear: o.period.academicYear,
          callNumber: o.period.callNumber,
          startsAt: o.period.startsAt,
          endsAt: o.period.endsAt,
        },
        subject: { id: o.subject.id, name: o.subject.name, yearLevel: o.subject.yearLevel },
        teacher: o.teacher
          ? { id: o.teacher.id, firstName: o.teacher.firstName, lastName: o.teacher.lastName }
          : null,
        modality,
        validation: validationByModality[modality] ?? { allowed: false, reasons: [] },
        validationByModality,
        activeEnrollmentId,
      };
    });
  },
};
