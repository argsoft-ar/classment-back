import { z } from "zod";
import { nameString } from "./common.validation";

export const createCareerSchema = z
  .object({
    name: nameString,
    durationYears: z.number().int().min(1).max(10),
  })
  .strict();

export const updateCareerSchema = z
  .object({
    name: nameString,
    durationYears: z.number().int().min(1).max(10),
    isActive: z.boolean(),
  })
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export type CreateCareerInput = z.infer<typeof createCareerSchema>;
export type UpdateCareerInput = z.infer<typeof updateCareerSchema>;
