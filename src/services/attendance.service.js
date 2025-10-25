import { supabase } from "../utils/supabase.js"

export class AttendanceService {
  async checkIn(userId, notes = null) {
    // Verify user exists and has active subscription
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*, subscriptions!inner(*)")
      .eq("id", userId)
      .eq("subscriptions.status", "ACTIVE")
      .gte("subscriptions.end_date", new Date().toISOString())
      .single()

    if (userError || !user) {
      const error = new Error("User not found or no active subscription")
      error.statusCode = 403
      throw error
    }

    // Check if user is already checked in
    const { data: existingAttendance } = await supabase
      .from("attendances")
      .select("*")
      .eq("user_id", userId)
      .is("check_out", null)
      .single()

    if (existingAttendance) {
      const error = new Error("User is already checked in")
      error.statusCode = 400
      throw error
    }

    // Create attendance record
    const { data: attendance, error } = await supabase
      .from("attendances")
      .insert({
        user_id: userId,
        check_in: new Date().toISOString(),
        notes,
      })
      .select("*, users(first_name, last_name, email)")
      .single()

    if (error) throw error

    return attendance
  }

  async checkOut(userId) {
    // Find active attendance
    const { data: attendance, error: findError } = await supabase
      .from("attendances")
      .select("*")
      .eq("user_id", userId)
      .is("check_out", null)
      .order("check_in", { ascending: false })
      .limit(1)
      .single()

    if (findError || !attendance) {
      const error = new Error("No active check-in found")
      error.statusCode = 404
      throw error
    }

    // Calculate duration
    const checkIn = new Date(attendance.check_in)
    const checkOut = new Date()
    const duration = Math.floor((checkOut - checkIn) / 60000) // minutes

    // Update attendance
    const { data: updated, error } = await supabase
      .from("attendances")
      .update({
        check_out: checkOut.toISOString(),
        duration,
      })
      .eq("id", attendance.id)
      .select("*, users(first_name, last_name, email)")
      .single()

    if (error) throw error

    return updated
  }

  async getAttendances(filters = {}) {
    const { userId, startDate, endDate, page = 1, limit = 10 } = filters

    let query = supabase.from("attendances").select("*, users(first_name, last_name, email)", { count: "exact" })

    if (userId) query = query.eq("user_id", userId)
    if (startDate) query = query.gte("check_in", new Date(startDate).toISOString())
    if (endDate) query = query.lte("check_in", new Date(endDate).toISOString())

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: attendances, error, count } = await query.order("check_in", { ascending: false }).range(from, to)

    if (error) throw error

    return {
      attendances,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    }
  }

  async getCurrentlyPresent() {
    const { data: attendances, error } = await supabase
      .from("attendances")
      .select("*, users(first_name, last_name, email)")
      .is("check_out", null)
      .order("check_in", { ascending: false })

    if (error) throw error

    return attendances
  }

  async getAttendanceById(id) {
    const { data: attendance, error } = await supabase
      .from("attendances")
      .select("*, users(first_name, last_name, email)")
      .eq("id", id)
      .single()

    if (error || !attendance) {
      const err = new Error("Attendance not found")
      err.statusCode = 404
      throw err
    }

    return attendance
  }

  async updateAttendance(id, updateData) {
    const { notes } = updateData

    const { data: attendance, error } = await supabase
      .from("attendances")
      .update({ notes })
      .eq("id", id)
      .select("*, users(first_name, last_name, email)")
      .single()

    if (error) throw error

    return attendance
  }

  async deleteAttendance(id) {
    const { error } = await supabase.from("attendances").delete().eq("id", id)

    if (error) throw error
  }
}
