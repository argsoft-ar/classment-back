import { describe, expect, it } from "vitest";
import {
  CorrelativeRequirement,
  EnrollmentValidationInput,
  SubjectStatus,
} from "./types";
import { isPeriodOpen, validateEnrollment } from "./enrollment-validator";

const NOW = new Date("2027-03-01T12:00:00Z");
const OPEN_PERIOD = {
  startsAt: new Date("2027-02-01T00:00:00Z"),
  endsAt: new Date("2027-03-15T23:59:59Z"),
  isActive: true,
};

const A = { id: "A", name: "Matemática I" };
const B = { id: "B", name: "Matemática II" };
const C = { id: "C", name: "Análisis Matemático" };

function rule(
  required: { id: string; name: string },
  requiredStatus: "REGULARIZADA" | "APROBADA",
  appliesTo: "CURSADA" | "FINAL" = "CURSADA",
): CorrelativeRequirement {
  return {
    requiredSubjectId: required.id,
    requiredSubjectName: required.name,
    requiredStatus,
    appliesTo,
  };
}

function input(
  overrides: Partial<EnrollmentValidationInput>,
): EnrollmentValidationInput {
  return {
    now: NOW,
    kind: "CURSADA",
    modality: "REGULAR",
    period: OPEN_PERIOD,
    subject: B,
    statuses: {},
    hasActiveEnrollment: false,
    correlatives: [],
    validateFinalCorrelatives: true,
    ...overrides,
  };
}

describe("Caso 1 — cadena simple de regularidad", () => {
  const correlatives = [rule(A, "REGULARIZADA")];

  it.each<SubjectStatus>(["SIN_CURSAR", "DESAPROBADA"])(
    "rechaza B si A está %s",
    (status) => {
      const statuses: Record<string, SubjectStatus> =
        status === "SIN_CURSAR" ? {} : { A: status };
      const res = validateEnrollment(input({ correlatives, statuses }));
      expect(res.allowed).toBe(false);
      expect(res.reasons).toHaveLength(1);
      expect(res.reasons[0]).toMatchObject({
        code: "CORRELATIVE_NOT_MET",
        requiredSubjectId: "A",
        requiredStatus: "REGULARIZADA",
        currentStatus: status,
        message: `Requiere Matemática I REGULARIZADA (estado actual: ${status})`,
      });
    },
  );

  it("permite B si A está REGULARIZADA", () => {
    const res = validateEnrollment(
      input({ correlatives, statuses: { A: "REGULARIZADA" } }),
    );
    expect(res).toEqual({ allowed: true, reasons: [] });
  });

  it("rechaza B si A está CURSANDO", () => {
    const res = validateEnrollment(
      input({ correlatives, statuses: { A: "CURSANDO" } }),
    );
    expect(res.allowed).toBe(false);
  });
});

describe("Caso 2 — jerarquía APROBADA / EQUIVALENCIA", () => {
  it("A APROBADA (final o equivalencia) satisface REGULARIZADA", () => {
    const res = validateEnrollment(
      input({
        correlatives: [rule(A, "REGULARIZADA")],
        statuses: { A: "APROBADA" },
      }),
    );
    expect(res).toEqual({ allowed: true, reasons: [] });
  });

  it("A REGULARIZADA no satisface APROBADA", () => {
    const res = validateEnrollment(
      input({
        correlatives: [rule(A, "APROBADA")],
        statuses: { A: "REGULARIZADA" },
      }),
    );
    expect(res.allowed).toBe(false);
    expect(res.reasons[0]?.code).toBe("CORRELATIVE_NOT_MET");
  });
});

