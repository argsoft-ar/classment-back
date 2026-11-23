import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";
import { logger } from "../utils/logger.utils";
import { sendError } from "../utils/response.utils";

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly errors?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

/** Shape of the errors thrown by body-parser (express.json / express.urlencoded). */
interface BodyParserError extends Error {
  type: string;
  status?: number;
}

function isBodyParserError(err: Error): err is BodyParserError {
  return typeof (err as Partial<BodyParserError>).type === "string";
}

export function errorMiddleware(
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  if (isBodyParserError(err)) {
    if (err.type === "entity.parse.failed") {
      logger.warn(`${req.method} ${req.path} - Malformed JSON body`);
      sendError(res, "Malformed JSON", 400);
      return;
    }
    if (err.type === "entity.too.large") {
      logger.warn(`${req.method} ${req.path} - Request body too large`);
      sendError(res, "Request body too large", 413);
      return;
    }
  }

  logger.error(`${req.method} ${req.path} - ${err.message}`, err.stack);

  if (err instanceof AppError) {
    sendError(res, err.message, err.statusCode, err.errors);
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      sendError(res, "Resource already exists", 409);
      return;
    }
    if (err.code === "P2025") {
      sendError(res, "Resource not found", 404);
      return;
    }
    if (err.code === "P2003") {
      sendError(res, "Operation conflicts with related resources", 409);
      return;
    }
  }

  sendError(res, "Internal server error", 500);
}
