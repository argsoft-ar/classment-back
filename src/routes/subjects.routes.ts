import { Router } from "express";
import { subjectsController } from "../controllers/subjects.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { rbacMiddleware } from "../middlewares/rbac.middleware";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/validation.middleware";
import {
  createSubjectSchema,
  listSubjectsQuerySchema,
  updateSubjectSchema,
} from "../schemas/subject.validation";
import { idParamSchema } from "../schemas/common.validation";
import { ADMIN_ROLES, ALL_ROLES } from "../types/rbac.types";

const router = Router();

router.use(authMiddleware);

router.get(
  "/",
  rbacMiddleware(...ALL_ROLES),
  validateQuery(listSubjectsQuerySchema),
  subjectsController.findByCareer,
);

router.post(
  "/",
  rbacMiddleware(...ADMIN_ROLES),
  validateBody(createSubjectSchema),
  subjectsController.create,
);

router.get(
  "/:id",
  rbacMiddleware(...ALL_ROLES),
  validateParams(idParamSchema),
  subjectsController.findById,
);

router.patch(
  "/:id",
  rbacMiddleware(...ADMIN_ROLES),
  validateParams(idParamSchema),
  validateBody(updateSubjectSchema),
  subjectsController.update,
);

router.delete(
  "/:id",
  rbacMiddleware(...ADMIN_ROLES),
  validateParams(idParamSchema),
  subjectsController.deactivate,
);

export default router;
