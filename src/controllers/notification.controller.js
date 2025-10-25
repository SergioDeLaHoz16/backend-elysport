import { NotificationService } from "../services/notification.service.js"

const notificationService = new NotificationService()

export class NotificationController {
  async createNotification(req, res, next) {
    try {
      const result = await notificationService.createNotification(req.body)
      res.status(201).json(result)
    } catch (error) {
      next(error)
    }
  }

  async getAllNotifications(req, res, next) {
    try {
      const filters = {
        userId: req.query.userId,
        type: req.query.type,
        isRead: req.query.isRead === "true" ? true : req.query.isRead === "false" ? false : undefined,
        page: Number.parseInt(req.query.page) || 1,
        limit: Number.parseInt(req.query.limit) || 10,
      }

      const result = await notificationService.getAllNotifications(filters)
      res.json(result)
    } catch (error) {
      next(error)
    }
  }

  async markAsRead(req, res, next) {
    try {
      const notification = await notificationService.markAsRead(req.params.id)
      res.json({ notification })
    } catch (error) {
      next(error)
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      await notificationService.markAllAsRead(req.user.id)
      res.json({ message: "All notifications marked as read" })
    } catch (error) {
      next(error)
    }
  }

  async deleteNotification(req, res, next) {
    try {
      await notificationService.deleteNotification(req.params.id)
      res.json({ message: "Notification deleted" })
    } catch (error) {
      next(error)
    }
  }
}
