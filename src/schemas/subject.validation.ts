import { z } from "zod";
import { cuid, nameString } from "./common.validation";

export const createSubjectSchema = z
  .object({
    careerId: cuid,
    name: nameString,
    yearLevel: z.number().int().min(1).max(10),
  })
  .strict();

export const updateSubjectSchema = z
  .object({
    name: nameString,
    yearLevel: z.number().int().min(1).max(10),
    isActive: z.boolean(),
  })
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const listSubjectsQuerySchema = z.object({
  careerId: cuid,
});

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;
export type ListSubjectsQuery = z.infer<typeof listSubjectsQuerySchema>;
