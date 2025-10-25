import { DashboardService } from "../services/dashboard.service.js"

const dashboardService = new DashboardService()

export class DashboardController {
  async getGeneralStats(req, res, next) {
    try {
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      }

      const stats = await dashboardService.getGeneralStats(filters)
      res.json(stats)
    } catch (error) {
      next(error)
    }
  }

  async getRevenueByPeriod(req, res, next) {
    try {
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        groupBy: req.query.groupBy || "day",
      }

      const revenue = await dashboardService.getRevenueByPeriod(filters)
      res.json({ revenue })
    } catch (error) {
      next(error)
    }
  }

  async getRecentActivity(req, res, next) {
    try {
      const limit = Number.parseInt(req.query.limit) || 10
      const activities = await dashboardService.getRecentActivity(limit)
      res.json({ activities })
    } catch (error) {
      next(error)
    }
  }

  async getTopClients(req, res, next) {
    try {
      const limit = Number.parseInt(req.query.limit) || 5
      const clients = await dashboardService.getTopClients(limit)
      res.json({ clients })
    } catch (error) {
      next(error)
    }
  }

  async getPaymentMethodDistribution(req, res, next) {
    try {
      const distribution = await dashboardService.getPaymentMethodDistribution()
      res.json({ distribution })
    } catch (error) {
      next(error)
    }
  }
}
