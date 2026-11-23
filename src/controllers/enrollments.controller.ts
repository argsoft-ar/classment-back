import { Request, Response, NextFunction } from "express";
import { enrollmentsService } from "../services/enrollments.service";
import { sendSuccess } from "../utils/response.utils";
import { requireUser } from "../utils/access.utils";

export const enrollmentsController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const enrollment = await enrollmentsService.create(req.body, requireUser(req.user));
      sendSuccess(res, enrollment, "Inscripción confirmada", 201);
    } catch (err) {
      next(err);
    }
  },

  async drop(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const enrollment = await enrollmentsService.drop(
        req.params["id"] as string,
        requireUser(req.user),
      );
      sendSuccess(res, enrollment, "Baja registrada");
    } catch (err) {
      next(err);
    }
  },

  async findMine(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const enrollments = await enrollmentsService.findMine(requireUser(req.user));
      sendSuccess(res, enrollments);
    } catch (err) {
      next(err);
    }
  },
};
