import { Response } from "express";
import { ApiResponse } from "../types/common.types";

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "OK",
  statusCode = 200,
): void {
  const body: ApiResponse<T> = { success: true, message, data };
  res.status(statusCode).json(body);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 500,
  errors?: unknown,
): void {
  const body: ApiResponse = { success: false, message, errors };
  res.status(statusCode).json(body);
}
