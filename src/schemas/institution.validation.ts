import { z } from "zod";
import { addressString, codeString, nameString } from "./common.validation";

export const updateInstitutionSchema = z
  .object({
    name: nameString,
    cue: codeString,
    address: addressString,
    allowsPromotion: z.boolean(),
    passingGrade: z.number().int().min(1).max(10),
    promotionGrade: z.number().int().min(1).max(10).nullable(),
    validateFinalCorrelatives: z.boolean(),
  })
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export type UpdateInstitutionInput = z.infer<typeof updateInstitutionSchema>;
