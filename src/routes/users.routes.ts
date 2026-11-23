import { Router } from "express";
import { usersController } from "../controllers/users.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { rbacMiddleware } from "../middlewares/rbac.middleware";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/validation.middleware";
import {
  createUserSchema,
  listUsersQuerySchema,
  updateUserSchema,
} from "../schemas/user.validation";
import { idParamSchema } from "../schemas/common.validation";
import { ADMIN_ROLES, ALL_ROLES } from "../types/rbac.types";

const router = Router();

router.use(authMiddleware);

router.get("/me", rbacMiddleware(...ALL_ROLES), usersController.me);

router.get(
  "/",
  rbacMiddleware(...ADMIN_ROLES),
  validateQuery(listUsersQuerySchema),
  usersController.findAll,
);

router.post(
  "/",
  rbacMiddleware(...ADMIN_ROLES),
  validateBody(createUserSchema),
  usersController.create,
);

router.get(
  "/:id",
  rbacMiddleware(...ADMIN_ROLES),
  validateParams(idParamSchema),
  usersController.findById,
);

router.patch(
  "/:id",
  rbacMiddleware(...ADMIN_ROLES),
  validateParams(idParamSchema),
  validateBody(updateUserSchema),
  usersController.update,
);

router.delete(
  "/:id",
  rbacMiddleware(...ADMIN_ROLES),
  validateParams(idParamSchema),
  usersController.deactivate,
);

export default router;
