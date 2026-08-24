import { Router } from "express";
import { academicRecordsController } from "../controllers/academic-records.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { rbacMiddleware } from "../middlewares/rbac.middleware";
import { validateBody } from "../middlewares/validation.middleware";
import {
  createAcademicRecordSchema,
  updateAcademicRecordSchema,
} from "../schemas/academic-record.validation";
import { RoleLevel } from "../types/rbac.types";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  rbacMiddleware(RoleLevel.DIRECTIVO),
  validateBody(createAcademicRecordSchema),
  academicRecordsController.create,
);

router.get(
  "/student/:studentId",
  rbacMiddleware(
    RoleLevel.DIRECTIVO,
    RoleLevel.PRECEPTOR,
    RoleLevel.DOCENTE,
    RoleLevel.ALUMNO,
  ),
  academicRecordsController.findByStudent,
);

router.get(
  "/course/:courseId",
  rbacMiddleware(RoleLevel.DIRECTIVO, RoleLevel.PRECEPTOR),
  academicRecordsController.findByCourse,
);

router.get(
  "/:id",
  rbacMiddleware(RoleLevel.DIRECTIVO, RoleLevel.PRECEPTOR),
  academicRecordsController.findById,
);

router.patch(
  "/:id",
  rbacMiddleware(RoleLevel.DIRECTIVO),
  validateBody(updateAcademicRecordSchema),
  academicRecordsController.update,
);

export default router;
