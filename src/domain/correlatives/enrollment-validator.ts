import {
  CorrelativeRequirement,
  EnrollmentValidationInput,
  EnrollmentValidationResult,
  PeriodWindow,
  RejectionReason,
  RequiredStatus,
  SubjectStatus,
} from "./types";

export function isPeriodOpen(period: PeriodWindow, now: Date): boolean {
  const t = now.getTime();
  return (
    period.isActive &&
    t >= period.startsAt.getTime() &&
    t <= period.endsAt.getTime()
  );
}

/** APROBADA satisfies both APROBADA and REGULARIZADA requirements. */
export function satisfiesRequirement(
  current: SubjectStatus,
  required: RequiredStatus,
): boolean {
  if (current === "APROBADA") return true;
  return required === "REGULARIZADA" && current === "REGULARIZADA";
}

function statusOf(
  statuses: Readonly<Record<string, SubjectStatus>>,
  subjectId: string,
): SubjectStatus {
  return statuses[subjectId] ?? "SIN_CURSAR";
}

function evaluateCorrelatives(
  rules: readonly CorrelativeRequirement[],
  statuses: Readonly<Record<string, SubjectStatus>>,
): RejectionReason[] {
  const reasons: RejectionReason[] = [];
  for (const rule of rules) {
    const current = statusOf(statuses, rule.requiredSubjectId);
    if (!satisfiesRequirement(current, rule.requiredStatus)) {
      reasons.push({
        code: "CORRELATIVE_NOT_MET",
        message: `Requiere ${rule.requiredSubjectName} ${rule.requiredStatus} (estado actual: ${current})`,
        requiredSubjectId: rule.requiredSubjectId,
        requiredSubjectName: rule.requiredSubjectName,
        requiredStatus: rule.requiredStatus,
        currentStatus: current,
      });
    }
  }
  return reasons;
}

function result(reasons: RejectionReason[]): EnrollmentValidationResult {
  return { allowed: reasons.length === 0, reasons };
}

/**
 * Deterministic implementation of the README §7 validation flowchart.
 * Gate checks short-circuit (as in the flowchart); correlatives are evaluated exhaustively.
 */
export function validateEnrollment(
  input: EnrollmentValidationInput,
): EnrollmentValidationResult {
  const { subject, statuses } = input;
  const own = statusOf(statuses, subject.id);

  if (!isPeriodOpen(input.period, input.now)) {
    return result([
      {
        code: "PERIOD_CLOSED",
        message: "Fuera de fecha: el período de inscripción no está abierto",
      },
    ]);
  }

  const gate: RejectionReason[] = [];
  if (own === "APROBADA") {
    gate.push({
      code: "ALREADY_APPROVED",
      message: `Ya tenés ${subject.name} APROBADA`,
      currentStatus: own,
    });
  }
  if (input.hasActiveEnrollment) {
    gate.push({
      code: "ALREADY_ENROLLED",
      message: `Ya tenés una inscripción activa en ${subject.name}`,
    });
  }
  if (gate.length > 0) return result(gate);

  if (input.kind === "CURSADA") {
    if (own === "REGULARIZADA" || own === "CURSANDO") {
      return result([
        {
          code: "ALREADY_REGULARIZED",
          message:
            own === "CURSANDO"
              ? `Ya estás cursando ${subject.name}`
              : `Ya tenés ${subject.name} REGULARIZADA: inscribite a la mesa de final`,
          currentStatus: own,
        },
      ]);
    }
    const rules = input.correlatives.filter((r) => r.appliesTo === "CURSADA");
    return result(evaluateCorrelatives(rules, statuses));
  }

  if (input.modality === "REGULAR" && own !== "REGULARIZADA") {
    return result([
      {
        code: "NOT_REGULARIZED_FOR_FINAL",
        message: `Debés regularizar la cursada de ${subject.name} o anotarte como Libre (estado actual: ${own})`,
        currentStatus: own,
      },
    ]);
  }

  if (input.modality === "LIBRE" && own === "REGULARIZADA") {
    return result([
      {
        code: "ALREADY_REGULARIZED",
        message: `Ya tenés ${subject.name} REGULARIZADA: inscribite como Regular`,
        currentStatus: own,
      },
    ]);
  }

  if (!input.validateFinalCorrelatives) return result([]);

  const rules = input.correlatives.filter((r) => r.appliesTo === "FINAL");
  return result(evaluateCorrelatives(rules, statuses));
}
