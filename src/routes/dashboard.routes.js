import { Router } from "express"
import { DashboardController } from "../controllers/dashboard.controller.js"
import { authenticate, authorize } from "../middlewares/auth.js"

const router = Router()
const dashboardController = new DashboardController()

router.use(authenticate)
router.use(authorize("ADMIN", "TRAINER"))

router.get("/stats", dashboardController.getGeneralStats.bind(dashboardController))

router.get("/revenue", dashboardController.getRevenueByPeriod.bind(dashboardController))

router.get("/activity", dashboardController.getRecentActivity.bind(dashboardController))

router.get("/top-clients", dashboardController.getTopClients.bind(dashboardController))

router.get("/payment-methods", dashboardController.getPaymentMethodDistribution.bind(dashboardController))

export default router
