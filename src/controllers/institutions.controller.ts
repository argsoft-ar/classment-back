import { Request, Response, NextFunction } from "express";
import { institutionsService } from "../services/institutions.service";
import { sendSuccess } from "../utils/response.utils";

export const institutionsController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const institution = await institutionsService.create(req.body);
      sendSuccess(res, institution, "Institution created", 201);
    } catch (err) {
      next(err);
    }
  },

  async findAll(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const institutions = await institutionsService.findAll();
      sendSuccess(res, institutions);
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
      const institution = await institutionsService.findById(
        req.params["id"] as string,
      );
      sendSuccess(res, institution);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const institution = await institutionsService.update(
        req.params["id"] as string,
        req.body,
      );
      sendSuccess(res, institution);
    } catch (err) {
      next(err);
    }
  },

  async openGradingPeriod(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const institution = await institutionsService.toggleGradingPeriod(
        req.params["id"] as string,
        true,
      );
      sendSuccess(res, institution, "Grading period opened");
    } catch (err) {
      next(err);
    }
  },

  async closeGradingPeriod(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const institution = await institutionsService.toggleGradingPeriod(
        req.params["id"] as string,
        false,
      );
      sendSuccess(res, institution, "Grading period closed");
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
      await institutionsService.deactivate(req.params["id"] as string);
      sendSuccess(res, null, "Institution deactivated");
    } catch (err) {
      next(err);
    }
  },
};
