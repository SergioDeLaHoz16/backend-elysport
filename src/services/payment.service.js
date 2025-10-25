import { supabaseAdmin } from "../utils/supabase.js"
import { PaymentFactory } from "../factories/PaymentFactory.js"

export class PaymentService {
  async createPayment(paymentData) {
    const { userId, subscriptionId, amount, method, transactionId, notes } = paymentData

    // Validate user exists
    const { data: user, error: userError } = await supabaseAdmin.from("users").select("id").eq("id", userId).single()

    if (userError || !user) {
      const error = new Error("User not found")
      error.statusCode = 404
      throw error
    }

    // Validate subscription if provided
    if (subscriptionId) {
      const { data: subscription, error: subError } = await supabaseAdmin
        .from("subscriptions")
        .select("id")
        .eq("id", subscriptionId)
        .single()

      if (subError || !subscription) {
        const error = new Error("Subscription not found")
        error.statusCode = 404
        throw error
      }
    }

    // Create payment using Factory Pattern
    const paymentInstance = PaymentFactory.createPayment({
      userId,
      subscriptionId,
      amount,
      method,
      transactionId,
      notes,
      status: "COMPLETED",
    })

    // Validate payment based on method
    if (!paymentInstance.validate()) {
      const error = new Error("Invalid payment data for selected method")
      error.statusCode = 400
      throw error
    }

    // Save to database
    const { data: payment, error } = await supabaseAdmin
      .from("payments")
      .insert({
        user_id: userId,
        subscription_id: subscriptionId,
        amount,
        method,
        transaction_id: transactionId,
        notes,
        status: "COMPLETED",
      })
      .select(`
        *,
        user:users(id, first_name, last_name, email),
        subscription:subscriptions(*)
      `)
      .single()

    if (error) throw error

    // Process payment (get instructions, etc.)
    const processedPayment = paymentInstance.process()

    return {
      payment,
      processing: processedPayment,
    }
  }

  async getAllPayments(filters = {}) {
    const { userId, method, status, startDate, endDate, page = 1, limit = 10 } = filters

    let query = supabaseAdmin.from("payments").select(
      `
        *,
        user:users(id, first_name, last_name, email),
        subscription:subscriptions(id, plan_name)
      `,
      { count: "exact" },
    )

    if (userId) query = query.eq("user_id", userId)
    if (method) query = query.eq("method", method)
    if (status) query = query.eq("status", status)
    if (startDate) query = query.gte("created_at", new Date(startDate).toISOString())
    if (endDate) query = query.lte("created_at", new Date(endDate).toISOString())

    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to).order("created_at", { ascending: false })

    const { data: payments, error, count } = await query

    if (error) throw error

    return {
      payments: payments || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    }
  }

  async getPaymentById(id) {
    const { data: payment, error } = await supabaseAdmin
      .from("payments")
      .select(`
        *,
        user:users(id, first_name, last_name, email, phone),
        subscription:subscriptions(*)
      `)
      .eq("id", id)
      .single()

    if (error || !payment) {
      const err = new Error("Payment not found")
      err.statusCode = 404
      throw err
    }

    return payment
  }

  async getPaymentStats(filters = {}) {
    const { startDate, endDate } = filters

    let query = supabaseAdmin
      .from("payments")
      .select("amount, method, created_at, user:users(first_name, last_name)")
      .eq("status", "COMPLETED")

    if (startDate) query = query.gte("created_at", new Date(startDate).toISOString())
    if (endDate) query = query.lte("created_at", new Date(endDate).toISOString())

    const { data: payments, error } = await query

    if (error) throw error

    const totalRevenue = payments?.reduce((sum, p) => sum + p.amount, 0) || 0
    const totalPayments = payments?.length || 0

    // Group by method
    const paymentsByMethod = {}
    payments?.forEach((p) => {
      if (!paymentsByMethod[p.method]) {
        paymentsByMethod[p.method] = { method: p.method, _sum: { amount: 0 }, _count: 0 }
      }
      paymentsByMethod[p.method]._sum.amount += p.amount
      paymentsByMethod[p.method]._count += 1
    })

    const recentPayments = payments?.slice(0, 5) || []

    return {
      totalRevenue,
      totalPayments,
      paymentsByMethod: Object.values(paymentsByMethod),
      recentPayments,
    }
  }
}
