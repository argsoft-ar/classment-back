import { Router } from "express";
import { attendanceController } from "../controllers/attendance.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { rbacMiddleware } from "../middlewares/rbac.middleware";
import { validateBody } from "../middlewares/validation.middleware";
import {
  createAttendanceSchema,
  updateAttendanceSchema,
} from "../schemas/attendance.validation";
import { RoleLevel } from "../types/rbac.types";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  rbacMiddleware(RoleLevel.PRECEPTOR, RoleLevel.DIRECTIVO),
  validateBody(createAttendanceSchema),
  attendanceController.create,
);

router.get(
  "/course/:courseId",
  rbacMiddleware(RoleLevel.DIRECTIVO, RoleLevel.PRECEPTOR),
  attendanceController.findByCourse,
);

router.get(
  "/student/:studentId",
  rbacMiddleware(RoleLevel.DIRECTIVO, RoleLevel.PRECEPTOR, RoleLevel.ALUMNO),
  attendanceController.findByStudent,
);

router.patch(
  "/:id",
  rbacMiddleware(RoleLevel.PRECEPTOR, RoleLevel.DIRECTIVO),
  validateBody(updateAttendanceSchema),
  attendanceController.update,
);

export default router;
