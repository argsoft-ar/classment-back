import { Request, Response, NextFunction } from "express";
import { enrollmentPeriodsService } from "../services/enrollment-periods.service";
import { sendSuccess } from "../utils/response.utils";
import { ListPeriodsQuery } from "../schemas/enrollment-period.validation";

export const enrollmentPeriodsController = {
  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const periods = await enrollmentPeriodsService.findAll(
        req.query as unknown as ListPeriodsQuery,
      );
      sendSuccess(res, periods);
    } catch (err) {
      next(err);
    }
  },

  async findOpen(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const periods = await enrollmentPeriodsService.findOpen();
      sendSuccess(res, periods);
    } catch (err) {
      next(err);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const period = await enrollmentPeriodsService.findById(req.params["id"] as string);
      sendSuccess(res, period);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const period = await enrollmentPeriodsService.create(req.body);
      sendSuccess(res, period, "Enrollment period created", 201);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const period = await enrollmentPeriodsService.update(req.params["id"] as string, req.body);
      sendSuccess(res, period, "Enrollment period updated");
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await enrollmentPeriodsService.delete(req.params["id"] as string);
      sendSuccess(res, null, "Enrollment period deleted");
    } catch (err) {
      next(err);
    }
  },
};
