import { supabase } from "../utils/supabase.js"

export class DashboardService {
  async getGeneralStats(filters = {}) {
    try {
      const { startDate, endDate } = filters

      // 📆 Filtros de fecha opcionales
      const dateFilter = {}
      if (startDate) dateFilter.gte = new Date(startDate).toISOString()
      if (endDate) dateFilter.lte = new Date(endDate).toISOString()

      // 🚀 Consultas en paralelo, pero solo traen conteos o campos simples
      const [
        totalUsersRes,
        activeUsersRes,
        totalClientsRes,
        activeSubsRes,
        expiringSubsRes,
        totalRevenueRes,
        monthlyRevenueRes,
        totalAttendancesRes,
        currentlyPresentRes,
        unreadNotificationsRes
      ] = await Promise.all([
        supabase.from("users").select("id", { count: "exact", head: true }),
        supabase.from("users").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "CLIENT"),
        supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "ACTIVE"),
        supabase.from("subscriptions")
          .select("id", { count: "exact", head: true })
          .eq("status", "ACTIVE")
          .lte("end_date", new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString())
          .gte("end_date", new Date().toISOString()),
        supabase.from("payments").select("amount").eq("status", "COMPLETED"),
        supabase.from("payments")
          .select("amount")
          .eq("status", "COMPLETED")
          .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
        supabase.from("attendances").select("id", { count: "exact", head: true }),
        supabase.from("attendances").select("id", { count: "exact", head: true }).is("check_out", null),
        supabase.from("notifications").select("id", { count: "exact", head: true }).eq("is_read", false),
      ])

      const totalRevenue = (totalRevenueRes.data ?? []).reduce((sum, p) => sum + (p.amount || 0), 0)
      const revenueThisMonth = (monthlyRevenueRes.data ?? []).reduce((sum, p) => sum + (p.amount || 0), 0)

      return {
        users: {
          total: totalUsersRes.count ?? 0,
          active: activeUsersRes.count ?? 0,
          clients: totalClientsRes.count ?? 0,
        },
        subscriptions: {
          active: activeSubsRes.count ?? 0,
          expiring: expiringSubsRes.count ?? 0,
        },
        revenue: {
          total: totalRevenue,
          thisMonth: revenueThisMonth,
        },
        attendance: {
          total: totalAttendancesRes.count ?? 0,
          currentlyPresent: currentlyPresentRes.count ?? 0,
        },
        notifications: {
          unread: unreadNotificationsRes.count ?? 0,
        },
      }
    } catch (err) {
      console.error("[DashboardService] Error en getGeneralStats:", err)
      throw new Error("No se pudieron obtener las estadísticas generales")
    }
  }

  async getRecentActivity(limit = 10) {
    // 🚀 Optimizado: sin joins costosos, se obtienen nombres aparte
    const [{ data: recentPayments }, { data: recentAttendances }, { data: recentSubs }] = await Promise.all([
      supabase.from("payments").select("id, user_id, amount, method, created_at").order("created_at", { ascending: false }).limit(limit),
      supabase.from("attendances").select("id, user_id, check_in, check_out").order("check_in", { ascending: false }).limit(limit),
      supabase.from("subscriptions").select("id, user_id, plan_name, created_at").order("created_at", { ascending: false }).limit(limit),
    ])

    const userIds = [
      ...new Set([
        ...(recentPayments ?? []).map(p => p.user_id),
        ...(recentAttendances ?? []).map(a => a.user_id),
        ...(recentSubs ?? []).map(s => s.user_id),
      ]),
    ]

    let userMap = {}
    if (userIds.length > 0) {
      const { data: users } = await supabase.from("users").select("id, first_name, last_name").in("id", userIds)
      userMap = (users ?? []).reduce((acc, u) => {
        acc[u.id] = `${u.first_name} ${u.last_name}`
        return acc
      }, {})
    }

    const activities = [
      ...(recentPayments ?? []).map(p => ({
        type: "payment",
        user: userMap[p.user_id] || "Usuario desconocido",
        description: `Pago de $${p.amount.toLocaleString()} (${p.method})`,
        date: p.created_at,
      })),
      ...(recentAttendances ?? []).map(a => ({
        type: "attendance",
        user: userMap[a.user_id] || "Usuario desconocido",
        description: a.check_out ? "Salida del gimnasio" : "Ingreso al gimnasio",
        date: a.check_in,
      })),
      ...(recentSubs ?? []).map(s => ({
        type: "subscription",
        user: userMap[s.user_id] || "Usuario desconocido",
        description: `Nueva suscripción: ${s.plan_name}`,
        date: s.created_at,
      })),
    ]

    return activities.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit)
  }
}
