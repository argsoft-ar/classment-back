import { Router } from "express";
import authRoutes from "./auth.routes";
import institutionRoutes from "./institution.routes";
import usersRoutes from "./users.routes";
import careersRoutes from "./careers.routes";
import subjectsRoutes from "./subjects.routes";
import correlativesRoutes from "./correlatives.routes";
import academicRecordsRoutes from "./academic-records.routes";
import enrollmentPeriodsRoutes from "./enrollment-periods.routes";
import offeringsRoutes from "./offerings.routes";
import enrollmentsRoutes from "./enrollments.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/institution", institutionRoutes);
router.use("/users", usersRoutes);
router.use("/careers", careersRoutes);
router.use("/subjects", subjectsRoutes);
router.use("/correlatives", correlativesRoutes);
router.use("/academic-records", academicRecordsRoutes);
router.use("/enrollment-periods", enrollmentPeriodsRoutes);
router.use("/offerings", offeringsRoutes);
router.use("/enrollments", enrollmentsRoutes);

export default router;
