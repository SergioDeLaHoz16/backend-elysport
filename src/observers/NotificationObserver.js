import { supabase } from "../utils/supabase.js"
import { logger } from "../middlewares/logger.js"

export class NotificationObserver {
  async update(event) {
    try {
      const { type, userId, title, message } = event

      const { error } = await supabase.from("notifications").insert({
        user_id: userId,
        type,
        title,
        message,
      })

      if (error) throw error

      logger.info(`Notification created: ${type} for user ${userId}`)
    } catch (error) {
      logger.error(`Failed to create notification: ${error.message}`)
    }
  }
}
