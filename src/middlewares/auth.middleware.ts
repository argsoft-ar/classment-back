import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.utils";
import { sendError } from "../utils/response.utils";
import { authService } from "../services/auth.service";

const INVALID_TOKEN = "Invalid or expired token";

/**
 * Verifies the JWT and re-loads the principal from the DB on every request, so role changes,
 * deactivations and password changes (tokenVersion bump) take effect immediately.
 */
export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    sendError(res, "No token provided", 401);
    return;
  }

  let claims: ReturnType<typeof verifyToken>;
  try {
    claims = verifyToken(authHeader.slice(7));
  } catch {
    sendError(res, INVALID_TOKEN, 401);
    return;
  }

  try {
    const principal = await authService.resolvePrincipal(claims.userId, claims.tv);
    if (!principal) {
      sendError(res, INVALID_TOKEN, 401);
      return;
    }
    req.user = principal;
    next();
  } catch (err) {
    next(err);
  }
}
