import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validateBody } from "../middlewares/validation.middleware";
import { registerSchema, loginSchema } from "../schemas/auth.validation";

const router = Router();

router.post("/register", validateBody(registerSchema), authController.register);
router.post("/login", validateBody(loginSchema), authController.login);

export default router;
