import { z } from "zod";
import { cuid } from "./common.validation";

/** "SIN_CURSAR" in the grid removes the record (undo a previous mark). */
export const gridStatusValues = [
  "SIN_CURSAR",
  "REGULARIZADA",
  "APROBADA",
  "DESAPROBADA",
  "LIBRE",
] as const;

const gridEntrySchema = z
  .object({
    subjectId: cuid,
    status: z.enum(gridStatusValues),
    origin: z.enum(["EQUIVALENCIA", "CARGA_INICIAL"]).default("CARGA_INICIAL"),
    finalGrade: z.number().min(1).max(10).nullable().optional(),
  })
  .strict()
  .refine((e) => e.origin !== "EQUIVALENCIA" || e.status === "APROBADA", {
    message: "EQUIVALENCIA can only be registered as APROBADA",
    path: ["origin"],
  })
  .refine((e) => e.finalGrade == null || e.status === "APROBADA", {
    message: "finalGrade is only allowed for APROBADA",
    path: ["finalGrade"],
  });

export const bulkUpsertRecordsSchema = z
  .object({
    records: z.array(gridEntrySchema).min(1).max(200),
  })
  .strict()
  .refine(
    (data) =>
      new Set(data.records.map((r) => r.subjectId)).size === data.records.length,
    { message: "Duplicated subjectId in records", path: ["records"] },
  );

export type GridEntryInput = z.infer<typeof gridEntrySchema>;
export type BulkUpsertRecordsInput = z.infer<typeof bulkUpsertRecordsSchema>;
