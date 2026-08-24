import { Router } from "express";
import { rolesController } from "../controllers/roles.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { rbacMiddleware } from "../middlewares/rbac.middleware";
import { validateBody } from "../middlewares/validation.middleware";
import { createRoleSchema, updateRoleSchema } from "../schemas/role.validation";
import { RoleLevel } from "../types/rbac.types";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  rbacMiddleware(RoleLevel.DIRECTIVO),
  validateBody(createRoleSchema),
  rolesController.create,
);
router.get(
  "/institution/:institutionId",
  rbacMiddleware(RoleLevel.DIRECTIVO),
  rolesController.findByInstitution,
);
router.get(
  "/:id",
  rbacMiddleware(RoleLevel.DIRECTIVO),
  rolesController.findById,
);
router.patch(
  "/:id",
  rbacMiddleware(RoleLevel.DIRECTIVO),
  validateBody(updateRoleSchema),
  rolesController.update,
);
router.delete(
  "/:id",
  rbacMiddleware(RoleLevel.DIRECTIVO),
  rolesController.deactivate,
);

export default router;
