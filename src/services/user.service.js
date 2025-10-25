import { supabaseAdmin } from "../utils/supabase.js"
import { PersonFactory } from "../factories/PersonFactory.js"
import { sanitizeUser, sanitizeUsers } from "../utils/sanitize.js"

export class UserService {
  async getAllUsers(filters = {}) {
    const { role, isActive, search, page = 1, limit = 10 } = filters

    let query = supabaseAdmin.from("users").select(
      `
        *,
        profile:profiles(*),
        subscriptions!inner(*)
      `,
      { count: "exact" },
    )

    // Apply filters
    if (role) query = query.eq("role", role)
    if (isActive !== undefined) query = query.eq("is_active", isActive)
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Get active subscriptions only
    query = query.eq("subscriptions.status", "ACTIVE")
    query = query.order("end_date", { foreignTable: "subscriptions", ascending: false })

    // Pagination
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    // Order by created_at
    query = query.order("created_at", { ascending: false })

    const { data: users, error, count } = await query

    if (error) throw error

    // Use Factory Pattern to create appropriate person instances
    const persons = PersonFactory.createPersons(users || [])

    return {
      users: sanitizeUsers(users || []),
      persons: persons.map((p) => p.getInfo()),
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    }
  }

  async getUserById(id) {
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select(`
        *,
        profile:profiles(*),
        subscriptions(*),
        payments(*),
        attendances(*)
      `)
      .eq("id", id)
      .single()

    if (error || !user) {
      const err = new Error("User not found")
      err.statusCode = 404
      throw err
    }

    // Sort related data
    if (user.subscriptions) {
      user.subscriptions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }
    if (user.payments) {
      user.payments.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      user.payments = user.payments.slice(0, 10)
    }
    if (user.attendances) {
      user.attendances.sort((a, b) => new Date(b.check_in) - new Date(a.check_in))
      user.attendances = user.attendances.slice(0, 10)
    }

    // Use Factory Pattern to create appropriate person instance
    const person = PersonFactory.createPerson(user)

    return {
      user: sanitizeUser(user),
      person: person.getInfo(),
    }
  }

  async updateUser(id, updateData) {
    const { profile, ...userData } = updateData

    // Update user data
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .update(userData)
      .eq("id", id)
      .select(`*, profile:profiles(*)`)
      .single()

    if (userError) throw userError

    // Update profile if provided
    if (profile) {
      const { error: profileError } = await supabaseAdmin.from("profiles").update(profile).eq("user_id", id)

      if (profileError) throw profileError

      // Fetch updated profile
      const { data: updatedProfile } = await supabaseAdmin.from("profiles").select("*").eq("user_id", id).single()

      user.profile = updatedProfile
    }

    // If client and physical data updated, recalculate BMI
    if (user.role === "CLIENT" && profile?.weight && profile?.height) {
      const client = PersonFactory.createPerson(user)
      const bmi = client.calculateBMI()

      await supabaseAdmin
        .from("profiles")
        .update({ bmi: Number.parseFloat(bmi) })
        .eq("user_id", id)

      user.profile.bmi = Number.parseFloat(bmi)
    }

    return sanitizeUser(user)
  }

  async deleteUser(id) {
    // Delete from auth.users (cascade will handle public.users)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id)

    if (error) throw error
  }

  async toggleUserStatus(id) {
    const { data: user, error: fetchError } = await supabaseAdmin
      .from("users")
      .select("is_active")
      .eq("id", id)
      .single()

    if (fetchError || !user) {
      const error = new Error("User not found")
      error.statusCode = 404
      throw error
    }

    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from("users")
      .update({ is_active: !user.is_active })
      .eq("id", id)
      .select("*")
      .single()

    if (updateError) throw updateError

    return sanitizeUser(updatedUser)
  }

  async getUserStats(id) {
    const { data: user, error } = await supabaseAdmin
      .from("users")
      .select(`
        *,
        subscriptions(*),
        payments(*),
        attendances(*)
      `)
      .eq("id", id)
      .single()

    if (error || !user) {
      const err = new Error("User not found")
      err.statusCode = 404
      throw err
    }

    const activeSubscription = user.subscriptions?.find((sub) => sub.status === "ACTIVE")

    const totalPayments = user.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0

    const attendanceCount = user.attendances?.length || 0

    const lastAttendance = user.attendances?.sort((a, b) => new Date(b.check_in) - new Date(a.check_in))[0]

    return {
      activeSubscription,
      totalPayments,
      attendanceCount,
      lastAttendance,
    }
  }
}
