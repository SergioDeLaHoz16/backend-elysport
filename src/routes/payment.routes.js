import { Router } from "express"
import { PaymentController } from "../controllers/payment.controller.js"
import { authenticate, authorize } from "../middlewares/auth.js"
import { validateRequest } from "../utils/validation.js"
import { z } from "zod"

const router = Router()
const paymentController = new PaymentController()

router.use(authenticate)

const createPaymentSchema = z.object({
  userId: z.string().uuid(),
  subscriptionId: z.string().uuid().optional(),
  amount: z.number().positive(),
  method: z.enum(["NEQUI", "DAVIPLATA", "CASH", "CARD"]),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
})

router.post(
  "/",
  authorize("ADMIN", "TRAINER"),
  validateRequest(createPaymentSchema),
  paymentController.createPayment.bind(paymentController),
)

router.get("/", paymentController.getAllPayments.bind(paymentController))

router.get("/stats", authorize("ADMIN", "TRAINER"), paymentController.getPaymentStats.bind(paymentController))

router.get("/:id", paymentController.getPaymentById.bind(paymentController))

export default router
