// Pure helpers used to validate configuration at startup (no side effects, unit tested).

export const MIN_JWT_SECRET_LENGTH = 32;

/** Known placeholder / sample values that must never be used as a signing secret. */
const PLACEHOLDER_SECRETS = new Set([
  "your_super_secret_jwt_key_here",
  "changeme",
  "secret",
]);

/** Returns the secret when it is acceptable; throws a descriptive (value-free) error otherwise. */
export function validateJwtSecret(secret: string): string {
  if (PLACEHOLDER_SECRETS.has(secret.trim().toLowerCase())) {
    throw new Error(
      "JWT_SECRET is a placeholder value. Generate one with: " +
        `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`,
    );
  }
  if (secret.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(`JWT_SECRET must be at least ${MIN_JWT_SECRET_LENGTH} characters long`);
  }
  return secret;
}

/** Parses a comma-separated origin list, trimming blanks and dropping empty entries. */
export function parseCorsOrigins(raw: string | undefined, fallback: string): string[] {
  const source = raw && raw.trim() !== "" ? raw : fallback;
  return source
    .split(",")
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);
}
