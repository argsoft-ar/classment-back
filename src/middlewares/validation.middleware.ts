import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { sendError } from "../utils/response.utils";

export function validateBody(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = (result.error as ZodError).flatten();
      sendError(res, "Validation failed", 400, errors);
      return;
    }

    req.body = result.data;
    next();
  };
}

export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);

    if (!result.success) {
      const errors = (result.error as ZodError).flatten();
      sendError(res, "Validation failed", 400, errors);
      return;
    }

    req.query = result.data as Record<string, string>;
    next();
  };
}
