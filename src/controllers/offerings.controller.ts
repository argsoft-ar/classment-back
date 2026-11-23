import { Request, Response, NextFunction } from "express";
import { offeringsService } from "../services/offerings.service";
import { sendSuccess } from "../utils/response.utils";
import { requireUser } from "../utils/access.utils";
import { ListOfferingsQuery } from "../schemas/offering.validation";

export const offeringsController = {
  async findAvailable(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const offerings = await offeringsService.findAvailable(requireUser(req.user));
      sendSuccess(res, offerings);
    } catch (err) {
      next(err);
    }
  },

  async findAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const offerings = await offeringsService.findAll(
        req.query as ListOfferingsQuery,
        requireUser(req.user),
      );
      sendSuccess(res, offerings);
    } catch (err) {
      next(err);
    }
  },

  async findById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const offering = await offeringsService.findById(
        req.params["id"] as string,
        requireUser(req.user),
      );
      sendSuccess(res, offering);
    } catch (err) {
      next(err);
    }
  },

  async findEnrollments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const enrollments = await offeringsService.findEnrollments(
        req.params["id"] as string,
        requireUser(req.user),
      );
      sendSuccess(res, enrollments);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const offering = await offeringsService.create(req.body);
      sendSuccess(res, offering, "Offering created", 201);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const offering = await offeringsService.update(req.params["id"] as string, req.body);
      sendSuccess(res, offering, "Offering updated");
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await offeringsService.delete(req.params["id"] as string);
      sendSuccess(res, null, "Offering deleted");
    } catch (err) {
      next(err);
    }
  },
};
