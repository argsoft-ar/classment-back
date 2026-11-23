import { z } from "zod";
import { boundedDate, boundedYear, nameString } from "./common.validation";

const periodBase = z
  .object({
    type: z.enum(["CURSADA", "FINAL"]),
    name: nameString,
    academicYear: boundedYear,
    callNumber: z.number().int().min(1).max(2).nullable().optional(),
    startsAt: boundedDate,
    endsAt: boundedDate,
    isActive: z.boolean().optional(),
  })
  .strict();

export const createPeriodSchema = periodBase
  .refine((p) => p.endsAt > p.startsAt, {
    message: "endsAt must be after startsAt",
    path: ["endsAt"],
  })
  .refine((p) => (p.type === "FINAL" ? p.callNumber != null : p.callNumber == null), {
    message: "callNumber (1 or 2) is required for FINAL periods and must be empty for CURSADA",
    path: ["callNumber"],
  });

export const updatePeriodSchema = periodBase
  .omit({ type: true })
  .partial()
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const listPeriodsQuerySchema = z.object({
  type: z.enum(["CURSADA", "FINAL"]).optional(),
  academicYear: z.coerce.number().int().optional(),
});

export type CreatePeriodInput = z.infer<typeof createPeriodSchema>;
export type UpdatePeriodInput = z.infer<typeof updatePeriodSchema>;
export type ListPeriodsQuery = z.infer<typeof listPeriodsQuerySchema>;
