import { z } from "zod";

export const createCourseSchema = z.object({
  name: z.string().min(1),
  year: z.number().int().min(1).max(7),
  division: z.string().min(1),
  academicYear: z.number().int().min(2000),
  institutionId: z.string().min(1),
  students: z.array(z.string().min(1)).optional(),
});

export const updateCourseSchema = z.object({
  name: z.string().min(1).optional(),
  students: z.array(z.string().min(1)).optional(),
  isActive: z.boolean().optional(),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
