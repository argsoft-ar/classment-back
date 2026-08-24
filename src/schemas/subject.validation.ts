import { z } from "zod";

export const createSubjectSchema = z.object({
  name: z.string().min(1),
  courseId: z.string().min(1),
  teacherId: z.string().min(1),
  institutionId: z.string().min(1),
  academicYear: z.number().int().min(2000),
});

export const updateSubjectSchema = z.object({
  name: z.string().min(1).optional(),
  teacherId: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;
