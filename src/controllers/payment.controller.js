import { PaymentService } from "../services/payment.service.js"

const paymentService = new PaymentService()

export class PaymentController {
  async createPayment(req, res, next) {
    try {
      const result = await paymentService.createPayment(req.body)
      res.status(201).json(result)
    } catch (error) {
      next(error)
    }
  }

  async getAllPayments(req, res, next) {
    try {
      const filters = {
        userId: req.query.userId,
        method: req.query.method,
        status: req.query.status,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        page: Number.parseInt(req.query.page) || 1,
        limit: Number.parseInt(req.query.limit) || 10,
      }

      const result = await paymentService.getAllPayments(filters)
      res.json(result)
    } catch (error) {
      next(error)
    }
  }

  async getPaymentById(req, res, next) {
    try {
      const payment = await paymentService.getPaymentById(req.params.id)
      res.json({ payment })
    } catch (error) {
      next(error)
    }
  }

  async getPaymentStats(req, res, next) {
    try {
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      }

      const stats = await paymentService.getPaymentStats(filters)
      res.json(stats)
    } catch (error) {
      next(error)
    }
  }
}
