export type CycleStatus = "Promovido" | "Repite" | "Egresado" | "EnCurso";

export interface IAcademicRecord {
  id: string;
  studentId: string;
  institutionId: string;
  courseId: string;
  academicYear: number;
  cycleStatus: CycleStatus;
  createdAt: Date;
  updatedAt: Date;
}
