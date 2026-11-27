import {
  GradeEntryInput,
  GradeValidationError,
  GradingInstitutionRules,
  GradingPeriodType,
} from "./types";

const MIN_GRADE = 1;
const MAX_GRADE = 10;

function makeError(
  enrollmentId: string,
  code: string,
  message: string,
): GradeValidationError {
  return { enrollmentId, code, message };
}

/** Validates a single grade entry against period type and institution rules. */
export function validateGradeEntry(
  entry: GradeEntryInput,
  periodType: GradingPeriodType,
  rules: GradingInstitutionRules,
): GradeValidationError | null {
  const { enrollmentId, result, grade } = entry;

  if (grade !== null && (!Number.isInteger(grade) || grade < MIN_GRADE || grade > MAX_GRADE)) {
    return makeError(
      enrollmentId,
      "INVALID_GRADE_SCALE",
      `La nota debe ser un entero entre ${MIN_GRADE} y ${MAX_GRADE}`,
    );
  }

  if (result === "AUSENTE") {
    if (grade !== null) {
      return makeError(
        enrollmentId,
        "GRADE_NOT_ALLOWED_FOR_ABSENT",
        "Un alumno ausente no puede tener nota numérica",
      );
    }
    return null;
  }

  if (periodType === "FINAL") {
    if (result === "REGULARIZADA") {
      return makeError(
        enrollmentId,
        "INVALID_RESULT_FOR_FINAL",
        "En una mesa de final solo se permite Aprobada, Desaprobada o Ausente",
      );
    }

    if (result === "APROBADA") {
      if (grade === null || grade < rules.passingGrade) {
        return makeError(
          enrollmentId,
          "GRADE_REQUIRED_OR_BELOW_PASSING",
          `Para aprobar el final la nota debe ser un entero entre ${rules.passingGrade} y ${MAX_GRADE}`,
        );
      }
      return null;
    }

    // DESAPROBADA in FINAL
    if (grade === null || grade >= rules.passingGrade) {
      return makeError(
        enrollmentId,
        "GRADE_REQUIRED_OR_ABOVE_FAILING",
        `Para desaprobar el final la nota debe ser un entero entre ${MIN_GRADE} y ${rules.passingGrade - 1}`,
      );
    }
    return null;
  }

  // CURSADA
  if (result === "APROBADA") {
    if (!rules.allowsPromotion || rules.promotionGrade === null) {
      return makeError(
        enrollmentId,
        "PROMOTION_NOT_ALLOWED",
        "La institución no tiene habilitada la promoción directa en cursadas",
      );
    }
    if (grade === null || grade < rules.promotionGrade) {
      return makeError(
        enrollmentId,
        "GRADE_BELOW_PROMOTION",
        `Para promocionar la cursada la nota debe ser un entero entre ${rules.promotionGrade} y ${MAX_GRADE}`,
      );
    }
    return null;
  }

  if (result === "REGULARIZADA") {
    if (grade !== null && grade < rules.passingGrade) {
      return makeError(
        enrollmentId,
        "GRADE_BELOW_PASSING",
        `Si cargás nota de regularización, debe ser al menos ${rules.passingGrade}`,
      );
    }
    return null;
  }

  // DESAPROBADA in CURSADA
  if (grade !== null && grade >= rules.passingGrade) {
    return makeError(
      enrollmentId,
      "GRADE_ABOVE_FAILING",
      `Si cargás nota de desaprobación, debe ser menor a ${rules.passingGrade}`,
    );
  }

  return null;
}

/** Evaluates all entries exhaustively and returns every validation error found. */
export function validateGradeEntries(
  entries: readonly GradeEntryInput[],
  periodType: GradingPeriodType,
  rules: GradingInstitutionRules,
): GradeValidationError[] {
  const errors: GradeValidationError[] = [];
  for (const entry of entries) {
    const err = validateGradeEntry(entry, periodType, rules);
    if (err) errors.push(err);
  }
  return errors;
}
