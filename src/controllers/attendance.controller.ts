import { Request, Response, NextFunction } from "express";
import { attendanceService } from "../services/attendance.service";
import { sendSuccess } from "../utils/response.utils";

export const attendanceController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const record = await attendanceService.create({
        ...req.body,
        recordedBy: req.user?.userId,
      });
      sendSuccess(res, record, "Attendance recorded", 201);
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
      const records = await attendanceService.findByCourse(
        req.params["courseId"] as string,
        req.query["from"] as string | undefined,
        req.query["to"] as string | undefined,
      );
      sendSuccess(res, records);
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
      const institutionId = req.user?.institutionId ?? "";
      const academicYear = parseInt(req.query["academicYear"] as string, 10);
      const records = await attendanceService.findByStudent(
        req.params["studentId"] as string,
        institutionId,
        academicYear,
      );
      sendSuccess(res, records);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const record = await attendanceService.update(
        req.params["id"] as string,
        req.body.entries,
      );
      sendSuccess(res, record);
    } catch (err) {
      next(err);
    }
  },
};
