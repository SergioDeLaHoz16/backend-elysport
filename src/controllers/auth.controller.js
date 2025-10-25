import { AuthService } from "../services/auth.service.js"

const authService = new AuthService()

export class AuthController {
  async register(req, res, next) {
    try {

      console.log("📥 Datos recibidos en /auth/register:", req.body)
      const result = await authService.register(req.body)
      res.status(201).json(result)
    } catch (error) {
      next(error)
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body
      const result = await authService.login(email, password)
      res.json(result)
    } catch (error) {
      next(error)
    }
  }

  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body
      const result = await authService.refresh(refreshToken)
      res.json(result)
    } catch (error) {
      next(error)
    }
  }

  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body
      await authService.logout(refreshToken)
      res.json({ message: "Logged out successfully" })
    } catch (error) {
      next(error)
    }
  }

  async logoutAll(req, res, next) {
    try {
      await authService.logoutAll(req.user.id)
      res.json({ message: "Logged out from all devices" })
    } catch (error) {
      next(error)
    }
  }

  async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body
      await authService.changePassword(req.user.id, currentPassword, newPassword)
      res.json({ message: "Password changed successfully" })
    } catch (error) {
      next(error)
    }
  }

  async me(req, res, next) {
    try {
      res.json({ user: req.user })
    } catch (error) {
      next(error)
    }
  }
}
