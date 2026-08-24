import { Request, Response, NextFunction } from "express";
import { academicRecordsService } from "../services/academic-records.service";
import { sendSuccess } from "../utils/response.utils";

export const academicRecordsController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const record = await academicRecordsService.create(req.body);
      sendSuccess(res, record, "Academic record created", 201);
    } catch (err) {
      next(err);
    }
  },

  async findByStudent(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const records = await academicRecordsService.findByStudent(
        req.params["studentId"] as string,
      );
      sendSuccess(res, records);
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
      const academicYear = parseInt(req.query["academicYear"] as string, 10);
      const records = await academicRecordsService.findByCourse(
        req.params["courseId"] as string,
        academicYear,
      );
      sendSuccess(res, records);
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
      const record = await academicRecordsService.findById(
        req.params["id"] as string,
      );
      sendSuccess(res, record);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const record = await academicRecordsService.update(
        req.params["id"] as string,
        req.body,
      );
      sendSuccess(res, record);
    } catch (err) {
      next(err);
    }
  },
};
