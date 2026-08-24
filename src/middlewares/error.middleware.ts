import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.utils";
import { sendError } from "../utils/response.utils";

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  logger.error(`${req.method} ${req.path} - ${err.message}`, err.stack);

  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode);
    return;
  }

  sendError(res, "Internal server error", 500);
}
