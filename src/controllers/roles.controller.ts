import { Request, Response, NextFunction } from "express";
import { rolesService } from "../services/roles.service";
import { sendSuccess } from "../utils/response.utils";

export const rolesController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const role = await rolesService.create(req.body);
      sendSuccess(res, role, "Role created", 201);
    } catch (err) {
      next(err);
    }
  },

  async findByInstitution(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const roles = await rolesService.findByInstitution(
        req.params["institutionId"] as string,
      );
      sendSuccess(res, roles);
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
      const role = await rolesService.findById(req.params["id"] as string);
      sendSuccess(res, role);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const role = await rolesService.update(
        req.params["id"] as string,
        req.body,
      );
      sendSuccess(res, role);
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
      await rolesService.deactivate(req.params["id"] as string);
      sendSuccess(res, null, "Role deactivated");
    } catch (err) {
      next(err);
    }
  },
};
