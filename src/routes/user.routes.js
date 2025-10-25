import { Router } from "express"
import { UserController } from "../controllers/user.controller.js"
import { authenticate, authorize } from "../middlewares/auth.js"
import { validateRequest } from "../utils/validation.js"
import { z } from "zod"

const router = Router()
const userController = new UserController()

// All routes require authentication
router.use(authenticate)

// Validation schemas
const updateUserSchema = z.object({
  full_name: z.string().min(1).optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
  profile: z
    .object({
      dateOfBirth: z.string().optional(),
      gender: z.string().optional(),
      address: z.string().optional(),
      emergencyContact: z.string().optional(),
      weight: z.number().positive().optional(),
      height: z.number().positive().optional(),
      fitnessGoal: z.string().optional(),
      medicalNotes: z.string().optional(),
    })
    .optional(),
})

// Routes
router.get("/", authorize("ADMIN", "TRAINER"), userController.getAllUsers.bind(userController))

router.get("/:id", userController.getUserById.bind(userController))

router.put("/:id", validateRequest(updateUserSchema), userController.updateUser.bind(userController))

router.delete("/:id", authorize("ADMIN"), userController.deleteUser.bind(userController))

router.patch("/:id/toggle-status", authorize("ADMIN"), userController.toggleUserStatus.bind(userController))

router.get("/:id/stats", userController.getUserStats.bind(userController))

export default router
