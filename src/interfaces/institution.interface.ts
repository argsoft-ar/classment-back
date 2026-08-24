export type InstitutionType = "secondary" | "tertiary";

export interface IInstitution {
  id: string;
  name: string;
  cue: string;
  address: string;
  institutionType: InstitutionType;
  activeAcademicYear: number;
  gradingPeriodOpen: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
