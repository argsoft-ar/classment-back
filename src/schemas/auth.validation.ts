import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  dni: z.string().min(7).max(10),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  institutionId: z.string().min(1),
  roleLevel: z.enum(["Directivo", "Preceptor", "Docente", "Alumno"]),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  institutionId: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
