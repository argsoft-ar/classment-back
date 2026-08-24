import { Router } from "express";
import { messagingController } from "../controllers/messaging.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { rbacMiddleware } from "../middlewares/rbac.middleware";
import { validateBody } from "../middlewares/validation.middleware";
import { createMessageSchema } from "../schemas/message.validation";
import { RoleLevel } from "../types/rbac.types";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  rbacMiddleware(RoleLevel.DIRECTIVO, RoleLevel.PRECEPTOR),
  validateBody(createMessageSchema),
  messagingController.create,
);

router.get(
  "/",
  rbacMiddleware(
    RoleLevel.DIRECTIVO,
    RoleLevel.PRECEPTOR,
    RoleLevel.DOCENTE,
    RoleLevel.ALUMNO,
  ),
  messagingController.findForUser,
);

router.get(
  "/:id",
  rbacMiddleware(
    RoleLevel.DIRECTIVO,
    RoleLevel.PRECEPTOR,
    RoleLevel.DOCENTE,
    RoleLevel.ALUMNO,
  ),
  messagingController.findById,
);

router.post(
  "/:id/read",
  rbacMiddleware(
    RoleLevel.DIRECTIVO,
    RoleLevel.PRECEPTOR,
    RoleLevel.DOCENTE,
    RoleLevel.ALUMNO,
  ),
  messagingController.markAsRead,
);

router.delete(
  "/:id",
  rbacMiddleware(RoleLevel.DIRECTIVO),
  messagingController.delete,
);

export default router;
