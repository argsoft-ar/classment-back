const MAX_EMAIL_KEY_LENGTH = 254;

/**
 * Rate-limit bucket for login attempts: client IP key + normalized email. Runs before body
 * validation, so it must tolerate any body shape.
 */
export function buildLoginRateLimitKey(ipKey: string, body: unknown): string {
  let email = "";
  if (typeof body === "object" && body !== null && "email" in body) {
    const raw = (body as { email: unknown }).email;
    if (typeof raw === "string") email = raw.trim().toLowerCase().slice(0, MAX_EMAIL_KEY_LENGTH);
  }
  return `${ipKey}|${email}`;
}
