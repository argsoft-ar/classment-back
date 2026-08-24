import { Router } from "express";
import authRoutes from "./auth.routes";
import usersRoutes from "./users.routes";
import institutionsRoutes from "./institutions.routes";
import rolesRoutes from "./roles.routes";
import coursesRoutes from "./courses.routes";
import subjectsRoutes from "./subjects.routes";
import academicRecordsRoutes from "./academic-records.routes";
import attendanceRoutes from "./attendance.routes";
import gradesRoutes from "./grades.routes";
import messagingRoutes from "./messaging.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", usersRoutes);
router.use("/institutions", institutionsRoutes);
router.use("/roles", rolesRoutes);
router.use("/courses", coursesRoutes);
router.use("/subjects", subjectsRoutes);
router.use("/academic-records", academicRecordsRoutes);
router.use("/attendance", attendanceRoutes);
router.use("/grades", gradesRoutes);
router.use("/messages", messagingRoutes);

export default router;
