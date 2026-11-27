import { EnrollmentPeriod, Subject } from "@prisma/client";
import { prisma } from "../config/prisma";
import {
  CorrelativeRequirement,
  EnrollmentModality,
  EnrollmentValidationResult,
  SubjectStatus,
  validateEnrollment,
} from "../domain/correlatives";

export interface EngineContext {
  now: Date;
  statuses: Record<string, SubjectStatus>;
  validateFinalCorrelatives: boolean;
}

/** Adapter between persistence and the pure correlatives engine. */
export const enrollmentValidationService = {
  async loadCorrelatives(
    subjectIds: string[],
  ): Promise<Map<string, CorrelativeRequirement[]>> {
    const rules = await prisma.correlativeRule.findMany({
      where: { subjectId: { in: subjectIds } },
      include: { requiredSubject: { select: { id: true, name: true } } },
      orderBy: [{ createdAt: "asc" }],
    });
    const bySubject = new Map<string, CorrelativeRequirement[]>();
    for (const rule of rules) {
      const list = bySubject.get(rule.subjectId) ?? [];
      list.push({
        requiredSubjectId: rule.requiredSubject.id,
        requiredSubjectName: rule.requiredSubject.name,
        appliesTo: rule.appliesTo,
        requiredStatus: rule.requiredStatus,
      });
      bySubject.set(rule.subjectId, list);
    }
    return bySubject;
  },

  validate(
    ctx: EngineContext,
    period: Pick<EnrollmentPeriod, "type" | "startsAt" | "endsAt" | "isActive">,
    subject: Pick<Subject, "id" | "name">,
    modality: EnrollmentModality,
    correlatives: CorrelativeRequirement[],
    hasActiveEnrollment: boolean,
    hasClosedEnrollment = false,
  ): EnrollmentValidationResult {
    return validateEnrollment({
      now: ctx.now,
      kind: period.type,
      modality: period.type === "CURSADA" ? "REGULAR" : modality,
      period: { startsAt: period.startsAt, endsAt: period.endsAt, isActive: period.isActive },
      subject: { id: subject.id, name: subject.name },
      statuses: ctx.statuses,
      hasActiveEnrollment,
      hasClosedEnrollment,
      correlatives,
      validateFinalCorrelatives: ctx.validateFinalCorrelatives,
    });
  },
};
