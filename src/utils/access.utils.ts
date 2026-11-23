import { AppError } from "../middlewares/error.middleware";
import { JwtPayload } from "../types/common.types";
import { RoleLevel } from "../types/rbac.types";

/** Students may only access their own data; other roles are gated by the route RBAC. */
export function assertCanAccessStudent(actor: JwtPayload, studentId: string): void {
  if (actor.role === RoleLevel.ALUMNO && actor.userId !== studentId) {
    throw new AppError(403, "Forbidden: students can only access their own data");
  }
}

export function requireUser(user: JwtPayload | undefined): JwtPayload {
  if (!user) throw new AppError(401, "Unauthorized");
  return user;
}
