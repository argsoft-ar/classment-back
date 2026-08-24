import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { sendSuccess } from "../utils/response.utils";

export const authController = {
  async register(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const result = await authService.register(req.body);
      sendSuccess(res, result, "User registered successfully", 201);
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await authService.login(req.body);
      sendSuccess(res, result, "Login successful");
    } catch (err) {
      next(err);
    }
  },
};
