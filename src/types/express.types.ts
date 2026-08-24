import { Request } from "express";
import { JwtPayload } from "./common.types";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}
