import { AcademicRecordMutation, AcademicRecordTransitionInput } from "./types";

/**
 * Computes the AcademicRecord state change produced by grading or rectifying an enrollment.
 * Preserves existing regularity when failing/missing a FINAL, and reverses mistaken FINAL approvals
 * on Directivo rectification without losing prior regularity.
 */
export function computeAcademicRecordTransition(
  input: AcademicRecordTransitionInput,
): AcademicRecordMutation {
  const { periodType, modality, previousResult, newResult, newGrade, existingRecord, evaluatedAt } =
    input;

  if (periodType === "FINAL") {
    if (newResult === "APROBADA") {
      return {
        kind: "UPSERT",
        data: {
          status: "APROBADA",
          origin: "FINAL",
          finalGrade: newGrade,
          regularizedAt: existingRecord?.regularizedAt ?? null,
          approvedAt: evaluatedAt,
        },
      };
    }

    // Rectifying a previous FINAL approval back to DESAPROBADA or AUSENTE
    if (
      previousResult === "APROBADA" &&
      existingRecord?.status === "APROBADA" &&
      existingRecord.origin === "FINAL"
    ) {
      if (modality === "REGULAR") {
        return {
          kind: "UPSERT",
          data: {
            status: "REGULARIZADA",
            origin: "CURSADA",
            finalGrade: null,
            regularizedAt: existingRecord.regularizedAt ?? evaluatedAt,
            approvedAt: null,
          },
        };
      }

      return {
        kind: "UPSERT",
        data: {
          status: "DESAPROBADA",
          origin: "FINAL",
          finalGrade: null,
          regularizedAt: null,
          approvedAt: null,
        },
      };
    }

    // Regular failing or absent final: keep AcademicRecord untouched (do not break REGULARIZADA or CURSANDO)
    return { kind: "NOOP" };
  }

  // CURSADA
  if (
    existingRecord?.status === "APROBADA" &&
    previousResult !== "APROBADA" &&
    newResult !== "APROBADA"
  ) {
    // Subject was already approved independently (e.g. EQUIVALENCIA or FINAL); never downgrade it
    return { kind: "NOOP" };
  }

  if (newResult === "APROBADA") {
    return {
      kind: "UPSERT",
      data: {
        status: "APROBADA",
        origin: "CURSADA",
        finalGrade: newGrade,
        regularizedAt: existingRecord?.regularizedAt ?? evaluatedAt,
        approvedAt: evaluatedAt,
      },
    };
  }

  if (newResult === "REGULARIZADA") {
    return {
      kind: "UPSERT",
      data: {
        status: "REGULARIZADA",
        origin: "CURSADA",
        finalGrade: null,
        regularizedAt: existingRecord?.regularizedAt ?? evaluatedAt,
        approvedAt: null,
      },
    };
  }

  if (newResult === "DESAPROBADA") {
    return {
      kind: "UPSERT",
      data: {
        status: "DESAPROBADA",
        origin: "CURSADA",
        finalGrade: null,
        regularizedAt: null,
        approvedAt: null,
      },
    };
  }

  if (newResult === "AUSENTE") {
    return {
      kind: "UPSERT",
      data: {
        status: "LIBRE",
        origin: "CURSADA",
        finalGrade: null,
        regularizedAt: null,
        approvedAt: null,
      },
    };
  }

  return { kind: "NOOP" };
}
