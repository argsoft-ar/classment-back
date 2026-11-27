import { describe, expect, it } from "vitest";
import { validateGradeEntries, validateGradeEntry } from "./grade-validator";
import { GradingInstitutionRules } from "./types";

const RULES_WITH_PROMOTION: GradingInstitutionRules = {
  allowsPromotion: true,
  passingGrade: 4,
  promotionGrade: 7,
};

const RULES_NO_PROMOTION: GradingInstitutionRules = {
  allowsPromotion: false,
  passingGrade: 4,
  promotionGrade: null,
};

describe("validateGradeEntry", () => {
  describe("grade scale & AUSENTE", () => {
    it("rejects non-integer and out-of-range grades", () => {
      expect(
        validateGradeEntry(
          { enrollmentId: "e1", result: "APROBADA", grade: 7.5 },
          "FINAL",
          RULES_WITH_PROMOTION,
        )?.code,
      ).toBe("INVALID_GRADE_SCALE");

      expect(
        validateGradeEntry(
          { enrollmentId: "e1", result: "DESAPROBADA", grade: 0 },
          "FINAL",
          RULES_WITH_PROMOTION,
        )?.code,
      ).toBe("INVALID_GRADE_SCALE");

      expect(
        validateGradeEntry(
          { enrollmentId: "e1", result: "APROBADA", grade: 11 },
          "FINAL",
          RULES_WITH_PROMOTION,
        )?.code,
      ).toBe("INVALID_GRADE_SCALE");
    });

    it("requires null grade for AUSENTE in both CURSADA and FINAL", () => {
      expect(
        validateGradeEntry(
          { enrollmentId: "e1", result: "AUSENTE", grade: null },
          "FINAL",
          RULES_WITH_PROMOTION,
        ),
      ).toBeNull();

      expect(
        validateGradeEntry(
          { enrollmentId: "e1", result: "AUSENTE", grade: 1 },
          "CURSADA",
          RULES_WITH_PROMOTION,
        )?.code,
      ).toBe("GRADE_NOT_ALLOWED_FOR_ABSENT");
    });
  });

  describe("FINAL period rules", () => {
    it("rejects REGULARIZADA in FINAL", () => {
      expect(
        validateGradeEntry(
          { enrollmentId: "e1", result: "REGULARIZADA", grade: 6 },
          "FINAL",
          RULES_WITH_PROMOTION,
        )?.code,
      ).toBe("INVALID_RESULT_FOR_FINAL");
    });

    it("requires grade >= passingGrade for APROBADA in FINAL", () => {
      expect(
        validateGradeEntry(
          { enrollmentId: "e1", result: "APROBADA", grade: 4 },
          "FINAL",
          RULES_WITH_PROMOTION,
        ),
      ).toBeNull();

      expect(
        validateGradeEntry(
          { enrollmentId: "e1", result: "APROBADA", grade: null },
          "FINAL",
          RULES_WITH_PROMOTION,
        )?.code,
      ).toBe("GRADE_REQUIRED_OR_BELOW_PASSING");

      expect(
        validateGradeEntry(
          { enrollmentId: "e1", result: "APROBADA", grade: 3 },
          "FINAL",
          RULES_WITH_PROMOTION,
        )?.code,
      ).toBe("GRADE_REQUIRED_OR_BELOW_PASSING");
    });

    it("requires grade between 1 and passingGrade - 1 for DESAPROBADA in FINAL", () => {
      expect(
        validateGradeEntry(
          { enrollmentId: "e1", result: "DESAPROBADA", grade: 3 },
          "FINAL",
          RULES_WITH_PROMOTION,
        ),
      ).toBeNull();

      expect(
        validateGradeEntry(
          { enrollmentId: "e1", result: "DESAPROBADA", grade: null },
          "FINAL",
          RULES_WITH_PROMOTION,
        )?.code,
      ).toBe("GRADE_REQUIRED_OR_ABOVE_FAILING");

      expect(
        validateGradeEntry(
          { enrollmentId: "e1", result: "DESAPROBADA", grade: 4 },
          "FINAL",
          RULES_WITH_PROMOTION,
        )?.code,
      ).toBe("GRADE_REQUIRED_OR_ABOVE_FAILING");
    });
  });

  describe("CURSADA period rules", () => {
    it("allows REGULARIZADA with null or >= passingGrade", () => {
      expect(
        validateGradeEntry(
          { enrollmentId: "e1", result: "REGULARIZADA", grade: null },
          "CURSADA",
          RULES_NO_PROMOTION,
        ),
      ).toBeNull();

      expect(
        validateGradeEntry(
          { enrollmentId: "e1", result: "REGULARIZADA", grade: 6 },
          "CURSADA",
          RULES_NO_PROMOTION,
        ),
      ).toBeNull();

      expect(
        validateGradeEntry(
          { enrollmentId: "e1", result: "REGULARIZADA", grade: 3 },
          "CURSADA",
          RULES_NO_PROMOTION,
        )?.code,
      ).toBe("GRADE_BELOW_PASSING");
    });

    it("allows DESAPROBADA with null or < passingGrade", () => {
      expect(
        validateGradeEntry(
          { enrollmentId: "e1", result: "DESAPROBADA", grade: null },
          "CURSADA",
          RULES_NO_PROMOTION,
        ),
      ).toBeNull();

      expect(
        validateGradeEntry(
          { enrollmentId: "e1", result: "DESAPROBADA", grade: 2 },
          "CURSADA",
          RULES_NO_PROMOTION,
        ),
      ).toBeNull();

      expect(
        validateGradeEntry(
          { enrollmentId: "e1", result: "DESAPROBADA", grade: 5 },
          "CURSADA",
          RULES_NO_PROMOTION,
        )?.code,
      ).toBe("GRADE_ABOVE_FAILING");
    });

    it("enforces promotion configuration and promotionGrade for APROBADA in CURSADA", () => {
      expect(
        validateGradeEntry(
          { enrollmentId: "e1", result: "APROBADA", grade: 8 },
          "CURSADA",
          RULES_NO_PROMOTION,
        )?.code,
      ).toBe("PROMOTION_NOT_ALLOWED");

      expect(
        validateGradeEntry(
          { enrollmentId: "e1", result: "APROBADA", grade: 6 },
          "CURSADA",
          RULES_WITH_PROMOTION,
        )?.code,
      ).toBe("GRADE_BELOW_PROMOTION");

      expect(
        validateGradeEntry(
          { enrollmentId: "e1", result: "APROBADA", grade: 7 },
          "CURSADA",
          RULES_WITH_PROMOTION,
        ),
      ).toBeNull();
    });
  });

  describe("validateGradeEntries batch evaluation", () => {
    it("collects errors across multiple rows without short-circuiting", () => {
      const errors = validateGradeEntries(
        [
          { enrollmentId: "e1", result: "APROBADA", grade: 8 },
          { enrollmentId: "e2", result: "APROBADA", grade: 2 },
          { enrollmentId: "e3", result: "AUSENTE", grade: 5 },
        ],
        "FINAL",
        RULES_WITH_PROMOTION,
      );
      expect(errors.map((e) => e.enrollmentId)).toEqual(["e2", "e3"]);
    });
  });
});
