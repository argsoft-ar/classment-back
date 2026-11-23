import { describe, expect, it } from "vitest";
import { MIN_JWT_SECRET_LENGTH, parseCorsOrigins, validateJwtSecret } from "./env.utils";

describe("validateJwtSecret", () => {
  it("rejects the documented placeholder", () => {
    expect(() => validateJwtSecret("your_super_secret_jwt_key_here")).toThrow(/placeholder/);
  });

  it("rejects secrets shorter than the minimum length", () => {
    expect(() => validateJwtSecret("a".repeat(MIN_JWT_SECRET_LENGTH - 1))).toThrow(/at least/);
  });

  it("accepts a long random secret", () => {
    const secret = "x".repeat(MIN_JWT_SECRET_LENGTH);
    expect(validateJwtSecret(secret)).toBe(secret);
  });

  it("never includes the secret value in the error message", () => {
    const short = "s3cr3t-value";
    try {
      validateJwtSecret(short);
    } catch (e) {
      expect((e as Error).message).not.toContain(short);
    }
  });
});

describe("parseCorsOrigins", () => {
  it("splits and trims a comma-separated list", () => {
    expect(parseCorsOrigins(" http://a.test , https://b.test,, ", "http://x")).toEqual([
      "http://a.test",
      "https://b.test",
    ]);
  });

  it("uses the fallback when unset or blank", () => {
    expect(parseCorsOrigins(undefined, "http://localhost:5173")).toEqual(["http://localhost:5173"]);
    expect(parseCorsOrigins("   ", "http://localhost:5173")).toEqual(["http://localhost:5173"]);
  });
});
