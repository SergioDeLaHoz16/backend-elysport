import { supabase } from "../utils/supabase.js"

export class DashboardService {
  async getGeneralStats(filters = {}) {
    const { startDate, endDate } = filters

    // Build date filter
    const dateFilter = {}
    if (startDate) dateFilter.gte = new Date(startDate).toISOString()
    if (endDate) dateFilter.lte = new Date(endDate).toISOString()

    // Get all stats in parallel
    const [
      { count: totalUsers },
      { count: activeUsers },
      { count: totalClients },
      { count: activeSubscriptions },
      { count: expiringSubscriptions },
      { data: totalRevenueData },
      { data: revenueThisMonthData },
      { count: totalAttendances },
      { count: currentlyPresent },
      { count: unreadNotifications },
    ] = await Promise.all([
      // Users stats
      supabase
        .from("users")
        .select("*", { count: "exact", head: true }),
      supabase.from("users").select("*", { count: "exact", head: true }).eq("is_active", true),
      supabase.from("users").select("*", { count: "exact", head: true }).eq("role", "CLIENT"),

      // Subscriptions stats
      supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "ACTIVE"),
      supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("status", "ACTIVE")
        .lte("end_date", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
        .gte("end_date", new Date().toISOString()),

      // Revenue stats
      supabase
        .from("payments")
        .select("amount")
        .eq("status", "COMPLETED"),
      supabase
        .from("payments")
        .select("amount")
        .eq("status", "COMPLETED")
        .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),

      // Attendance stats
      supabase
        .from("attendances")
        .select("*", { count: "exact", head: true }),
      supabase.from("attendances").select("*", { count: "exact", head: true }).is("check_out", null),

      // Notifications
      supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("is_read", false),
    ])

    const totalRevenue = totalRevenueData?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
    const revenueThisMonth = revenueThisMonthData?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0

    return {
      users: {
        total: totalUsers || 0,
        active: activeUsers || 0,
        clients: totalClients || 0,
      },
      subscriptions: {
        active: activeSubscriptions || 0,
        expiring: expiringSubscriptions || 0,
      },
      revenue: {
        total: totalRevenue,
        thisMonth: revenueThisMonth,
      },
      attendance: {
        total: totalAttendances || 0,
        currentlyPresent: currentlyPresent || 0,
      },
      notifications: {
        unread: unreadNotifications || 0,
      },
    }
  }

  async getRevenueByPeriod(filters = {}) {
    const { startDate, endDate, groupBy = "day" } = filters

    let query = supabase.from("payments").select("amount, created_at").eq("status", "COMPLETED")

    if (startDate) query = query.gte("created_at", new Date(startDate).toISOString())
    if (endDate) query = query.lte("created_at", new Date(endDate).toISOString())

    const { data: payments, error } = await query.order("created_at", { ascending: true })

    if (error) throw error

    // Group by period
    const grouped = {}

    for (const payment of payments) {
      let key
      const date = new Date(payment.created_at)

      if (groupBy === "day") {
        key = date.toISOString().split("T")[0]
      } else if (groupBy === "month") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      } else if (groupBy === "year") {
        key = String(date.getFullYear())
      }

      if (!grouped[key]) {
        grouped[key] = 0
      }
      grouped[key] += payment.amount
    }

    return Object.entries(grouped).map(([period, amount]) => ({
      period,
      amount,
    }))
  }

  async getRecentActivity(limit = 10) {
    const [{ data: recentPayments }, { data: recentAttendances }, { data: recentSubscriptions }] = await Promise.all([
      supabase
        .from("payments")
        .select("*, users(first_name, last_name)")
        .order("created_at", { ascending: false })
        .limit(limit),
      supabase
        .from("attendances")
        .select("*, users(first_name, last_name)")
        .order("check_in", { ascending: false })
        .limit(limit),
      supabase
        .from("subscriptions")
        .select("*, users(first_name, last_name)")
        .order("created_at", { ascending: false })
        .limit(limit),
    ])

    // Combine and sort by date
    const activities = [
      ...(recentPayments || []).map((p) => ({
        type: "payment",
        user: `${p.users.first_name} ${p.users.last_name}`,
        description: `Pago de $${p.amount.toLocaleString()} - ${p.method}`,
        date: p.created_at,
      })),
      ...(recentAttendances || []).map((a) => ({
        type: "attendance",
        user: `${a.users.first_name} ${a.users.last_name}`,
        description: a.check_out ? "Salió del gimnasio" : "Ingresó al gimnasio",
        date: a.check_in,
      })),
      ...(recentSubscriptions || []).map((s) => ({
        type: "subscription",
        user: `${s.users.first_name} ${s.users.last_name}`,
        description: `Nueva suscripción: ${s.plan_name}`,
        date: s.created_at,
      })),
    ]

    return activities.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit)
  }

  async getTopClients(limit = 5) {
    const { data: clients, error } = await supabase
      .from("users")
      .select("*, payments(*), attendances(*)")
      .eq("role", "CLIENT")

    if (error) throw error

    const clientStats = clients.map((client) => ({
      id: client.id,
      name: `${client.first_name} ${client.last_name}`,
      email: client.email,
      totalPayments: client.payments.filter((p) => p.status === "COMPLETED").reduce((sum, p) => sum + p.amount, 0),
      totalAttendances: client.attendances.length,
    }))

    return clientStats.sort((a, b) => b.totalPayments - a.totalPayments).slice(0, limit)
  }

  async getPaymentMethodDistribution() {
    const { data: payments, error } = await supabase.from("payments").select("method, amount").eq("status", "COMPLETED")

    if (error) throw error

    // Group by method
    const distribution = {}
    for (const payment of payments) {
      if (!distribution[payment.method]) {
        distribution[payment.method] = { total: 0, count: 0 }
      }
      distribution[payment.method].total += payment.amount
      distribution[payment.method].count += 1
    }

    return Object.entries(distribution).map(([method, data]) => ({
      method,
      total: data.total,
      count: data.count,
    }))
  }
}
