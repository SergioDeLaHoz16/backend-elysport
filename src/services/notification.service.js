import { supabase } from "../utils/supabase.js"
import { NotificationSubject } from "../observers/NotificationSubject.js"
import { NotificationObserver } from "../observers/NotificationObserver.js"
import { EmailObserver } from "../observers/EmailObserver.js"

// Initialize notification system with observers
const notificationSubject = new NotificationSubject()
notificationSubject.attach(new NotificationObserver())
notificationSubject.attach(new EmailObserver())

export class NotificationService {
  async createNotification(notificationData) {
    const { userId, type, title, message, sendEmail = false } = notificationData

    // Get user for email
    let user = null
    if (sendEmail) {
      const { data } = await supabase.from("users").select("email").eq("id", userId).single()
      user = data
    }

    // Notify observers
    await notificationSubject.notify({
      type,
      userId,
      title,
      message,
      userEmail: user?.email,
    })

    return { success: true }
  }

  async getAllNotifications(filters = {}) {
    const { userId, type, isRead, page = 1, limit = 10 } = filters

    let query = supabase.from("notifications").select("*, users(id, first_name, last_name, email)", { count: "exact" })

    if (userId) query = query.eq("user_id", userId)
    if (type) query = query.eq("type", type)
    if (isRead !== undefined) query = query.eq("is_read", isRead)

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: notifications, error, count } = await query.order("created_at", { ascending: false }).range(from, to)

    if (error) throw error

    return {
      notifications,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    }
  }

  async markAsRead(id) {
    const { data: notification, error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id)
      .select()
      .single()

    if (error) throw error

    return notification
  }

  async markAllAsRead(userId) {
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false)

    if (error) throw error
  }

  async deleteNotification(id) {
    const { error } = await supabase.from("notifications").delete().eq("id", id)

    if (error) throw error
  }

  async notifyExpiringSubscriptions() {
    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)

    const { data: expiringSubscriptions, error } = await supabase
      .from("subscriptions")
      .select("*, users(id, first_name, email)")
      .eq("status", "ACTIVE")
      .lte("end_date", threeDaysFromNow.toISOString())
      .gte("end_date", new Date().toISOString())

    if (error) throw error

    for (const subscription of expiringSubscriptions) {
      await this.createNotification({
        userId: subscription.user_id,
        type: "EXPIRATION",
        title: "Suscripción por vencer",
        message: `Hola ${subscription.users.first_name}, tu suscripción ${subscription.plan_name} vence el ${new Date(subscription.end_date).toLocaleDateString()}.`,
        sendEmail: true,
      })
    }

    return expiringSubscriptions.length
  }
}
