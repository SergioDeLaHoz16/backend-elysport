import { ReportService } from "../services/report.service.js"

const reportService = new ReportService()

export class ReportController {
  async generateUsersReport(req, res, next) {
    try {
      const filters = {
        role: req.query.role,
        isActive: req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : undefined,
        format: req.query.format || "pdf",
      }

      const buffer = await reportService.generateUsersReport(filters)

      const filename = `usuarios_${Date.now()}.${filters.format === "pdf" ? "pdf" : "xlsx"}`
      const contentType =
        filters.format === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

      res.setHeader("Content-Type", contentType)
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`)
      res.send(buffer)
    } catch (error) {
      next(error)
    }
  }

  async generatePaymentsReport(req, res, next) {
    try {
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        method: req.query.method,
        format: req.query.format || "pdf",
      }

      const buffer = await reportService.generatePaymentsReport(filters)

      const filename = `pagos_${Date.now()}.${filters.format === "pdf" ? "pdf" : "xlsx"}`
      const contentType =
        filters.format === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

      res.setHeader("Content-Type", contentType)
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`)
      res.send(buffer)
    } catch (error) {
      next(error)
    }
  }

  async generateAttendancesReport(req, res, next) {
    try {
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        userId: req.query.userId,
        format: req.query.format || "pdf",
      }

      const buffer = await reportService.generateAttendancesReport(filters)

      const filename = `asistencias_${Date.now()}.${filters.format === "pdf" ? "pdf" : "xlsx"}`
      const contentType =
        filters.format === "pdf"
          ? "application/pdf"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

      res.setHeader("Content-Type", contentType)
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`)
      res.send(buffer)
    } catch (error) {
      next(error)
    }
  }
}
