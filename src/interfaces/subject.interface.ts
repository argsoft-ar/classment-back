export interface ICorrelativeSummary {
  id: string;
  requiredSubjectId: string;
  requiredSubjectName: string;
  appliesTo: "CURSADA" | "FINAL";
  requiredStatus: "REGULARIZADA" | "APROBADA";
}

export interface ISubjectSummary {
  id: string;
  name: string;
  yearLevel: number;
  regime: "ANNUAL";
  isActive: boolean;
  correlatives: ICorrelativeSummary[];
}

export interface ISubjectsByYear {
  yearLevel: number;
  subjects: ISubjectSummary[];
}

export interface ICareerCurriculum {
  career: { id: string; name: string; durationYears: number };
  studyPlan: { id: string; code: string; year: number };
  years: ISubjectsByYear[];
}
