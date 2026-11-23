import { Router } from "express";
import { careersController } from "../controllers/careers.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { rbacMiddleware } from "../middlewares/rbac.middleware";
import { validateBody, validateParams } from "../middlewares/validation.middleware";
import { createCareerSchema, updateCareerSchema } from "../schemas/career.validation";
import { idParamSchema } from "../schemas/common.validation";
import { ADMIN_ROLES, ALL_ROLES } from "../types/rbac.types";

const router = Router();

router.use(authMiddleware);

router.get("/", rbacMiddleware(...ALL_ROLES), careersController.findAll);

router.post(
  "/",
  rbacMiddleware(...ADMIN_ROLES),
  validateBody(createCareerSchema),
  careersController.create,
);

router.get(
  "/:id/subjects",
  rbacMiddleware(...ALL_ROLES),
  validateParams(idParamSchema),
  careersController.getSubjects,
);

router.get(
  "/:id",
  rbacMiddleware(...ALL_ROLES),
  validateParams(idParamSchema),
  careersController.findById,
);

router.patch(
  "/:id",
  rbacMiddleware(...ADMIN_ROLES),
  validateParams(idParamSchema),
  validateBody(updateCareerSchema),
  careersController.update,
);

router.delete(
  "/:id",
  rbacMiddleware(...ADMIN_ROLES),
  validateParams(idParamSchema),
  careersController.deactivate,
);

export default router;
