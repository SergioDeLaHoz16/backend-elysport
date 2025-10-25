import { supabaseAdmin } from "../utils/supabase.js"

export class SubscriptionService {
  async createSubscription(subscriptionData) {
    const { userId, planName, startDate, endDate, price } = subscriptionData

    // Check if user exists
    const { data: user, error: userError } = await supabaseAdmin.from("users").select("id").eq("id", userId).single()

    if (userError || !user) {
      const error = new Error("User not found")
      error.statusCode = 404
      throw error
    }

    // Create subscription
    const { data: subscription, error } = await supabaseAdmin
      .from("subscriptions")
      .insert({
        user_id: userId,
        plan_name: planName,
        start_date: new Date(startDate).toISOString(),
        end_date: new Date(endDate).toISOString(),
        price,
        status: "ACTIVE",
      })
      .select(`
        *,
        user:users(id, first_name, last_name, email)
      `)
      .single()

    if (error) throw error

    return subscription
  }

  async getAllSubscriptions(filters = {}) {
    const { status, userId, page = 1, limit = 10 } = filters

    let query = supabaseAdmin.from("subscriptions").select(
      `
        *,
        user:users(id, first_name, last_name, email),
        payments(*)
      `,
      { count: "exact" },
    )

    if (status) query = query.eq("status", status)
    if (userId) query = query.eq("user_id", userId)

    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to).order("created_at", { ascending: false })

    const { data: subscriptions, error, count } = await query

    if (error) throw error

    return {
      subscriptions: subscriptions || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    }
  }

  async getSubscriptionById(id) {
    const { data: subscription, error } = await supabaseAdmin
      .from("subscriptions")
      .select(`
        *,
        user:users(id, first_name, last_name, email, phone),
        payments(*)
      `)
      .eq("id", id)
      .single()

    if (error || !subscription) {
      const err = new Error("Subscription not found")
      err.statusCode = 404
      throw err
    }

    // Sort payments
    if (subscription.payments) {
      subscription.payments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }

    return subscription
  }

  async updateSubscription(id, updateData) {
    const updates = { ...updateData }
    if (updateData.startDate) updates.start_date = new Date(updateData.startDate).toISOString()
    if (updateData.endDate) updates.end_date = new Date(updateData.endDate).toISOString()
    if (updateData.planName) updates.plan_name = updateData.planName

    const { data: subscription, error } = await supabaseAdmin
      .from("subscriptions")
      .update(updates)
      .eq("id", id)
      .select(`
        *,
        user:users(id, first_name, last_name, email)
      `)
      .single()

    if (error) throw error

    return subscription
  }

  async cancelSubscription(id) {
    const { data: subscription, error } = await supabaseAdmin
      .from("subscriptions")
      .update({ status: "CANCELLED" })
      .eq("id", id)
      .select("*")
      .single()

    if (error) throw error

    return subscription
  }

  async renewSubscription(id, months = 1) {
    const { data: subscription, error: fetchError } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError || !subscription) {
      const error = new Error("Subscription not found")
      error.statusCode = 404
      throw error
    }

    const newEndDate = new Date(subscription.end_date)
    newEndDate.setMonth(newEndDate.getMonth() + months)

    const { data: renewed, error: updateError } = await supabaseAdmin
      .from("subscriptions")
      .update({
        end_date: newEndDate.toISOString(),
        status: "ACTIVE",
      })
      .eq("id", id)
      .select("*")
      .single()

    if (updateError) throw updateError

    return renewed
  }

  async checkExpiredSubscriptions() {
    const now = new Date().toISOString()

    const { data, error } = await supabaseAdmin
      .from("subscriptions")
      .update({ status: "EXPIRED" })
      .eq("status", "ACTIVE")
      .lt("end_date", now)
      .select("*")

    if (error) throw error

    return { count: data?.length || 0 }
  }
}
