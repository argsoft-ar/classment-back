import {
  EnrollmentModality,
  EnrollmentValidationResult,
} from "../domain/correlatives";

export interface IAvailableOffering {
  id: string;
  examDate: Date | null;
  maxCapacity: number | null;
  period: {
    id: string;
    type: "CURSADA" | "FINAL";
    name: string;
    academicYear: number;
    callNumber: number | null;
    startsAt: Date;
    endsAt: Date;
  };
  subject: { id: string; name: string; yearLevel: number };
  teacher: { id: string; firstName: string; lastName: string } | null;
  /** Modality the engine result in `validation` refers to. */
  modality: EnrollmentModality;
  /** "Habilitada" vs "Bloqueada" for the student, computed by the correlatives engine. */
  validation: EnrollmentValidationResult;
  /** For FINAL offerings: result for each modality (Regular / Libre). */
  validationByModality: Partial<Record<EnrollmentModality, EnrollmentValidationResult>>;
  activeEnrollmentId: string | null;
}
