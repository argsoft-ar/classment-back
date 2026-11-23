import { describe, expect, it } from "vitest";
import { detectCycle } from "./cycle-detector";

describe("Caso 4 — detección de ciclos", () => {
  it("rechaza A -> A", () => {
    const res = detectCycle([], { subjectId: "A", requiredSubjectId: "A" });
    expect(res).toEqual({ hasCycle: true, path: ["A", "A"] });
  });

  it("rechaza A -> B -> A", () => {
    const rules = [{ subjectId: "B", requiredSubjectId: "A" }];
    const res = detectCycle(rules, { subjectId: "A", requiredSubjectId: "B" });
    expect(res).toEqual({ hasCycle: true, path: ["A", "B", "A"] });
  });

  it("rechaza A -> B -> C -> A", () => {
    const rules = [
      { subjectId: "B", requiredSubjectId: "C" },
      { subjectId: "C", requiredSubjectId: "A" },
    ];
    const res = detectCycle(rules, { subjectId: "A", requiredSubjectId: "B" });
    expect(res).toEqual({ hasCycle: true, path: ["A", "B", "C", "A"] });
  });

  it("acepta un DAG válido (diamante) sin falsos positivos", () => {
    const rules = [
      { subjectId: "D", requiredSubjectId: "B" },
      { subjectId: "D", requiredSubjectId: "C" },
      { subjectId: "B", requiredSubjectId: "A" },
      { subjectId: "C", requiredSubjectId: "A" },
    ];
    const res = detectCycle(rules, { subjectId: "E", requiredSubjectId: "D" });
    expect(res).toEqual({ hasCycle: false, path: [] });
    const res2 = detectCycle(rules, { subjectId: "D", requiredSubjectId: "A" });
    expect(res2.hasCycle).toBe(false);
  });
});
