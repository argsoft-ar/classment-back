import { StudyPlan } from "@prisma/client";
import { prisma } from "../config/prisma";
import { AppError } from "../middlewares/error.middleware";
import { CreateCareerInput, UpdateCareerInput } from "../schemas/career.validation";
import { ICareerCurriculum, ISubjectsByYear } from "../interfaces/subject.interface";

const careerInclude = {
  studyPlans: {
    where: { isActive: true },
    select: { id: true, code: true, year: true },
  },
  _count: { select: { studyPlans: true } },
} as const;

export const careersService = {
  async findAll() {
    return prisma.career.findMany({
      where: { isActive: true },
      include: careerInclude,
      orderBy: { name: "asc" },
    });
  },

  async findById(id: string) {
    const career = await prisma.career.findUnique({ where: { id }, include: careerInclude });
    if (!career) throw new AppError(404, "Career not found");
    return career;
  },

  /** Every career has one active (silent) study plan; subjects and students hang from it. */
  async getActiveStudyPlan(careerId: string): Promise<StudyPlan> {
    const career = await prisma.career.findUnique({ where: { id: careerId } });
    if (!career || !career.isActive) throw new AppError(404, "Career not found");

    const plan = await prisma.studyPlan.findFirst({
      where: { careerId, isActive: true },
      orderBy: { year: "desc" },
    });
    if (!plan) throw new AppError(422, "Career has no active study plan");
    return plan;
  },

  async create(dto: CreateCareerInput) {
    const year = new Date().getFullYear();
    return prisma.career.create({
      data: {
        name: dto.name,
        durationYears: dto.durationYears,
        studyPlans: { create: { code: `PLAN-${year}`, year, isActive: true } },
      },
      include: careerInclude,
    });
  },

  async update(id: string, dto: UpdateCareerInput) {
    await careersService.findById(id);

    if (dto.durationYears !== undefined) {
      const deepest = await prisma.subject.aggregate({
        where: { studyPlan: { careerId: id }, isActive: true },
        _max: { yearLevel: true },
      });
      const maxYear = deepest._max.yearLevel ?? 0;
      if (dto.durationYears < maxYear) {
        throw new AppError(
          422,
          `durationYears cannot be lower than the highest subject year (${maxYear})`,
        );
      }
    }

    return prisma.career.update({ where: { id }, data: dto, include: careerInclude });
  },

  async deactivate(id: string): Promise<void> {
    await careersService.findById(id);
    await prisma.career.update({ where: { id }, data: { isActive: false } });
  },

  async getCurriculum(id: string): Promise<ICareerCurriculum> {
    const career = await careersService.findById(id);
    const plan = await careersService.getActiveStudyPlan(id);

    const subjects = await prisma.subject.findMany({
      where: { studyPlanId: plan.id, isActive: true },
      include: {
        correlatives: {
          include: { requiredSubject: { select: { id: true, name: true } } },
          orderBy: [{ appliesTo: "asc" }, { createdAt: "asc" }],
        },
      },
      orderBy: [{ yearLevel: "asc" }, { name: "asc" }],
    });

    const maxYear = Math.max(career.durationYears, ...subjects.map((s) => s.yearLevel));
    const years: ISubjectsByYear[] = Array.from({ length: maxYear }, (_, i) => ({
      yearLevel: i + 1,
      subjects: [],
    }));

    for (const s of subjects) {
      years[s.yearLevel - 1]?.subjects.push({
        id: s.id,
        name: s.name,
        yearLevel: s.yearLevel,
        regime: s.regime,
        isActive: s.isActive,
        correlatives: s.correlatives.map((c) => ({
          id: c.id,
          requiredSubjectId: c.requiredSubject.id,
          requiredSubjectName: c.requiredSubject.name,
          appliesTo: c.appliesTo,
          requiredStatus: c.requiredStatus,
        })),
      });
    }

    return {
      career: { id: career.id, name: career.name, durationYears: career.durationYears },
      studyPlan: { id: plan.id, code: plan.code, year: plan.year },
      years,
    };
  },
};
