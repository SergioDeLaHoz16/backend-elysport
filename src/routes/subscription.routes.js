import { Router } from "express"
import { SubscriptionController } from "../controllers/subscription.controller.js"
import { authenticate, authorize } from "../middlewares/auth.js"
import { validateRequest } from "../utils/validation.js"
import { z } from "zod"

const router = Router()
const subscriptionController = new SubscriptionController()

router.use(authenticate)

const createSubscriptionSchema = z.object({
  userId: z.string().uuid(),
  planName: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  price: z.number().positive(),
})

const updateSubscriptionSchema = z.object({
  planName: z.string().min(1).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  price: z.number().positive().optional(),
  status: z.enum(["ACTIVE", "EXPIRED", "CANCELLED"]).optional(),
})

router.post(
  "/",
  authorize("ADMIN", "TRAINER"),
  validateRequest(createSubscriptionSchema),
  subscriptionController.createSubscription.bind(subscriptionController),
)

router.get("/", subscriptionController.getAllSubscriptions.bind(subscriptionController))

router.get("/:id", subscriptionController.getSubscriptionById.bind(subscriptionController))

router.put(
  "/:id",
  authorize("ADMIN", "TRAINER"),
  validateRequest(updateSubscriptionSchema),
  subscriptionController.updateSubscription.bind(subscriptionController),
)

router.patch("/:id/cancel", authorize("ADMIN"), subscriptionController.cancelSubscription.bind(subscriptionController))

router.post(
  "/:id/renew",
  authorize("ADMIN", "TRAINER"),
  subscriptionController.renewSubscription.bind(subscriptionController),
)

export default router
