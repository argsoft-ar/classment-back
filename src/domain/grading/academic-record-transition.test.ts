import { describe, expect, it } from "vitest";
import { computeAcademicRecordTransition } from "./academic-record-transition";

const EVAL_DATE = new Date("2026-12-10T18:00:00Z");
const OLD_REG_DATE = new Date("2026-11-15T00:00:00Z");
const OLD_APP_DATE = new Date("2026-12-01T00:00:00Z");

describe("computeAcademicRecordTransition", () => {
  describe("FINAL evaluations", () => {
    it("approves subject and preserves prior regularizedAt when passing a FINAL", () => {
      const mutation = computeAcademicRecordTransition({
        periodType: "FINAL",
        modality: "REGULAR",
        previousResult: null,
        newResult: "APROBADA",
        newGrade: 9,
        existingRecord: {
          status: "REGULARIZADA",
          origin: "CURSADA",
          finalGrade: null,
          regularizedAt: OLD_REG_DATE,
          approvedAt: null,
        },
        evaluatedAt: EVAL_DATE,
      });

      expect(mutation).toEqual({
        kind: "UPSERT",
        data: {
          status: "APROBADA",
          origin: "FINAL",
          finalGrade: 9,
          regularizedAt: OLD_REG_DATE,
          approvedAt: EVAL_DATE,
        },
      });
    });

    it("keeps REGULARIZADA untouched when failing or missing a REGULAR FINAL", () => {
      for (const result of ["DESAPROBADA", "AUSENTE"] as const) {
        const mutation = computeAcademicRecordTransition({
          periodType: "FINAL",
          modality: "REGULAR",
          previousResult: null,
          newResult: result,
          newGrade: result === "DESAPROBADA" ? 2 : null,
          existingRecord: {
            status: "REGULARIZADA",
            origin: "CURSADA",
            finalGrade: null,
            regularizedAt: OLD_REG_DATE,
            approvedAt: null,
          },
          evaluatedAt: EVAL_DATE,
        });
        expect(mutation).toEqual({ kind: "NOOP" });
      }
    });

    it("does not overwrite CURSANDO or existing history when failing a LIBRE FINAL", () => {
      const mutation = computeAcademicRecordTransition({
        periodType: "FINAL",
        modality: "LIBRE",
        previousResult: null,
        newResult: "DESAPROBADA",
        newGrade: 2,
        existingRecord: {
          status: "CURSANDO",
          origin: "CURSADA",
          finalGrade: null,
          regularizedAt: null,
          approvedAt: null,
        },
        evaluatedAt: EVAL_DATE,
      });
      expect(mutation).toEqual({ kind: "NOOP" });
    });

    it("reverts FINAL APROBADA back to REGULARIZADA when Directivo rectifies a REGULAR exam", () => {
      const mutation = computeAcademicRecordTransition({
        periodType: "FINAL",
        modality: "REGULAR",
        previousResult: "APROBADA",
        newResult: "DESAPROBADA",
        newGrade: 3,
        existingRecord: {
          status: "APROBADA",
          origin: "FINAL",
          finalGrade: 8,
          regularizedAt: OLD_REG_DATE,
          approvedAt: OLD_APP_DATE,
        },
        evaluatedAt: EVAL_DATE,
      });

      expect(mutation).toEqual({
        kind: "UPSERT",
        data: {
          status: "REGULARIZADA",
          origin: "CURSADA",
          finalGrade: null,
          regularizedAt: OLD_REG_DATE,
          approvedAt: null,
        },
      });
    });

    it("reverts FINAL APROBADA to DESAPROBADA when Directivo rectifies a LIBRE exam", () => {
      const mutation = computeAcademicRecordTransition({
        periodType: "FINAL",
        modality: "LIBRE",
        previousResult: "APROBADA",
        newResult: "AUSENTE",
        newGrade: null,
        existingRecord: {
          status: "APROBADA",
          origin: "FINAL",
          finalGrade: 7,
          regularizedAt: null,
          approvedAt: OLD_APP_DATE,
        },
        evaluatedAt: EVAL_DATE,
      });

      expect(mutation).toEqual({
        kind: "UPSERT",
        data: {
          status: "DESAPROBADA",
          origin: "FINAL",
          finalGrade: null,
          regularizedAt: null,
          approvedAt: null,
        },
      });
    });
  });

  describe("CURSADA evaluations", () => {
    it("sets REGULARIZADA, DESAPROBADA, LIBRE (from AUSENTE) and promoted APROBADA", () => {
      expect(
        computeAcademicRecordTransition({
          periodType: "CURSADA",
          modality: "REGULAR",
          previousResult: null,
          newResult: "REGULARIZADA",
          newGrade: 6,
          existingRecord: {
            status: "CURSANDO",
            origin: "CURSADA",
            finalGrade: null,
            regularizedAt: null,
            approvedAt: null,
          },
          evaluatedAt: EVAL_DATE,
        }),
      ).toEqual({
        kind: "UPSERT",
        data: {
          status: "REGULARIZADA",
          origin: "CURSADA",
          finalGrade: null,
          regularizedAt: EVAL_DATE,
          approvedAt: null,
        },
      });

      expect(
        computeAcademicRecordTransition({
          periodType: "CURSADA",
          modality: "REGULAR",
          previousResult: null,
          newResult: "APROBADA",
          newGrade: 9,
          existingRecord: null,
          evaluatedAt: EVAL_DATE,
        }),
      ).toEqual({
        kind: "UPSERT",
        data: {
          status: "APROBADA",
          origin: "CURSADA",
          finalGrade: 9,
          regularizedAt: EVAL_DATE,
          approvedAt: EVAL_DATE,
        },
      });

      expect(
        computeAcademicRecordTransition({
          periodType: "CURSADA",
          modality: "REGULAR",
          previousResult: null,
          newResult: "AUSENTE",
          newGrade: null,
          existingRecord: null,
          evaluatedAt: EVAL_DATE,
        }),
      ).toEqual({
        kind: "UPSERT",
        data: {
          status: "LIBRE",
          origin: "CURSADA",
          finalGrade: null,
          regularizedAt: null,
          approvedAt: null,
        },
      });
    });

    it("does not downgrade an independently approved subject, but allows rectifying promoted CURSADA", () => {
      const guarded = computeAcademicRecordTransition({
        periodType: "CURSADA",
        modality: "REGULAR",
        previousResult: null,
        newResult: "DESAPROBADA",
        newGrade: 2,
        existingRecord: {
          status: "APROBADA",
          origin: "EQUIVALENCIA",
          finalGrade: 8,
          regularizedAt: null,
          approvedAt: OLD_APP_DATE,
        },
        evaluatedAt: EVAL_DATE,
      });
      expect(guarded).toEqual({ kind: "NOOP" });

      const rectified = computeAcademicRecordTransition({
        periodType: "CURSADA",
        modality: "REGULAR",
        previousResult: "APROBADA",
        newResult: "REGULARIZADA",
        newGrade: 6,
        existingRecord: {
          status: "APROBADA",
          origin: "CURSADA",
          finalGrade: 8,
          regularizedAt: OLD_REG_DATE,
          approvedAt: OLD_APP_DATE,
        },
        evaluatedAt: EVAL_DATE,
      });
      expect(rectified).toEqual({
        kind: "UPSERT",
        data: {
          status: "REGULARIZADA",
          origin: "CURSADA",
          finalGrade: null,
          regularizedAt: OLD_REG_DATE,
          approvedAt: null,
        },
      });
    });
  });
});
