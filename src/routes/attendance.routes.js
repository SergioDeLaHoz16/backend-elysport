import { Router } from "express"
import { AttendanceController } from "../controllers/attendance.controller.js"
import { authenticate, authorize } from "../middlewares/auth.js"
import { validateRequest } from "../utils/validation.js"
import { z } from "zod"

const router = Router()
const attendanceController = new AttendanceController()

router.use(authenticate)

const checkInSchema = z.object({
  userId: z.string().uuid(),
  notes: z.string().optional(),
})

router.post(
  "/check-in",
  authorize("ADMIN", "TRAINER"),
  validateRequest(checkInSchema),
  attendanceController.checkIn.bind(attendanceController),
)

router.put("/:id/check-out", authorize("ADMIN", "TRAINER"), attendanceController.checkOut.bind(attendanceController))

router.get("/", attendanceController.getAllAttendances.bind(attendanceController))

router.get("/currently-present", attendanceController.getCurrentlyPresent.bind(attendanceController))

router.get("/stats", authorize("ADMIN", "TRAINER"), attendanceController.getAttendanceStats.bind(attendanceController))

export default router
