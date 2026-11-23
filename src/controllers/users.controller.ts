import { Request, Response, NextFunction } from "express";
import { usersService } from "../services/users.service";
import { sendSuccess } from "../utils/response.utils";
import { requireUser } from "../utils/access.utils";
import { ListUsersQuery } from "../schemas/user.validation";

export const usersController = {
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await usersService.findAll(req.query as ListUsersQuery);
      sendSuccess(res, users);
    } catch (err) {
      next(err);
    }
  },

  async me(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await usersService.findById(requireUser(req.user).userId);
      sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await usersService.findById(req.params["id"] as string);
      sendSuccess(res, user);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await usersService.create(req.body, requireUser(req.user));
      sendSuccess(res, user, "User created", 201);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await usersService.update(
        req.params["id"] as string,
        req.body,
        requireUser(req.user),
      );
      sendSuccess(res, user, "User updated");
    } catch (err) {
      next(err);
    }
  },

  async deactivate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await usersService.deactivate(req.params["id"] as string, requireUser(req.user));
      sendSuccess(res, null, "User deactivated");
    } catch (err) {
      next(err);
    }
  },
};
