import { Request, Response, NextFunction } from "express";
import { academicRecordsService } from "../services/academic-records.service";
import { sendSuccess } from "../utils/response.utils";
import { requireUser } from "../utils/access.utils";

export const academicRecordsController = {
  async findMine(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const actor = requireUser(req.user);
      const progress = await academicRecordsService.getStudentProgress(actor.userId, actor);
      sendSuccess(res, progress);
    } catch (err) {
      next(err);
    }
  },

  async findByStudent(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const progress = await academicRecordsService.getStudentProgress(
        req.params["studentId"] as string,
        requireUser(req.user),
      );
      sendSuccess(res, progress);
    } catch (err) {
      next(err);
    }
  },

  async bulkUpsert(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const progress = await academicRecordsService.bulkUpsert(
        req.params["studentId"] as string,
        req.body,
        requireUser(req.user),
      );
      sendSuccess(res, progress, "Academic records updated");
    } catch (err) {
      next(err);
    }
  },
};
