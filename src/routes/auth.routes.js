import { Router } from "express"
import { AuthController } from "../controllers/auth.controller.js"
import { validateRequest } from "../utils/validation.js"
import { z } from "zod"
import { authenticate } from "../middlewares/auth.js"
import { authRateLimiter } from "../middlewares/rateLimiter.js"

const router = Router()
const authController = new AuthController()

// Validation schemas
const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  role: z.enum(["ADMIN", "TRAINER", "CLIENT"]).optional(),
  phone: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
})

const refreshSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
})

// Routes
router.post("/register", authRateLimiter, validateRequest(registerSchema), authController.register.bind(authController))

router.post("/login", authRateLimiter, validateRequest(loginSchema), authController.login.bind(authController))

router.post("/refresh", validateRequest(refreshSchema), authController.refresh.bind(authController))

router.post("/logout", validateRequest(refreshSchema), authController.logout.bind(authController))

router.post("/logout-all", authenticate, authController.logoutAll.bind(authController))

router.post(
  "/change-password",
  authenticate,
  validateRequest(changePasswordSchema),
  authController.changePassword.bind(authController),
)

router.get("/me", authenticate, authController.me.bind(authController))

export default router
