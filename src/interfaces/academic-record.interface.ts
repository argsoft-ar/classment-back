export type ProgressStatus =
  | "SIN_CURSAR"
  | "CURSANDO"
  | "REGULARIZADA"
  | "APROBADA"
  | "DESAPROBADA"
  | "LIBRE";

export type RecordOriginValue =
  | "CURSADA"
  | "FINAL"
  | "EQUIVALENCIA"
  | "CARGA_INICIAL";

export interface ISubjectProgress {
  subjectId: string;
  name: string;
  yearLevel: number;
  status: ProgressStatus;
  origin: RecordOriginValue | null;
  finalGrade: number | null;
  regularizedAt: Date | null;
  approvedAt: Date | null;
}

export interface IYearProgress {
  yearLevel: number;
  subjects: ISubjectProgress[];
}

export interface IProgressSummary {
  total: number;
  aprobadas: number;
  regularizadas: number;
  cursando: number;
  pendientes: number;
}

export interface ICareerProgress {
  careerId: string;
  careerName: string;
  studyPlanId: string;
  cohortYear: number;
  summary: IProgressSummary;
  years: IYearProgress[];
}

export interface IStudentProgress {
  student: {
    id: string;
    dni: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  careers: ICareerProgress[];
}
