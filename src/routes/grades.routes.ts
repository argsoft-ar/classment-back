import { Router } from "express";
import { gradesController } from "../controllers/grades.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { rbacMiddleware } from "../middlewares/rbac.middleware";
import { validateBody } from "../middlewares/validation.middleware";
import {
  updateGradeSchema,
  findOrCreateGradeSchema,
} from "../schemas/grade.validation";
import { RoleLevel } from "../types/rbac.types";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  rbacMiddleware(RoleLevel.DIRECTIVO, RoleLevel.DOCENTE),
  validateBody(findOrCreateGradeSchema),
  gradesController.findOrCreate,
);

router.get(
  "/student/:studentId",
  rbacMiddleware(
    RoleLevel.DIRECTIVO,
    RoleLevel.PRECEPTOR,
    RoleLevel.DOCENTE,
    RoleLevel.ALUMNO,
  ),
  gradesController.findByStudent,
);

router.get(
  "/subject/:subjectId",
  rbacMiddleware(RoleLevel.DIRECTIVO, RoleLevel.DOCENTE),
  gradesController.findBySubject,
);

router.get(
  "/:id",
  rbacMiddleware(
    RoleLevel.DIRECTIVO,
    RoleLevel.PRECEPTOR,
    RoleLevel.DOCENTE,
    RoleLevel.ALUMNO,
  ),
  gradesController.findById,
);

router.patch(
  "/:id",
  rbacMiddleware(RoleLevel.DIRECTIVO, RoleLevel.DOCENTE),
  validateBody(updateGradeSchema),
  gradesController.update,
);

export default router;
