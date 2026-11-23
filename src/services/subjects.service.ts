import { prisma } from "../config/prisma";
import { AppError } from "../middlewares/error.middleware";
import {
  CreateSubjectInput,
  UpdateSubjectInput,
} from "../schemas/subject.validation";
import { careersService } from "./careers.service";

const subjectInclude = {
  studyPlan: {
    select: {
      id: true,
      code: true,
      career: { select: { id: true, name: true, durationYears: true } },
    },
  },
  correlatives: {
    include: { requiredSubject: { select: { id: true, name: true, yearLevel: true } } },
  },
  requiredBy: {
    include: { subject: { select: { id: true, name: true, yearLevel: true } } },
  },
} as const;

function assertYearLevel(yearLevel: number, durationYears: number): void {
  if (yearLevel > durationYears) {
    throw new AppError(
      422,
      `yearLevel must be between 1 and the career duration (${durationYears})`,
    );
  }
}

export const subjectsService = {
  async create(dto: CreateSubjectInput) {
    const plan = await careersService.getActiveStudyPlan(dto.careerId);
    const career = await careersService.findById(dto.careerId);
    assertYearLevel(dto.yearLevel, career.durationYears);

    return prisma.subject.create({
      data: { studyPlanId: plan.id, name: dto.name, yearLevel: dto.yearLevel },
      include: subjectInclude,
    });
  },

  async findByCareer(careerId: string) {
    const plan = await careersService.getActiveStudyPlan(careerId);
    return prisma.subject.findMany({
      where: { studyPlanId: plan.id, isActive: true },
      orderBy: [{ yearLevel: "asc" }, { name: "asc" }],
    });
  },

  async findById(id: string) {
    const subject = await prisma.subject.findUnique({ where: { id }, include: subjectInclude });
    if (!subject || !subject.isActive) throw new AppError(404, "Subject not found");
    return subject;
  },

  async update(id: string, dto: UpdateSubjectInput) {
    const subject = await prisma.subject.findUnique({ where: { id }, include: subjectInclude });
    if (!subject) throw new AppError(404, "Subject not found");
    if (dto.yearLevel !== undefined) {
      assertYearLevel(dto.yearLevel, subject.studyPlan.career.durationYears);
    }
    return prisma.subject.update({ where: { id }, data: dto, include: subjectInclude });
  },

  async deactivate(id: string): Promise<void> {
    const subject = await prisma.subject.findUnique({ where: { id } });
    if (!subject) throw new AppError(404, "Subject not found");
    await prisma.subject.update({ where: { id }, data: { isActive: false } });
  },
};
