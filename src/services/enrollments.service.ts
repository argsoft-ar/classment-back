import { prisma } from "../config/prisma";
import { AppError } from "../middlewares/error.middleware";
import { JwtPayload } from "../types/common.types";
import { CreateEnrollmentInput } from "../schemas/enrollment.validation";
import { isPeriodOpen } from "../domain/correlatives";
import { institutionService } from "./institution.service";
import { academicRecordsService } from "./academic-records.service";
import { enrollmentValidationService } from "./enrollment-validation.service";

const enrollmentInclude = {
  offering: {
    include: {
      period: true,
      subject: { select: { id: true, name: true, yearLevel: true } },
      teacher: { select: { id: true, firstName: true, lastName: true } },
    },
  },
} as const;

export const enrollmentsService = {
  /** studentId always comes from the authenticated user (never from the request body). */
  async create(dto: CreateEnrollmentInput, actor: JwtPayload) {
    const studentId = actor.userId;
    const offering = await prisma.offering.findUnique({
      where: { id: dto.offeringId },
      include: { period: true, subject: true },
    });
    if (!offering || !offering.subject.isActive) throw new AppError(404, "Offering not found");

    const inPlan = await prisma.studentCareer.findFirst({
      where: { studentId, studyPlanId: offering.subject.studyPlanId },
    });
    if (!inPlan) {
      throw new AppError(403, "La materia no pertenece a tu plan de estudios");
    }

    if (offering.period.type === "CURSADA" && dto.modality === "LIBRE") {
      throw new AppError(422, "La modalidad Libre solo está disponible para mesas de examen final");
    }

    const [config, statuses, correlatives, active] = await Promise.all([
      institutionService.getConfig(),
      academicRecordsService.getStudentStatuses(studentId),
      enrollmentValidationService.loadCorrelatives([offering.subjectId]),
      prisma.enrollment.findFirst({
        where: { offeringId: offering.id, studentId, status: "ACTIVA" },
      }),
    ]);

    const validation = enrollmentValidationService.validate(
      { now: new Date(), statuses, validateFinalCorrelatives: config.validateFinalCorrelatives },
      offering.period,
      offering.subject,
      dto.modality,
      correlatives.get(offering.subjectId) ?? [],
      active !== null,
    );
    if (!validation.allowed) {
      throw new AppError(422, "Inscripción rechazada", validation);
    }

    const modality = offering.period.type === "CURSADA" ? "REGULAR" : dto.modality;

    return prisma.$transaction(async (tx) => {
      // Serialize concurrent enrollments for this offering: lock its row, then count seats.
      // maxCapacity is re-read from the locked row in case it changed since the first read.
      const locked = await tx.$queryRaw<{ maxCapacity: number | null }[]>`
        SELECT "maxCapacity" FROM "Offering" WHERE "id" = ${offering.id} FOR UPDATE`;
      const lockedOffering = locked[0];
      if (!lockedOffering) throw new AppError(404, "Offering not found");

      if (lockedOffering.maxCapacity !== null) {
        const taken = await tx.enrollment.count({
          where: { offeringId: offering.id, status: "ACTIVA" },
        });
        if (taken >= lockedOffering.maxCapacity) throw new AppError(409, "Cupo completo");
      }

      const enrollment = await tx.enrollment.create({
        data: { offeringId: offering.id, studentId, modality, status: "ACTIVA" },
        include: enrollmentInclude,
      });

      if (offering.period.type === "CURSADA") {
        const cursando = {
          status: "CURSANDO" as const,
          origin: "CURSADA" as const,
          finalGrade: null,
          regularizedAt: null,
          approvedAt: null,
        };
        await tx.academicRecord.upsert({
          where: { studentId_subjectId: { studentId, subjectId: offering.subjectId } },
          create: { studentId, subjectId: offering.subjectId, ...cursando },
          update: cursando,
        });
      }

      return enrollment;
    });
  },

  async drop(id: string, actor: JwtPayload) {
    const enrollment = await prisma.enrollment.findUnique({
      where: { id },
      include: { offering: { include: { period: true } } },
    });
    if (!enrollment) throw new AppError(404, "Enrollment not found");
    if (enrollment.studentId !== actor.userId) {
      throw new AppError(403, "Forbidden: you can only drop your own enrollments");
    }
    if (enrollment.status !== "ACTIVA") {
      throw new AppError(409, "Only ACTIVA enrollments can be dropped");
    }
    if (!isPeriodOpen(enrollment.offering.period, new Date())) {
      throw new AppError(422, "Fuera de fecha: el período de inscripción no está abierto");
    }

    return prisma.$transaction(async (tx) => {
      const updated = await tx.enrollment.update({
        where: { id },
        data: { status: "BAJA" },
        include: enrollmentInclude,
      });

      // Undo the CURSANDO mark created at enrollment time (Fase 0: previous state is not kept).
      if (enrollment.offering.period.type === "CURSADA") {
        await tx.academicRecord.deleteMany({
          where: {
            studentId: enrollment.studentId,
            subjectId: enrollment.offering.subjectId,
            status: "CURSANDO",
          },
        });
      }

      return updated;
    });
  },

  async findMine(actor: JwtPayload) {
    return prisma.enrollment.findMany({
      where: { studentId: actor.userId },
      include: enrollmentInclude,
      orderBy: { createdAt: "desc" },
    });
  },
};
