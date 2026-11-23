import { Request, Response, NextFunction } from "express";
import { careersService } from "../services/careers.service";
import { sendSuccess } from "../utils/response.utils";

export const careersController = {
  async findAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const careers = await careersService.findAll();
      sendSuccess(res, careers);
    } catch (err) {
      next(err);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const career = await careersService.findById(req.params["id"] as string);
      sendSuccess(res, career);
    } catch (err) {
      next(err);
    }
  },

  async getSubjects(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const curriculum = await careersService.getCurriculum(req.params["id"] as string);
      sendSuccess(res, curriculum);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const career = await careersService.create(req.body);
      sendSuccess(res, career, "Career created", 201);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const career = await careersService.update(req.params["id"] as string, req.body);
      sendSuccess(res, career, "Career updated");
    } catch (err) {
      next(err);
    }
  },

  async deactivate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await careersService.deactivate(req.params["id"] as string);
      sendSuccess(res, null, "Career deactivated");
    } catch (err) {
      next(err);
    }
  },
};