describe("Caso 3 — múltiples requisitos simultáneos (evaluación exhaustiva)", () => {
  it("C exige A APROBADA y B REGULARIZADA: devuelve ambos motivos", () => {
    const res = validateEnrollment(
      input({
        subject: C,
        correlatives: [rule(A, "APROBADA"), rule(B, "REGULARIZADA")],
        statuses: { A: "REGULARIZADA" },
      }),
    );
    expect(res.allowed).toBe(false);
    expect(res.reasons).toHaveLength(2);
    expect(res.reasons).toEqual([
      expect.objectContaining({
        code: "CORRELATIVE_NOT_MET",
        requiredSubjectId: "A",
        requiredStatus: "APROBADA",
        currentStatus: "REGULARIZADA",
        message: "Requiere Matemática I APROBADA (estado actual: REGULARIZADA)",
      }),
      expect.objectContaining({
        code: "CORRELATIVE_NOT_MET",
        requiredSubjectId: "B",
        requiredStatus: "REGULARIZADA",
        currentStatus: "SIN_CURSAR",
        message: "Requiere Matemática II REGULARIZADA (estado actual: SIN_CURSAR)",
      }),
    ]);
  });

  it("permite C cuando cumple todos los requisitos", () => {
    const res = validateEnrollment(
      input({
        subject: C,
        correlatives: [rule(A, "APROBADA"), rule(B, "REGULARIZADA")],
        statuses: { A: "APROBADA", B: "REGULARIZADA" },
      }),
    );
    expect(res.allowed).toBe(true);
  });

  it("ignora reglas de FINAL al validar una cursada", () => {
    const res = validateEnrollment(
      input({ correlatives: [rule(A, "APROBADA", "FINAL")] }),
    );
    expect(res.allowed).toBe(true);
  });
});

describe("Caso 5 — anti-duplicados / redundancia", () => {
  it("rechaza cursada sobre materia APROBADA", () => {
    const res = validateEnrollment(input({ statuses: { B: "APROBADA" } }));
    expect(res.allowed).toBe(false);
    expect(res.reasons.map((r) => r.code)).toEqual(["ALREADY_APPROVED"]);
  });

  it.each<SubjectStatus>(["REGULARIZADA", "CURSANDO"])(
    "rechaza cursada sobre materia %s",
    (status) => {
      const res = validateEnrollment(input({ statuses: { B: status } }));
      expect(res.allowed).toBe(false);
      expect(res.reasons.map((r) => r.code)).toEqual(["ALREADY_REGULARIZED"]);
    },
  );

  it("rechaza doble inscripción activa a la misma oferta", () => {
    const res = validateEnrollment(input({ hasActiveEnrollment: true }));
    expect(res.allowed).toBe(false);
    expect(res.reasons.map((r) => r.code)).toEqual(["ALREADY_ENROLLED"]);
  });

  it("permite recursar una materia DESAPROBADA", () => {
    const res = validateEnrollment(input({ statuses: { B: "DESAPROBADA" } }));
    expect(res.allowed).toBe(true);
  });
});

