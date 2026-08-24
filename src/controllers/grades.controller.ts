import { Request, Response, NextFunction } from "express";
import { gradesService } from "../services/grades.service";
import { sendSuccess } from "../utils/response.utils";
import { RoleLevel } from "../types/rbac.types";

export const gradesController = {
  async findOrCreate(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const { studentId, subjectId, academicYear } = req.body as {
        studentId: string;
        subjectId: string;
        academicYear: number;
      };
      const institutionId = req.user?.institutionId ?? "";
      const grade = await gradesService.findOrCreate(
        studentId,
        subjectId,
        institutionId,
        academicYear,
      );
      sendSuccess(res, grade, "Grade record retrieved or created", 200);
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
      const academicYear = parseInt(req.query["academicYear"] as string, 10);
      const grades = await gradesService.findByStudent(
        req.params["studentId"] as string,
        academicYear,
      );
      sendSuccess(res, grades);
    } catch (err) {
      next(err);
    }
  },

  async findBySubject(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const academicYear = parseInt(req.query["academicYear"] as string, 10);
      const grades = await gradesService.findBySubject(
        req.params["subjectId"] as string,
        academicYear,
      );
      sendSuccess(res, grades);
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
      const grade = await gradesService.findById(req.params["id"] as string);
      sendSuccess(res, grade);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const institutionId = req.user?.institutionId ?? "";
      const modifiedById = req.user?.userId ?? "";
      const isDirectivo = req.user?.role === RoleLevel.DIRECTIVO;

      const grade = await gradesService.update(
        req.params["id"] as string,
        req.body,
        institutionId,
        modifiedById,
        isDirectivo,
      );
      sendSuccess(res, grade);
    } catch (err) {
      next(err);
    }
  },
};
