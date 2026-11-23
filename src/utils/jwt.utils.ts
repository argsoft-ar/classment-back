import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { TokenClaims } from "../types/common.types";

const ALGORITHM = "HS256" as const;

export function signToken(claims: TokenClaims): string {
  const options: jwt.SignOptions = {
    algorithm: ALGORITHM,
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  };
  const payload: TokenClaims = {
    userId: claims.userId,
    role: claims.role,
    email: claims.email,
    tv: claims.tv,
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

/** Verifies signature, algorithm, issuer, audience and expiry; throws on any mismatch. */
export function verifyToken(token: string): Pick<TokenClaims, "userId" | "tv"> {
  const decoded = jwt.verify(token, env.JWT_SECRET, {
    algorithms: [ALGORITHM],
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
  });
  if (
    typeof decoded !== "object" ||
    typeof decoded["userId"] !== "string" ||
    typeof decoded["tv"] !== "number"
  ) {
    throw new Error("Malformed token payload");
  }
  return { userId: decoded["userId"], tv: decoded["tv"] };
}
