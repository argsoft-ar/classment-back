export type UserRoleValue = "SuperAdmin" | "Directivo" | "Docente" | "Alumno";
export type UserStatusValue = "INVITED" | "ACTIVE" | "INACTIVE";

export interface IUserCareer {
  studyPlanId: string;
  studyPlanCode: string;
  careerId: string;
  careerName: string;
  cohortYear: number;
}

export interface IUserPublic {
  id: string;
  email: string;
  dni: string;
  firstName: string;
  lastName: string;
  role: UserRoleValue;
  status: UserStatusValue;
  careers: IUserCareer[];
  createdAt: Date;
}

export interface ILoginResult {
  token: string;
  user: Pick<IUserPublic, "id" | "email" | "firstName" | "lastName" | "role">;
}
