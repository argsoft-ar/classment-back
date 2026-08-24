import { Request, Response, NextFunction } from "express";
import { messagingService } from "../services/messaging.service";
import { sendSuccess } from "../utils/response.utils";

export const messagingController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const message = await messagingService.create({
        ...req.body,
        senderId: req.user?.userId,
        institutionId: req.user?.institutionId,
      });
      sendSuccess(res, message, "Message sent", 201);
    } catch (err) {
      next(err);
    }
  },

  async findForUser(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const institutionId = req.user?.institutionId ?? "";
      const courseIds = req.query["courseIds"]
        ? (req.query["courseIds"] as string).split(",")
        : [];
      const messages = await messagingService.findForUser(
        institutionId,
        courseIds,
      );
      sendSuccess(res, messages);
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
      const message = await messagingService.findById(
        req.params["id"] as string,
      );
      sendSuccess(res, message);
    } catch (err) {
      next(err);
    }
  },

  async markAsRead(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      const message = await messagingService.markAsRead(
        req.params["id"] as string,
        req.user?.userId ?? "",
      );
      sendSuccess(res, message);
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await messagingService.delete(req.params["id"] as string);
      sendSuccess(res, null, "Message deleted");
    } catch (err) {
      next(err);
    }
  },
};
