import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { rbacMiddleware } from "../middlewares/rbac.middleware";
import { validateBody } from "../middlewares/validation.middleware";
import { registerSchema, loginSchema } from "../schemas/auth.validation";
import { loginRateLimiter } from "../middlewares/rate-limit.middleware";
import { ADMIN_ROLES } from "../types/rbac.types";

const router = Router();

// Rate limiter runs before validation so malformed attempts also count.
router.post("/login", loginRateLimiter, validateBody(loginSchema), authController.login);

// No open self-registration: only administrators can register accounts.
router.post(
  "/register",
  authMiddleware,
  rbacMiddleware(...ADMIN_ROLES),
  validateBody(registerSchema),
  authController.register,
);

export default router;
