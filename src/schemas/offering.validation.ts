import { z } from "zod";
import { boundedDate, cuid } from "./common.validation";

export const createOfferingSchema = z
  .object({
    periodId: cuid,
    subjectId: cuid,
    teacherId: cuid.nullable().optional(),
    examDate: boundedDate.nullable().optional(),
    maxCapacity: z.number().int().min(1).max(10_000).nullable().optional(),
  })
  .strict();

export const updateOfferingSchema = z
  .object({
    teacherId: cuid.nullable(),
    examDate: boundedDate.nullable(),
    maxCapacity: z.number().int().min(1).max(10_000).nullable(),
  })
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const listOfferingsQuerySchema = z.object({
  periodId: cuid.optional(),
  subjectId: cuid.optional(),
});

export type CreateOfferingInput = z.infer<typeof createOfferingSchema>;
export type UpdateOfferingInput = z.infer<typeof updateOfferingSchema>;
export type ListOfferingsQuery = z.infer<typeof listOfferingsQuerySchema>;
