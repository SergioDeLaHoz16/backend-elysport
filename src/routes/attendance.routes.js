import { Router } from "express"
import { AttendanceController } from "../controllers/attendance.controller.js"
import { authenticate, authorize } from "../middlewares/auth.js"
import { validateRequest } from "../utils/validation.js"
import { z } from "zod"

const router = Router()
const attendanceController = new AttendanceController()

// ✅ Todas las rutas requieren autenticación
router.use(authenticate)

// ✅ Ya no se valida el userId porque viene del token
const checkInSchema = z.object({
  notes: z.string().optional(),
})

// ✅ Registrar entrada
router.post(
  "/check-in",
  authorize("ADMIN", "TRAINER", "USER"),
  validateRequest(checkInSchema),
  attendanceController.checkIn.bind(attendanceController)
)

// ✅ Registrar salida
router.put(
  "/check-out",
  authorize("ADMIN", "TRAINER", "USER"),
  attendanceController.checkOut.bind(attendanceController)
)

// ✅ Obtener registros (filtrados por usuario si no es admin)
router.get("/", attendanceController.getAllAttendances.bind(attendanceController))

// ✅ Obtener los actualmente presentes
router.get("/currently-present", attendanceController.getCurrentlyPresent.bind(attendanceController))

// ✅ Obtener estadísticas (solo ADMIN o TRAINER)
router.get("/stats", authorize("ADMIN", "TRAINER"), attendanceController.getAttendanceStats.bind(attendanceController))

export default router
