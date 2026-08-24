import { Router } from "express";
import { institutionsController } from "../controllers/institutions.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { rbacMiddleware } from "../middlewares/rbac.middleware";
import { validateBody } from "../middlewares/validation.middleware";
import {
  createInstitutionSchema,
  updateInstitutionSchema,
} from "../schemas/institution.validation";
import { RoleLevel } from "../types/rbac.types";

const router = Router();

router.post(
  "/",
  authMiddleware,
  rbacMiddleware(RoleLevel.DIRECTIVO),
  validateBody(createInstitutionSchema),
  institutionsController.create,
);

router.get("/", authMiddleware, institutionsController.findAll);

router.get("/:id", authMiddleware, institutionsController.findById);

router.patch(
  "/:id",
  authMiddleware,
  rbacMiddleware(RoleLevel.DIRECTIVO),
  validateBody(updateInstitutionSchema),
  institutionsController.update,
);

router.post(
  "/:id/grading-period/open",
  authMiddleware,
  rbacMiddleware(RoleLevel.DIRECTIVO),
  institutionsController.openGradingPeriod,
);

router.post(
  "/:id/grading-period/close",
  authMiddleware,
  rbacMiddleware(RoleLevel.DIRECTIVO),
  institutionsController.closeGradingPeriod,
);

router.delete(
  "/:id",
  authMiddleware,
  rbacMiddleware(RoleLevel.DIRECTIVO),
  institutionsController.deactivate,
);

export default router;
