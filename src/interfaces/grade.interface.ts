export interface IPreInforme {
  value: string;
  excludeFromReport: boolean;
}

export interface ICuatrimestre {
  preInforme: IPreInforme;
  notaFinalCuatrimestre: number | null;
}

export interface IGradeModificationLog {
  id: string;
  gradeId: string;
  modifiedById: string;
  previousValue: unknown;
  newValue: unknown;
  modifiedAt: Date;
}

export interface IGrade {
  id: string;
  studentId: string;
  subjectId: string;
  institutionId: string;
  academicYear: number;
  firstQuarterPreInforme: string;
  firstQuarterExcludeFromReport: boolean;
  firstQuarterFinalGrade: number | null;
  secondQuarterPreInforme: string;
  secondQuarterExcludeFromReport: boolean;
  secondQuarterFinalGrade: number | null;
  finalYearGrade: number | null;
  createdAt: Date;
  updatedAt: Date;
}
