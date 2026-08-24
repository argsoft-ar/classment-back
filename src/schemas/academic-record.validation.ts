import { z } from "zod";

export const createAcademicRecordSchema = z.object({
  studentId: z.string().length(24),
  institutionId: z.string().length(24),
  courseId: z.string().length(24),
  academicYear: z.number().int().min(2000),
});

export const updateAcademicRecordSchema = z.object({
  cycleStatus: z
    .enum(["Promovido", "Repite", "Egresado", "En curso"])
    .optional(),
  previas: z.array(z.string().length(24)).optional(),
});

export type CreateAcademicRecordInput = z.infer<
  typeof createAcademicRecordSchema
>;
export type UpdateAcademicRecordInput = z.infer<
  typeof updateAcademicRecordSchema
>;
