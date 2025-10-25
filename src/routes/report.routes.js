import { Router } from "express"
import { ReportController } from "../controllers/report.controller.js"
import { authenticate, authorize } from "../middlewares/auth.js"

const router = Router()
const reportController = new ReportController()

router.use(authenticate)
router.use(authorize("ADMIN", "TRAINER"))

router.get("/users", reportController.generateUsersReport.bind(reportController))

router.get("/payments", reportController.generatePaymentsReport.bind(reportController))

router.get("/attendances", reportController.generateAttendancesReport.bind(reportController))

export default router
