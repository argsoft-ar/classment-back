import { Router } from "express";
import { academicRecordsController } from "../controllers/academic-records.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { rbacMiddleware } from "../middlewares/rbac.middleware";
import { validateBody, validateParams } from "../middlewares/validation.middleware";
import { bulkUpsertRecordsSchema } from "../schemas/academic-record.validation";
import { studentIdParamSchema } from "../schemas/common.validation";
import { ADMIN_ROLES, RoleLevel } from "../types/rbac.types";

const router = Router();

router.use(authMiddleware);

router.get("/me", rbacMiddleware(RoleLevel.ALUMNO), academicRecordsController.findMine);

// Students may call this only with their own id (ownership enforced in the service).
router.get(
  "/student/:studentId",
  rbacMiddleware(...ADMIN_ROLES, RoleLevel.ALUMNO),
  validateParams(studentIdParamSchema),
  academicRecordsController.findByStudent,
);

router.put(
  "/student/:studentId",
  rbacMiddleware(...ADMIN_ROLES),
  validateParams(studentIdParamSchema),
  validateBody(bulkUpsertRecordsSchema),
  academicRecordsController.bulkUpsert,
);

export default router;
