import { SubscriptionService } from "../services/subscription.service.js"

const subscriptionService = new SubscriptionService()

export class SubscriptionController {
  async createSubscription(req, res, next) {
    try {
      const subscription = await subscriptionService.createSubscription(req.body)
      res.status(201).json({ subscription })
    } catch (error) {
      next(error)
    }
  }

  async getAllSubscriptions(req, res, next) {
    try {
      const filters = {
        status: req.query.status,
        userId: req.query.userId,
        page: Number.parseInt(req.query.page) || 1,
        limit: Number.parseInt(req.query.limit) || 10,
      }

      const result = await subscriptionService.getAllSubscriptions(filters)
      res.json(result)
    } catch (error) {
      next(error)
    }
  }

  async getSubscriptionById(req, res, next) {
    try {
      const subscription = await subscriptionService.getSubscriptionById(req.params.id)
      res.json({ subscription })
    } catch (error) {
      next(error)
    }
  }

  async updateSubscription(req, res, next) {
    try {
      const subscription = await subscriptionService.updateSubscription(req.params.id, req.body)
      res.json({ subscription })
    } catch (error) {
      next(error)
    }
  }

  async cancelSubscription(req, res, next) {
    try {
      const subscription = await subscriptionService.cancelSubscription(req.params.id)
      res.json({ subscription })
    } catch (error) {
      next(error)
    }
  }

  async renewSubscription(req, res, next) {
    try {
      const { months = 1 } = req.body
      const subscription = await subscriptionService.renewSubscription(req.params.id, months)
      res.json({ subscription })
    } catch (error) {
      next(error)
    }
  }
}
