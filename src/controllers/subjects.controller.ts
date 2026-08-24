import { Request, Response, NextFunction } from "express";
import { subjectsService } from "../services/subjects.service";
import { sendSuccess } from "../utils/response.utils";

export const subjectsController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const subject = await subjectsService.create(req.body);
      sendSuccess(res, subject, "Subject created", 201);
    } catch (err) {
      next(err);
    }
  },

  async findByCourse(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const subjects = await subjectsService.findByCourse(
        req.params["courseId"] as string,
      );
      sendSuccess(res, subjects);
    } catch (err) {
      next(err);
    }
  },

  async findByTeacher(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const subjects = await subjectsService.findByTeacher(
        req.params["teacherId"] as string,
      );
      sendSuccess(res, subjects);
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
      const subject = await subjectsService.findById(
        req.params["id"] as string,
      );
      sendSuccess(res, subject);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const subject = await subjectsService.update(
        req.params["id"] as string,
        req.body,
      );
      sendSuccess(res, subject);
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
      await subjectsService.deactivate(req.params["id"] as string);
      sendSuccess(res, null, "Subject deactivated");
    } catch (err) {
      next(err);
    }
  },
};
