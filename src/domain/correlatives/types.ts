// Pure domain contract (README §7). No framework or persistence imports allowed here.

export type SubjectStatus =
  | "SIN_CURSAR"
  | "CURSANDO"
  | "REGULARIZADA"
  | "APROBADA"
  | "DESAPROBADA";

export type RequiredStatus = "REGULARIZADA" | "APROBADA";

export type CorrelativeScope = "CURSADA" | "FINAL";

export type EnrollmentKind = "CURSADA" | "FINAL";

export type EnrollmentModality = "REGULAR" | "LIBRE";

export type RejectionCode =
  | "PERIOD_CLOSED"
  | "ALREADY_APPROVED"
  | "ALREADY_ENROLLED"
  | "ALREADY_REGULARIZED"
  | "NOT_REGULARIZED_FOR_FINAL"
  | "CORRELATIVE_NOT_MET";

export interface RejectionReason {
  code: RejectionCode;
  message: string;
  requiredSubjectId?: string;
  requiredSubjectName?: string;
  requiredStatus?: RequiredStatus;
  currentStatus?: SubjectStatus;
}

export interface EnrollmentValidationResult {
  allowed: boolean;
  reasons: RejectionReason[];
}

export interface PeriodWindow {
  startsAt: Date;
  endsAt: Date;
  isActive: boolean;
}

export interface CorrelativeRequirement {
  requiredSubjectId: string;
  requiredSubjectName: string;
  appliesTo: CorrelativeScope;
  requiredStatus: RequiredStatus;
}

export interface EnrollmentValidationInput {
  now: Date;
  kind: EnrollmentKind;
  /** Only meaningful when kind = FINAL. Cursadas are always REGULAR. */
  modality: EnrollmentModality;
  period: PeriodWindow;
  subject: { id: string; name: string };
  /** Current status per subjectId. Missing subjects are treated as SIN_CURSAR. */
  statuses: Readonly<Record<string, SubjectStatus>>;
  /** True when the student already has an ACTIVA enrollment in the same offering. */
  hasActiveEnrollment: boolean;
  /** Rules of the target subject (any scope); the engine filters by `kind`. */
  correlatives: readonly CorrelativeRequirement[];
  validateFinalCorrelatives: boolean;
}

export interface CorrelativeEdge {
  subjectId: string;
  requiredSubjectId: string;
}

export interface CycleDetectionResult {
  hasCycle: boolean;
  /** Subject ids forming the cycle, starting and ending at the same id. Empty if none. */
  path: string[];
}
