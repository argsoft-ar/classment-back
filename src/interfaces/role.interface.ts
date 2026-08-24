import { RoleLevel } from "../types/rbac.types";

export interface IRole {
  id: string;
  userId: string;
  institutionId: string;
  level: RoleLevel;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRoleWithRelations extends IRole {
  assignedCourses: { courseId: string }[];
  assignedSubjects: { subjectId: string }[];
}
