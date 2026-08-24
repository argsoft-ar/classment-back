import { z } from "zod";

export const createAcademicRecordSchema = z.object({
  studentId: z.string().min(1),
  institutionId: z.string().min(1),
  courseId: z.string().min(1),
  academicYear: z.number().int().min(2000),
});

export const updateAcademicRecordSchema = z.object({
  cycleStatus: z
    .enum(["Promovido", "Repite", "Egresado", "En curso"])
    .optional(),
  previas: z.array(z.string().min(1)).optional(),
});

export type CreateAcademicRecordInput = z.infer<
  typeof createAcademicRecordSchema
>;
export type UpdateAcademicRecordInput = z.infer<
  typeof updateAcademicRecordSchema
>;
