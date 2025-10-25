import  {AttendanceService} from "../services/attendance.service.js"

const attendanceService = new AttendanceService()

export class AttendanceController {
  async checkIn(req, res, next) {
    try {
      const { userId, notes } = req.body
      const attendance = await attendanceService.checkIn(userId, notes)
      res.status(201).json({ attendance })
    } catch (error) {
      next(error)
    }
  }

  async checkOut(req, res, next) {
    try {
      const attendance = await attendanceService.checkOut(req.params.id)
      res.json({ attendance })
    } catch (error) {
      next(error)
    }
  }

  async getAllAttendances(req, res, next) {
    try {
      const filters = {
        userId: req.query.userId,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        page: Number.parseInt(req.query.page) || 1,
        limit: Number.parseInt(req.query.limit) || 10,
      }

      const result = await attendanceService.getAllAttendances(filters)
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
