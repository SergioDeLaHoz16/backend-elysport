import "./config/env.js"
import express from "express"
import cors from "cors"
import helmet from "helmet"
import cookieParser from "cookie-parser" // ✅ nuevo
import { errorHandler } from "./middlewares/errorHandler.js"
import { requestLogger } from "./middlewares/logger.js"
import { rateLimiter } from "./middlewares/rateLimiter.js"

// Import routes
import authRoutes from "./routes/auth.routes.js"
import userRoutes from "./routes/user.routes.js"
import subscriptionRoutes from "./routes/subscription.routes.js"
import paymentRoutes from "./routes/payment.routes.js"
import attendanceRoutes from "./routes/attendance.routes.js"
import notificationRoutes from "./routes/notification.routes.js"
import reportRoutes from "./routes/report.routes.js"
import dashboardRoutes from "./routes/dashboard.routes.js"

const app = express()
const PORT = process.env.PORT || 3001

// ✅ Seguridad
app.use(helmet())

// ✅ CORS configurado correctamente para cookies
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  })
)

// ✅ Parser de cookies
app.use(cookieParser())

// ✅ Rate limiting
app.use(rateLimiter)

// ✅ Body parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ✅ Logs
app.use(requestLogger)

// ✅ Health Check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() })
})

// ✅ Rutas principales
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/subscriptions", subscriptionRoutes)
app.use("/api/payments", paymentRoutes)
app.use("/api/attendances", attendanceRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/reports", reportRoutes)
app.use("/api/dashboard", dashboardRoutes)

// ✅ 404
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" })
})

// ✅ Manejo de errores
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🚀 ElySport Backend running on port ${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || "development"}`)
})

export default app
