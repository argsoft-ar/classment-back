import { z } from "zod";

export const createInstitutionSchema = z.object({
  name: z.string().min(1),
  cue: z.string().min(1),
  address: z.string().min(1),
  institutionType: z.enum(["secondary", "tertiary"]).default("secondary"),
  activeAcademicYear: z.number().int().min(2000),
});

export const updateInstitutionSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  activeAcademicYear: z.number().int().min(2000).optional(),
  gradingPeriodOpen: z.boolean().optional(),
});

export type CreateInstitutionInput = z.infer<typeof createInstitutionSchema>;
export type UpdateInstitutionInput = z.infer<typeof updateInstitutionSchema>;
