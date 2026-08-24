import { Request, Response, NextFunction } from "express";
import { RoleLevel } from "../types/rbac.types";
import { sendError } from "../utils/response.utils";

export function rbacMiddleware(...allowedRoles: RoleLevel[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendError(res, "Unauthorized", 401);
      return;
    }

    if (!allowedRoles.includes(req.user.role as RoleLevel)) {
      sendError(res, "Forbidden: insufficient permissions", 403);
      return;
    }

    next();
  };
}
