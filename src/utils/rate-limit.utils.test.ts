import { describe, expect, it } from "vitest";
import { buildLoginRateLimitKey } from "./rate-limit.utils";

describe("buildLoginRateLimitKey", () => {
  it("combines the ip key with the lowercased, trimmed email", () => {
    expect(buildLoginRateLimitKey("1.2.3.4", { email: "  Alumno1@Classment.DEMO " })).toBe(
      "1.2.3.4|alumno1@classment.demo",
    );
  });

  it("treats case variants of the same email as one bucket", () => {
    const a = buildLoginRateLimitKey("::1", { email: "USER@x.test" });
    const b = buildLoginRateLimitKey("::1", { email: "user@x.test" });
    expect(a).toBe(b);
  });

  it("falls back to an empty email for missing or non-string values", () => {
    expect(buildLoginRateLimitKey("1.2.3.4", undefined)).toBe("1.2.3.4|");
    expect(buildLoginRateLimitKey("1.2.3.4", { email: 42 })).toBe("1.2.3.4|");
    expect(buildLoginRateLimitKey("1.2.3.4", "not-an-object")).toBe("1.2.3.4|");
  });

  it("caps the email part to avoid unbounded keys", () => {
    const key = buildLoginRateLimitKey("1.2.3.4", { email: "a".repeat(10_000) });
    expect(key.length).toBe("1.2.3.4|".length + 254);
  });
});
