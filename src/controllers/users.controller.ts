import { Request, Response, NextFunction } from "express";
import { usersService } from "../services/users.service";
import { sendSuccess } from "../utils/response.utils";

export const usersController = {
  async findAll(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const users = await usersService.findAll();
      sendSuccess(res, users);
    } catch (err) {
      next(err);
    }
  },

  async findById(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const user = await usersService.findById(req.params["id"] as string);
      sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await usersService.update(
        req.params["id"] as string,
        req.body,
      );
      sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  },

  async deactivate(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await usersService.deactivate(req.params["id"] as string);
      sendSuccess(res, null, "User deactivated");
    } catch (err) {
      next(err);
    }
  },
};
