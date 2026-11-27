// Pure domain contract for grading enrollments and transitioning academic records.
// No framework or persistence imports allowed here.

export type GradingPeriodType = "CURSADA" | "FINAL";
export type GradingModality = "REGULAR" | "LIBRE";
export type GradingResult = "REGULARIZADA" | "APROBADA" | "DESAPROBADA" | "AUSENTE";

export type GradingAcademicStatus =
  | "CURSANDO"
  | "REGULARIZADA"
  | "APROBADA"
  | "DESAPROBADA"
  | "LIBRE";

export type GradingRecordOrigin = "CURSADA" | "FINAL" | "EQUIVALENCIA" | "CARGA_INICIAL";

export interface GradingInstitutionRules {
  allowsPromotion: boolean;
  passingGrade: number;
  promotionGrade: number | null;
}

export interface GradeEntryInput {
  enrollmentId: string;
  result: GradingResult;
  grade: number | null;
}

export interface GradeValidationError {
  enrollmentId: string;
  code: string;
  message: string;
}

export interface ExistingAcademicRecordSnapshot {
  status: GradingAcademicStatus;
  origin: GradingRecordOrigin;
  finalGrade: number | null;
  regularizedAt: Date | null;
  approvedAt: Date | null;
}

export interface AcademicRecordTransitionInput {
  periodType: GradingPeriodType;
  modality: GradingModality;
  /** Non-null when rectifying an enrollment that was already CERRADA. */
  previousResult: GradingResult | null;
  newResult: GradingResult;
  newGrade: number | null;
  existingRecord: ExistingAcademicRecordSnapshot | null;
  evaluatedAt: Date;
}

export type AcademicRecordMutation =
  | { kind: "NOOP" }
  | {
      kind: "UPSERT";
      data: {
        status: GradingAcademicStatus;
        origin: "CURSADA" | "FINAL";
        finalGrade: number | null;
        regularizedAt: Date | null;
        approvedAt: Date | null;
      };
    };
