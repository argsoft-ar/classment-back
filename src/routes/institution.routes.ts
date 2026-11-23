import { Router } from "express";
import { institutionController } from "../controllers/institution.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { rbacMiddleware } from "../middlewares/rbac.middleware";
import { validateBody } from "../middlewares/validation.middleware";
import { updateInstitutionSchema } from "../schemas/institution.validation";
import { ALL_ROLES, RoleLevel } from "../types/rbac.types";

const router = Router();

router.use(authMiddleware);

router.get("/", rbacMiddleware(...ALL_ROLES), institutionController.getConfig);

router.patch(
  "/",
  rbacMiddleware(RoleLevel.SUPER_ADMIN),
  validateBody(updateInstitutionSchema),
  institutionController.update,
);

export default router;
