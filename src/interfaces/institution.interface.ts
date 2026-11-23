export interface IInstitutionConfig {
  id: string;
  name: string;
  cue: string;
  address: string;
  levelType: "TERTIARY";
  allowsPromotion: boolean;
  passingGrade: number;
  promotionGrade: number | null;
  validateFinalCorrelatives: boolean;
  createdAt: Date;
  updatedAt: Date;
}
