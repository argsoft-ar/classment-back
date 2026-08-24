import { Request, Response, NextFunction } from "express";
import { coursesService } from "../services/courses.service";
import { sendSuccess } from "../utils/response.utils";

export const coursesController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const course = await coursesService.create(req.body);
      sendSuccess(res, course, "Course created", 201);
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
      const academicYear = req.query["academicYear"]
        ? parseInt(req.query["academicYear"] as string, 10)
        : undefined;
      const courses = await coursesService.findByInstitution(
        req.params["institutionId"] as string,
        academicYear,
      );
      sendSuccess(res, courses);
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
      const course = await coursesService.findById(req.params["id"] as string);
      sendSuccess(res, course);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const course = await coursesService.update(
        req.params["id"] as string,
        req.body,
      );
      sendSuccess(res, course);
    } catch (err) {
      next(err);
    }
  },

  async addStudent(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const course = await coursesService.addStudent(
        req.params["id"] as string,
        req.params["studentId"] as string,
      );
      sendSuccess(res, course);
    } catch (err) {
      next(err);
    }
  },

  async removeStudent(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const course = await coursesService.removeStudent(
        req.params["id"] as string,
        req.params["studentId"] as string,
      );
      sendSuccess(res, course);
    } catch (err) {
      next(err);
    }
  },
};
