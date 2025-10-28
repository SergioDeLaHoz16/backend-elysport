import { AttendanceService } from "../services/attendance.service.js"

const attendanceService = new AttendanceService()

export class AttendanceController {
  async checkIn(req, res, next) {
    try {
      // ✅ Ya no se pasa el userId manualmente desde el body
      const userId = req.user.id // viene del token JWT
      const { notes } = req.body

      const attendance = await attendanceService.checkIn(userId, notes)
      res.status(201).json({ attendance })
    } catch (error) {
      next(error)
    }
  }

  async checkOut(req, res, next) {
    try {
      const userId = req.user.id // ✅ también viene del token
      const attendance = await attendanceService.checkOut(userId)
      res.json({ attendance })
    } catch (error) {
      next(error)
    }
  }

  async getAllAttendances(req, res, next) {
    try {
      const filters = {
        // ✅ Si el usuario es ADMIN puede filtrar por userId; si no, solo ve los suyos
        userId: req.user.role === "ADMIN" ? req.query.userId : req.user.id,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        page: Number(req.query.page) || 1,
        limit: Number(req.query.limit) || 10,
      }

      const result = await attendanceService.getAttendances(filters)
      res.json(result)
    } catch (error) {
      next(error)
    }
  }

  async getCurrentlyPresent(req, res, next) {
    try {
      const attendances = await attendanceService.getCurrentlyPresent()
      res.json({ attendances })
    } catch (error) {
      next(error)
    }
  }

  async getAttendanceStats(req, res, next) {
    try {
      const filters = {
        startDate: req.query.startDate,
        endDate: req.query.endDate,
      }

      const stats = await attendanceService.getAttendanceStats(filters)
      res.json(stats)
    } catch (error) {
      next(error)
    }
  }
}
