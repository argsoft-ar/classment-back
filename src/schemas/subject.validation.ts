import { z } from "zod";

export const createSubjectSchema = z.object({
  name: z.string().min(1),
  courseId: z.string().length(24),
  teacherId: z.string().length(24),
  institutionId: z.string().length(24),
  academicYear: z.number().int().min(2000),
});

export const updateSubjectSchema = z.object({
  name: z.string().min(1).optional(),
  teacherId: z.string().length(24).optional(),
  isActive: z.boolean().optional(),
});

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;
