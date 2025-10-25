import { supabase } from "../utils/supabase.js"
import { ReportBuilder } from "../builders/ReportBuilder.js"
import { PDFReportGenerator } from "../builders/PDFReportGenerator.js"
import { ExcelReportGenerator } from "../builders/ExcelReportGenerator.js"

export class ReportService {
  async generateUsersReport(filters = {}) {
    const { role, isActive, format = "pdf" } = filters

    let query = supabase.from("users").select("*, profiles(*), subscriptions(*)")

    if (role) query = query.eq("role", role)
    if (isActive !== undefined) query = query.eq("is_active", isActive)

    const { data: users, error } = await query.order("created_at", { ascending: false })

    if (error) throw error

    // Build report using Builder Pattern
    const builder = new ReportBuilder()
    const report = builder
      .setTitle("Reporte de Usuarios - ElySport")
      .setSubtitle(`Generado el ${new Date().toLocaleDateString()}`)
      .setData(
        users.map((user) => {
          const activeSubscription = user.subscriptions?.find((s) => s.status === "ACTIVE")
          return {
            firstName: user.first_name,
            lastName: user.last_name,
            email: user.email,
            role: user.role,
            phone: user.phone || "N/A",
            isActive: user.is_active ? "Activo" : "Inactivo",
            subscription: activeSubscription?.plan_name || "Sin suscripción",
          }
        }),
      )
      .setColumns([
        { key: "firstName", label: "Nombre" },
        { key: "lastName", label: "Apellido" },
        { key: "email", label: "Email" },
        { key: "role", label: "Rol" },
        { key: "phone", label: "Teléfono" },
        { key: "isActive", label: "Estado" },
        { key: "subscription", label: "Suscripción" },
      ])
      .setFilters({
        Rol: role || "Todos",
        Estado: isActive !== undefined ? (isActive ? "Activos" : "Inactivos") : "Todos",
      })
      .setFormat(format)
      .setMetadata({ totalRecords: users.length })
      .build()

    // Generate report based on format
    if (format === "pdf") {
      return await PDFReportGenerator.generate(report)
    }
    return ExcelReportGenerator.generate(report)
  }

  async generatePaymentsReport(filters = {}) {
    const { startDate, endDate, method, format = "pdf" } = filters

    let query = supabase.from("payments").select("*, users(first_name, last_name, email), subscriptions(plan_name)")

    if (method) query = query.eq("method", method)
    if (startDate) query = query.gte("created_at", new Date(startDate).toISOString())
    if (endDate) query = query.lte("created_at", new Date(endDate).toISOString())

    const { data: payments, error } = await query.order("created_at", { ascending: false })

    if (error) throw error

    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0)

    const builder = new ReportBuilder()
    const report = builder
      .setTitle("Reporte de Pagos - ElySport")
      .setSubtitle(`Total recaudado: $${totalAmount.toLocaleString()}`)
      .setData(
        payments.map((payment) => ({
          date: new Date(payment.created_at).toLocaleDateString(),
          userName: `${payment.users.first_name} ${payment.users.last_name}`,
          amount: `$${payment.amount.toLocaleString()}`,
          method: payment.method,
          subscription: payment.subscriptions?.plan_name || "N/A",
          transactionId: payment.transaction_id || "N/A",
        })),
      )
      .setColumns([
        { key: "date", label: "Fecha" },
        { key: "userName", label: "Usuario" },
        { key: "amount", label: "Monto" },
        { key: "method", label: "Método" },
        { key: "subscription", label: "Suscripción" },
        { key: "transactionId", label: "ID Transacción" },
      ])
      .setFilters({
        "Fecha inicio": startDate || "N/A",
        "Fecha fin": endDate || "N/A",
        Método: method || "Todos",
      })
      .setFormat(format)
      .setMetadata({ totalRecords: payments.length })
      .build()

    if (format === "pdf") {
      return await PDFReportGenerator.generate(report)
    }
    return ExcelReportGenerator.generate(report)
  }

  async generateAttendancesReport(filters = {}) {
    const { startDate, endDate, userId, format = "pdf" } = filters

    let query = supabase.from("attendances").select("*, users(first_name, last_name, email)")

    if (userId) query = query.eq("user_id", userId)
    if (startDate) query = query.gte("check_in", new Date(startDate).toISOString())
    if (endDate) query = query.lte("check_in", new Date(endDate).toISOString())

    const { data: attendances, error } = await query.order("check_in", { ascending: false })

    if (error) throw error

    const builder = new ReportBuilder()
    const report = builder
      .setTitle("Reporte de Asistencias - ElySport")
      .setSubtitle(`Generado el ${new Date().toLocaleDateString()}`)
      .setData(
        attendances.map((attendance) => ({
          date: new Date(attendance.check_in).toLocaleDateString(),
          userName: `${attendance.users.first_name} ${attendance.users.last_name}`,
          checkIn: new Date(attendance.check_in).toLocaleTimeString(),
          checkOut: attendance.check_out ? new Date(attendance.check_out).toLocaleTimeString() : "En gimnasio",
          duration: attendance.duration ? `${attendance.duration} min` : "N/A",
          notes: attendance.notes || "N/A",
        })),
      )
      .setColumns([
        { key: "date", label: "Fecha" },
        { key: "userName", label: "Usuario" },
        { key: "checkIn", label: "Entrada" },
        { key: "checkOut", label: "Salida" },
        { key: "duration", label: "Duración" },
        { key: "notes", label: "Notas" },
      ])
      .setFilters({
        "Fecha inicio": startDate || "N/A",
        "Fecha fin": endDate || "N/A",
        Usuario: userId || "Todos",
      })
      .setFormat(format)
      .setMetadata({ totalRecords: attendances.length })
      .build()

    if (format === "pdf") {
      return await PDFReportGenerator.generate(report)
    }
    return ExcelReportGenerator.generate(report)
  }
}
