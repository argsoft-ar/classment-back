import { Router } from "express";
import { usersController } from "../controllers/users.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { rbacMiddleware } from "../middlewares/rbac.middleware";
import { RoleLevel } from "../types/rbac.types";

const router = Router();

router.use(authMiddleware);

router.get(
  "/",
  rbacMiddleware(RoleLevel.DIRECTIVO, RoleLevel.PRECEPTOR),
  usersController.findAll,
);
router.get(
  "/:id",
  rbacMiddleware(RoleLevel.DIRECTIVO, RoleLevel.PRECEPTOR),
  usersController.findById,
);
router.patch(
  "/:id",
  rbacMiddleware(RoleLevel.DIRECTIVO),
  usersController.update,
);
router.delete(
  "/:id",
  rbacMiddleware(RoleLevel.DIRECTIVO),
  usersController.deactivate,
);

export default router;