describe("Caso 6 — final Regular vs. Libre", () => {
  const finalRules = [rule(A, "APROBADA", "FINAL")];
  const finalInput = (o: Partial<EnrollmentValidationInput>) =>
    input({ kind: "FINAL", correlatives: finalRules, ...o });

  it("Regular exige la propia materia REGULARIZADA", () => {
    const res = finalInput({ modality: "REGULAR", statuses: { A: "APROBADA" } });
    const out = validateEnrollment(res);
    expect(out.allowed).toBe(false);
    expect(out.reasons.map((r) => r.code)).toEqual(["NOT_REGULARIZED_FOR_FINAL"]);
  });

  it("Regular con materia REGULARIZADA y correlativas cumplidas -> permite", () => {
    const out = validateEnrollment(
      finalInput({
        modality: "REGULAR",
        statuses: { A: "APROBADA", B: "REGULARIZADA" },
      }),
    );
    expect(out).toEqual({ allowed: true, reasons: [] });
  });

  it("Libre permite sin cursada previa", () => {
    const out = validateEnrollment(
      finalInput({ modality: "LIBRE", statuses: { A: "APROBADA" } }),
    );
    expect(out).toEqual({ allowed: true, reasons: [] });
  });

  it("Libre se prohíbe si la materia ya está REGULARIZADA", () => {
    const out = validateEnrollment(
      finalInput({
        modality: "LIBRE",
        statuses: { A: "APROBADA", B: "REGULARIZADA" },
      }),
    );
    expect(out.allowed).toBe(false);
    expect(out.reasons.map((r) => r.code)).toEqual(["ALREADY_REGULARIZED"]);
  });

  it.each(["REGULAR", "LIBRE"] as const)(
    "%s se prohíbe si la materia ya está APROBADA",
    (modality) => {
      const out = validateEnrollment(
        finalInput({ modality, statuses: { B: "APROBADA" } }),
      );
      expect(out.reasons.map((r) => r.code)).toEqual(["ALREADY_APPROVED"]);
    },
  );

  it("ambas modalidades respetan validateFinalCorrelatives = true", () => {
    const regular = validateEnrollment(
      finalInput({ modality: "REGULAR", statuses: { A: "REGULARIZADA", B: "REGULARIZADA" } }),
    );
    const libre = validateEnrollment(
      finalInput({ modality: "LIBRE", statuses: { A: "REGULARIZADA" } }),
    );
    for (const out of [regular, libre]) {
      expect(out.allowed).toBe(false);
      expect(out.reasons).toEqual([
        expect.objectContaining({
          code: "CORRELATIVE_NOT_MET",
          requiredSubjectId: "A",
          requiredStatus: "APROBADA",
          currentStatus: "REGULARIZADA",
        }),
      ]);
    }
  });

  it("ambas modalidades omiten correlativas con validateFinalCorrelatives = false", () => {
    const regular = validateEnrollment(
      finalInput({
        modality: "REGULAR",
        validateFinalCorrelatives: false,
        statuses: { B: "REGULARIZADA" },
      }),
    );
    const libre = validateEnrollment(
      finalInput({ modality: "LIBRE", validateFinalCorrelatives: false }),
    );
    expect(regular.allowed).toBe(true);
    expect(libre.allowed).toBe(true);
  });
});

describe("Caso 7 — ventana temporal", () => {
  it("rechaza si now es anterior a startsAt", () => {
    const out = validateEnrollment(
      input({ now: new Date("2027-01-31T23:59:59Z") }),
    );
    expect(out.reasons.map((r) => r.code)).toEqual(["PERIOD_CLOSED"]);
  });

  it("rechaza si now es posterior a endsAt", () => {
    const out = validateEnrollment(
      input({ now: new Date("2027-03-16T00:00:00Z") }),
    );
    expect(out.reasons.map((r) => r.code)).toEqual(["PERIOD_CLOSED"]);
  });

  it("rechaza si el período está inactivo aunque esté en fecha", () => {
    const out = validateEnrollment(
      input({ period: { ...OPEN_PERIOD, isActive: false } }),
    );
    expect(out.reasons.map((r) => r.code)).toEqual(["PERIOD_CLOSED"]);
  });

  it("acepta los bordes inclusivos [startsAt, endsAt]", () => {
    expect(isPeriodOpen(OPEN_PERIOD, OPEN_PERIOD.startsAt)).toBe(true);
    expect(isPeriodOpen(OPEN_PERIOD, OPEN_PERIOD.endsAt)).toBe(true);
  });

  it("isPeriodOpen (usado también para bajas) rechaza fuera de ventana o inactivo", () => {
    expect(isPeriodOpen(OPEN_PERIOD, new Date("2027-04-01T00:00:00Z"))).toBe(false);
    expect(isPeriodOpen({ ...OPEN_PERIOD, isActive: false }, NOW)).toBe(false);
    expect(isPeriodOpen(OPEN_PERIOD, NOW)).toBe(true);
  });
});
