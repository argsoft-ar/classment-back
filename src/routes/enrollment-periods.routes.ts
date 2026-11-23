import { Router } from "express";
import { enrollmentPeriodsController } from "../controllers/enrollment-periods.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { rbacMiddleware } from "../middlewares/rbac.middleware";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/validation.middleware";
import {
  createPeriodSchema,
  listPeriodsQuerySchema,
  updatePeriodSchema,
} from "../schemas/enrollment-period.validation";
import { idParamSchema } from "../schemas/common.validation";
import { ADMIN_ROLES, ALL_ROLES } from "../types/rbac.types";

const router = Router();

router.use(authMiddleware);

router.get("/open", rbacMiddleware(...ALL_ROLES), enrollmentPeriodsController.findOpen);

router.get(
  "/",
  rbacMiddleware(...ADMIN_ROLES),
  validateQuery(listPeriodsQuerySchema),
  enrollmentPeriodsController.findAll,
);

router.post(
  "/",
  rbacMiddleware(...ADMIN_ROLES),
  validateBody(createPeriodSchema),
  enrollmentPeriodsController.create,
);

router.get(
  "/:id",
  rbacMiddleware(...ADMIN_ROLES),
  validateParams(idParamSchema),
  enrollmentPeriodsController.findById,
);

router.patch(
  "/:id",
  rbacMiddleware(...ADMIN_ROLES),
  validateParams(idParamSchema),
  validateBody(updatePeriodSchema),
  enrollmentPeriodsController.update,
);

router.delete(
  "/:id",
  rbacMiddleware(...ADMIN_ROLES),
  validateParams(idParamSchema),
  enrollmentPeriodsController.delete,
);

export default router;
