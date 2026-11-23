import { prisma } from "../config/prisma";
import { AppError } from "../middlewares/error.middleware";
import { detectCycle } from "../domain/correlatives";
import { CreateCorrelativeInput } from "../schemas/correlative.validation";

const subjectBrief = { select: { id: true, name: true, yearLevel: true } } as const;

export const correlativesService = {
  async findBySubject(subjectId: string) {
    const subject = await prisma.subject.findUnique({
      where: { id: subjectId },
      select: { id: true, name: true, yearLevel: true },
    });
    if (!subject) throw new AppError(404, "Subject not found");

    const [correlatives, requiredBy] = await Promise.all([
      prisma.correlativeRule.findMany({
        where: { subjectId },
        include: { requiredSubject: subjectBrief },
        orderBy: [{ appliesTo: "asc" }, { createdAt: "asc" }],
      }),
      prisma.correlativeRule.findMany({
        where: { requiredSubjectId: subjectId },
        include: { subject: subjectBrief },
        orderBy: [{ appliesTo: "asc" }, { createdAt: "asc" }],
      }),
    ]);

    return { subject, correlatives, requiredBy };
  },

  async create(dto: CreateCorrelativeInput) {
    const [subject, required] = await Promise.all([
      prisma.subject.findUnique({ where: { id: dto.subjectId } }),
      prisma.subject.findUnique({ where: { id: dto.requiredSubjectId } }),
    ]);
    if (!subject || !subject.isActive) throw new AppError(404, "Subject not found");
    if (!required || !required.isActive) throw new AppError(404, "Required subject not found");

    if (subject.id === required.id) {
      throw new AppError(422, "A subject cannot be its own correlative");
    }
    if (subject.studyPlanId !== required.studyPlanId) {
      throw new AppError(422, "Both subjects must belong to the same study plan");
    }

    const duplicate = await prisma.correlativeRule.findUnique({
      where: {
        subjectId_requiredSubjectId_appliesTo: {
          subjectId: dto.subjectId,
          requiredSubjectId: dto.requiredSubjectId,
          appliesTo: dto.appliesTo,
        },
      },
    });
    if (duplicate) throw new AppError(409, "Correlative rule already exists");

    // Cycles are evaluated over all scopes: a circular dependency is invalid either way.
    const planRules = await prisma.correlativeRule.findMany({
      where: { subject: { studyPlanId: subject.studyPlanId } },
      select: { subjectId: true, requiredSubjectId: true },
    });
    const cycle = detectCycle(planRules, {
      subjectId: dto.subjectId,
      requiredSubjectId: dto.requiredSubjectId,
    });
    if (cycle.hasCycle) {
      const names = await prisma.subject.findMany({
        where: { id: { in: cycle.path } },
        select: { id: true, name: true },
      });
      const nameById = new Map(names.map((n) => [n.id, n.name]));
      const readable = cycle.path.map((id) => nameById.get(id) ?? id);
      throw new AppError(
        409,
        `Correlative rule would create a cycle: ${readable.join(" -> ")}`,
        { path: cycle.path, names: readable },
      );
    }

    return prisma.correlativeRule.create({
      data: dto,
      include: { subject: subjectBrief, requiredSubject: subjectBrief },
    });
  },

  async delete(id: string): Promise<void> {
    const rule = await prisma.correlativeRule.findUnique({ where: { id } });
    if (!rule) throw new AppError(404, "Correlative rule not found");
    await prisma.correlativeRule.delete({ where: { id } });
  },
};
