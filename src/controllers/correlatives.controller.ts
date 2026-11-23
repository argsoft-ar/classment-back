import { Request, Response, NextFunction } from "express";
import { correlativesService } from "../services/correlatives.service";
import { sendSuccess } from "../utils/response.utils";

export const correlativesController = {
  async findBySubject(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await correlativesService.findBySubject(req.params["subjectId"] as string);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const rule = await correlativesService.create(req.body);
      sendSuccess(res, rule, "Correlative rule created", 201);
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await correlativesService.delete(req.params["id"] as string);
      sendSuccess(res, null, "Correlative rule deleted");
    } catch (err) {
      next(err);
    }
  },
};
