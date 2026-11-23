import { Router } from "express";
import { correlativesController } from "../controllers/correlatives.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { rbacMiddleware } from "../middlewares/rbac.middleware";
import { validateBody, validateParams } from "../middlewares/validation.middleware";
import { createCorrelativeSchema } from "../schemas/correlative.validation";
import { idParamSchema, subjectIdParamSchema } from "../schemas/common.validation";
import { ADMIN_ROLES, ALL_ROLES } from "../types/rbac.types";

const router = Router();

router.use(authMiddleware);

router.get(
  "/subject/:subjectId",
  rbacMiddleware(...ALL_ROLES),
  validateParams(subjectIdParamSchema),
  correlativesController.findBySubject,
);

router.post(
  "/",
  rbacMiddleware(...ADMIN_ROLES),
  validateBody(createCorrelativeSchema),
  correlativesController.create,
);

router.delete(
  "/:id",
  rbacMiddleware(...ADMIN_ROLES),
  validateParams(idParamSchema),
  correlativesController.delete,
);

export default router;
