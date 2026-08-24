import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.utils";
import { sendError } from "../utils/response.utils";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const authHeader = req.headers["authorization"];

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    sendError(res, "No token provided", 401);
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch {
    sendError(res, "Invalid or expired token", 401);
  }
}
