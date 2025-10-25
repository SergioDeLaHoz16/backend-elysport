import { Router } from "express"
import { NotificationController } from "../controllers/notification.controller.js"
import { authenticate, authorize } from "../middlewares/auth.js"
import { validateRequest } from "../utils/validation.js"
import { z } from "zod"

const router = Router()
const notificationController = new NotificationController()

router.use(authenticate)

const createNotificationSchema = z.object({
  userId: z.string().uuid(),
  type: z.enum(["EXPIRATION", "PAYMENT_CONFIRMED", "WARNING", "INFO"]),
  title: z.string().min(1),
  message: z.string().min(1),
  sendEmail: z.boolean().optional(),
})

router.post(
  "/",
  authorize("ADMIN", "TRAINER"),
  validateRequest(createNotificationSchema),
  notificationController.createNotification.bind(notificationController),
)

router.get("/", notificationController.getAllNotifications.bind(notificationController))

router.put("/:id/read", notificationController.markAsRead.bind(notificationController))

router.put("/read-all", notificationController.markAllAsRead.bind(notificationController))

router.delete("/:id", notificationController.deleteNotification.bind(notificationController))

export default router
