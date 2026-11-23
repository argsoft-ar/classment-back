import { Router } from "express";
import { enrollmentsController } from "../controllers/enrollments.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { rbacMiddleware } from "../middlewares/rbac.middleware";
import { validateBody, validateParams } from "../middlewares/validation.middleware";
import { createEnrollmentSchema } from "../schemas/enrollment.validation";
import { idParamSchema } from "../schemas/common.validation";
import { RoleLevel } from "../types/rbac.types";

const router = Router();

router.use(authMiddleware);

router.get("/me", rbacMiddleware(RoleLevel.ALUMNO), enrollmentsController.findMine);

router.post(
  "/",
  rbacMiddleware(RoleLevel.ALUMNO),
  validateBody(createEnrollmentSchema),
  enrollmentsController.create,
);

router.patch(
  "/:id/drop",
  rbacMiddleware(RoleLevel.ALUMNO),
  validateParams(idParamSchema),
  enrollmentsController.drop,
);

export default router;
