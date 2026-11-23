import { z } from "zod";
import { cuid } from "./common.validation";

/** studentId is intentionally absent: it is always taken from the authenticated user. */
export const createEnrollmentSchema = z
  .object({
    offeringId: cuid,
    modality: z.enum(["REGULAR", "LIBRE"]).default("REGULAR"),
  })
  .strict();

export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;
