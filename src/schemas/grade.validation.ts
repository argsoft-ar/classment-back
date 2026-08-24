import { z } from "zod";

const preInformeSchema = z.object({
  value: z.string().optional(),
  excludeFromReport: z.boolean().optional(),
});

const cuatrimestreSchema = z.object({
  preInforme: preInformeSchema.optional(),
  notaFinalCuatrimestre: z.number().min(1).max(10).nullable().optional(),
});

export const updateGradeSchema = z.object({
  firstQuarter: cuatrimestreSchema.optional(),
  secondQuarter: cuatrimestreSchema.optional(),
  finalYearGrade: z.number().min(1).max(10).nullable().optional(),
});

export const findOrCreateGradeSchema = z.object({
  studentId: z.string().min(1),
  subjectId: z.string().min(1),
  academicYear: z.number().int().min(2000),
});

export type UpdateGradeInput = z.infer<typeof updateGradeSchema>;
export type FindOrCreateGradeInput = z.infer<typeof findOrCreateGradeSchema>;
