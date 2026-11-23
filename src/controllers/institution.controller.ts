import { Request, Response, NextFunction } from "express";
import { institutionService } from "../services/institution.service";
import { sendSuccess } from "../utils/response.utils";

export const institutionController = {
  async getConfig(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const institution = await institutionService.getConfig();
      sendSuccess(res, institution);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const institution = await institutionService.update(req.body);
      sendSuccess(res, institution, "Institution updated");
    } catch (err) {
      next(err);
    }
  },
};
