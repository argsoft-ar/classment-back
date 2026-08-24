import { z } from "zod";

export const createRoleSchema = z.object({
  userId: z.string().min(1),
  institutionId: z.string().min(1),
  level: z.enum(["Directivo", "Preceptor", "Docente", "Alumno"]),
  assignedCourses: z.array(z.string().min(1)).optional(),
  assignedSubjects: z.array(z.string().min(1)).optional(),
});

export const updateRoleSchema = z.object({
  level: z.enum(["Directivo", "Preceptor", "Docente", "Alumno"]).optional(),
  assignedCourses: z.array(z.string().min(1)).optional(),
  assignedSubjects: z.array(z.string().min(1)).optional(),
  isActive: z.boolean().optional(),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
