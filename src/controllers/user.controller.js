import { UserService } from "../services/user.service.js"

const userService = new UserService()

export class UserController {
  async getAllUsers(req, res, next) {
    try {
      const filters = {
        role: req.query.role,
        isActive: req.query.isActive === "true" ? true : req.query.isActive === "false" ? false : undefined,
        search: req.query.search,
        page: Number.parseInt(req.query.page) || 1,
        limit: Number.parseInt(req.query.limit) || 10,
      }

      const result = await userService.getAllUsers(filters)
      res.json(result)
    } catch (error) {
      next(error)
    }
  }

  async getUserById(req, res, next) {
    try {
      const result = await userService.getUserById(req.params.id)
      res.json(result)
    } catch (error) {
      next(error)
    }
  }

  async updateUser(req, res, next) {
    try {
      const user = await userService.updateUser(req.params.id, req.body)
      res.json({ user })
    } catch (error) {
      next(error)
    }
  }

  async deleteUser(req, res, next) {
    try {
      await userService.deleteUser(req.params.id)
      res.json({ message: "User deleted successfully" })
    } catch (error) {
      next(error)
    }
  }

  async toggleUserStatus(req, res, next) {
    try {
      const user = await userService.toggleUserStatus(req.params.id)
      res.json({ user })
    } catch (error) {
      next(error)
    }
  }

  async getUserStats(req, res, next) {
    try {
      const stats = await userService.getUserStats(req.params.id)
      res.json(stats)
    } catch (error) {
      next(error)
    }
  }
}
