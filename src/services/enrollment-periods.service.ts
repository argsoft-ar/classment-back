import { prisma } from "../config/prisma";
import { AppError } from "../middlewares/error.middleware";
import {
  CreatePeriodInput,
  ListPeriodsQuery,
  UpdatePeriodInput,
} from "../schemas/enrollment-period.validation";

const periodInclude = { _count: { select: { offerings: true } } } as const;

export const enrollmentPeriodsService = {
  async findAll(query: ListPeriodsQuery) {
    return prisma.enrollmentPeriod.findMany({
      where: { type: query.type, academicYear: query.academicYear },
      include: periodInclude,
      orderBy: [{ startsAt: "desc" }],
    });
  },

  async findOpen(now: Date = new Date()) {
    return prisma.enrollmentPeriod.findMany({
      where: { isActive: true, startsAt: { lte: now }, endsAt: { gte: now } },
      include: periodInclude,
      orderBy: [{ type: "asc" }, { startsAt: "asc" }],
    });
  },

  async findById(id: string) {
    const period = await prisma.enrollmentPeriod.findUnique({
      where: { id },
      include: periodInclude,
    });
    if (!period) throw new AppError(404, "Enrollment period not found");
    return period;
  },

  async create(dto: CreatePeriodInput) {
    return prisma.enrollmentPeriod.create({
      data: { ...dto, callNumber: dto.callNumber ?? null },
      include: periodInclude,
    });
  },

  async update(id: string, dto: UpdatePeriodInput) {
    const current = await enrollmentPeriodsService.findById(id);

    const startsAt = dto.startsAt ?? current.startsAt;
    const endsAt = dto.endsAt ?? current.endsAt;
    if (endsAt <= startsAt) throw new AppError(422, "endsAt must be after startsAt");

    if (dto.callNumber !== undefined) {
      const valid = current.type === "FINAL" ? dto.callNumber != null : dto.callNumber == null;
      if (!valid) {
        throw new AppError(
          422,
          "callNumber (1 or 2) is required for FINAL periods and must be empty for CURSADA",
        );
      }
    }

    return prisma.enrollmentPeriod.update({ where: { id }, data: dto, include: periodInclude });
  },

  async delete(id: string): Promise<void> {
    await enrollmentPeriodsService.findById(id);
    const enrollments = await prisma.enrollment.count({ where: { offering: { periodId: id } } });
    if (enrollments > 0) {
      throw new AppError(409, "Period has enrollments; deactivate it instead");
    }
    await prisma.$transaction([
      prisma.offering.deleteMany({ where: { periodId: id } }),
      prisma.enrollmentPeriod.delete({ where: { id } }),
    ]);
  },
};
