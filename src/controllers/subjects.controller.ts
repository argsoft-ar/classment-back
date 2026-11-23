import { Request, Response, NextFunction } from "express";
import { subjectsService } from "../services/subjects.service";
import { sendSuccess } from "../utils/response.utils";
import { ListSubjectsQuery } from "../schemas/subject.validation";

export const subjectsController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const subject = await subjectsService.create(req.body);
      sendSuccess(res, subject, "Subject created", 201);
    } catch (err) {
      next(err);
    }
  },

  async findByCareer(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { careerId } = req.query as ListSubjectsQuery;
      const subjects = await subjectsService.findByCareer(careerId);
      sendSuccess(res, subjects);
    } catch (err) {
      next(err);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const subject = await subjectsService.findById(req.params["id"] as string);
      sendSuccess(res, subject);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const subject = await subjectsService.update(req.params["id"] as string, req.body);
      sendSuccess(res, subject, "Subject updated");
    } catch (err) {
      next(err);
    }
  },

  async deactivate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await subjectsService.deactivate(req.params["id"] as string);
      sendSuccess(res, null, "Subject deactivated");
    } catch (err) {
      next(err);
    }
  },
};
