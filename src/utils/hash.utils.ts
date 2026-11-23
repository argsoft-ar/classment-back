import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { env } from "../config/env";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, env.BCRYPT_ROUNDS);
}

export async function comparePassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// Hash of a random throwaway value with the same cost factor as real hashes. Computed once at
// startup and compared against when the account has no usable hash, so every login attempt
// costs one bcrypt comparison (no timing-based user enumeration).
const dummyHashPromise: Promise<string> = bcrypt.hash(
  randomBytes(32).toString("hex"),
  env.BCRYPT_ROUNDS,
);

/** Runs a full bcrypt comparison against `hash`, or against the dummy hash when it is null. */
export async function comparePasswordConstantTime(
  plain: string,
  hash: string | null | undefined,
): Promise<boolean> {
  const target = hash ?? (await dummyHashPromise);
  const matches = await bcrypt.compare(plain, target);
  return matches && hash != null;
}
