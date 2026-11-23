import { z } from "zod";

// ── Shared input limits ──────────────────────────────────────────────────────

export const LIMITS = {
  NAME: 120,
  EMAIL: 254,
  /** bcrypt only uses the first 72 bytes; longer inputs are rejected instead of truncated. */
  PASSWORD: 72,
  ADDRESS: 200,
  CODE: 50,
  /** Allowed distance (in years) between "now" and period / exam dates. */
  DATE_RANGE_YEARS: 5,
} as const;

export const cuid = z.string().cuid();
export const nameString = z.string().min(1).max(LIMITS.NAME);
export const emailString = z.string().max(LIMITS.EMAIL).email();
export const passwordString = z.string().min(8).max(LIMITS.PASSWORD);
export const codeString = z.string().min(1).max(LIMITS.CODE);
export const addressString = z.string().min(1).max(LIMITS.ADDRESS);

const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;

/** Date within ±LIMITS.DATE_RANGE_YEARS of the moment of validation. */
export const boundedDate = z.coerce.date().refine(
  (d) => Math.abs(d.getTime() - Date.now()) <= LIMITS.DATE_RANGE_YEARS * YEAR_MS,
  { message: `Date must be within ${LIMITS.DATE_RANGE_YEARS} years of today` },
);

/** Year within ±LIMITS.DATE_RANGE_YEARS of the current year. */
export const boundedYear = z
  .number()
  .int()
  .refine((y) => Math.abs(y - new Date().getFullYear()) <= LIMITS.DATE_RANGE_YEARS, {
    message: `Year must be within ${LIMITS.DATE_RANGE_YEARS} years of the current year`,
  });

// ── Route params ─────────────────────────────────────────────────────────────

export const idParamSchema = z.object({
  id: cuid,
});

export const studentIdParamSchema = z.object({
  studentId: cuid,
});

export const subjectIdParamSchema = z.object({
  subjectId: cuid,
});

export const queryBoolean = z
  .enum(["true", "false"])
  .transform((v) => v === "true");

export type IdParam = z.infer<typeof idParamSchema>;
