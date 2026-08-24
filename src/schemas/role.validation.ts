import { z } from "zod";

export const createRoleSchema = z.object({
  userId: z.string().length(24),
  institutionId: z.string().length(24),
  level: z.enum(["Directivo", "Preceptor", "Docente", "Alumno"]),
  assignedCourses: z.array(z.string().length(24)).optional(),
  assignedSubjects: z.array(z.string().length(24)).optional(),
});

export const updateRoleSchema = z.object({
  level: z.enum(["Directivo", "Preceptor", "Docente", "Alumno"]).optional(),
  assignedCourses: z.array(z.string().length(24)).optional(),
  assignedSubjects: z.array(z.string().length(24)).optional(),
  isActive: z.boolean().optional(),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
