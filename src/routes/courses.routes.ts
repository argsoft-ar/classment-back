import { Router } from "express";
import { coursesController } from "../controllers/courses.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { rbacMiddleware } from "../middlewares/rbac.middleware";
import { validateBody } from "../middlewares/validation.middleware";
import {
  createCourseSchema,
  updateCourseSchema,
} from "../schemas/course.validation";
import { RoleLevel } from "../types/rbac.types";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  rbacMiddleware(RoleLevel.DIRECTIVO),
  validateBody(createCourseSchema),
  coursesController.create,
);

router.get(
  "/institution/:institutionId",
  rbacMiddleware(RoleLevel.DIRECTIVO, RoleLevel.PRECEPTOR, RoleLevel.DOCENTE),
  coursesController.findByInstitution,
);

router.get(
  "/:id",
  rbacMiddleware(RoleLevel.DIRECTIVO, RoleLevel.PRECEPTOR, RoleLevel.DOCENTE),
  coursesController.findById,
);

router.patch(
  "/:id",
  rbacMiddleware(RoleLevel.DIRECTIVO),
  validateBody(updateCourseSchema),
  coursesController.update,
);

router.post(
  "/:id/students/:studentId",
  rbacMiddleware(RoleLevel.DIRECTIVO),
  coursesController.addStudent,
);

router.delete(
  "/:id/students/:studentId",
  rbacMiddleware(RoleLevel.DIRECTIVO),
  coursesController.removeStudent,
);

export default router;
