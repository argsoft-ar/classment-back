import { z } from "zod";
import { cuid } from "./common.validation";

// Self-references are rejected by the service (422) through the domain cycle detector.
export const createCorrelativeSchema = z
  .object({
    subjectId: cuid,
    requiredSubjectId: cuid,
    appliesTo: z.enum(["CURSADA", "FINAL"]),
    requiredStatus: z.enum(["REGULARIZADA", "APROBADA"]),
  })
  .strict();

export type CreateCorrelativeInput = z.infer<typeof createCorrelativeSchema>;
