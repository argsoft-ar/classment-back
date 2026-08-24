import { Router } from "express";
import { subjectsController } from "../controllers/subjects.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { rbacMiddleware } from "../middlewares/rbac.middleware";
import { validateBody } from "../middlewares/validation.middleware";
import {
  createSubjectSchema,
  updateSubjectSchema,
} from "../schemas/subject.validation";
import { RoleLevel } from "../types/rbac.types";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  rbacMiddleware(RoleLevel.DIRECTIVO),
  validateBody(createSubjectSchema),
  subjectsController.create,
);

router.get(
  "/course/:courseId",
  rbacMiddleware(
    RoleLevel.DIRECTIVO,
    RoleLevel.PRECEPTOR,
    RoleLevel.DOCENTE,
    RoleLevel.ALUMNO,
  ),
  subjectsController.findByCourse,
);

router.get(
  "/teacher/:teacherId",
  rbacMiddleware(RoleLevel.DIRECTIVO, RoleLevel.DOCENTE),
  subjectsController.findByTeacher,
);

router.get(
  "/:id",
  rbacMiddleware(
    RoleLevel.DIRECTIVO,
    RoleLevel.PRECEPTOR,
    RoleLevel.DOCENTE,
    RoleLevel.ALUMNO,
  ),
  subjectsController.findById,
);

router.patch(
  "/:id",
  rbacMiddleware(RoleLevel.DIRECTIVO),
  validateBody(updateSubjectSchema),
  subjectsController.update,
);

router.delete(
  "/:id",
  rbacMiddleware(RoleLevel.DIRECTIVO),
  subjectsController.deactivate,
);

export default router;
