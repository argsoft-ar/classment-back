import { Router } from "express";
import { offeringsController } from "../controllers/offerings.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { rbacMiddleware } from "../middlewares/rbac.middleware";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middlewares/validation.middleware";
import {
  createOfferingSchema,
  listOfferingsQuerySchema,
  recordOfferingGradesSchema,
  updateOfferingSchema,
} from "../schemas/offering.validation";
import { idParamSchema } from "../schemas/common.validation";
import { ADMIN_ROLES, RoleLevel } from "../types/rbac.types";

const router = Router();

router.use(authMiddleware);

router.get("/available", rbacMiddleware(RoleLevel.ALUMNO), offeringsController.findAvailable);

// Docentes only receive their assigned offerings (enforced in the service).
router.get(
  "/",
  rbacMiddleware(...ADMIN_ROLES, RoleLevel.DOCENTE),
  validateQuery(listOfferingsQuerySchema),
  offeringsController.findAll,
);

router.post(
  "/",
  rbacMiddleware(...ADMIN_ROLES),
  validateBody(createOfferingSchema),
  offeringsController.create,
);

router.get(
  "/:id/enrollments",
  rbacMiddleware(...ADMIN_ROLES, RoleLevel.DOCENTE),
  validateParams(idParamSchema),
  offeringsController.findEnrollments,
);

router.put(
  "/:id/grades",
  rbacMiddleware(...ADMIN_ROLES, RoleLevel.DOCENTE),
  validateParams(idParamSchema),
  validateBody(recordOfferingGradesSchema),
  offeringsController.recordGrades,
);

router.get(
  "/:id",
  rbacMiddleware(...ADMIN_ROLES, RoleLevel.DOCENTE),
  validateParams(idParamSchema),
  offeringsController.findById,
);

router.patch(
  "/:id",
  rbacMiddleware(...ADMIN_ROLES),
  validateParams(idParamSchema),
  validateBody(updateOfferingSchema),
  offeringsController.update,
);

router.delete(
  "/:id",
  rbacMiddleware(...ADMIN_ROLES),
  validateParams(idParamSchema),
  offeringsController.delete,
);

export default router;
