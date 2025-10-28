import { AuthService } from "../services/auth.service.js"
import { logger } from "../middlewares/logger.js"

const authService = new AuthService()

export class AuthController {
  async register(req, res, next) {
    try {
      console.log("📥 Datos recibidos en /auth/register:", req.body)
      const result = await authService.register(req.body)

      // Guardar tokens en cookies seguras
      res.cookie("access_token", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 1000, // 1 hora
      })
      res.cookie("refresh_token", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días
      })

      return res.status(201).json({ user: result.user })
    } catch (error) {
      next(error)
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body
      logger.debug(`Login attempt for email: ${email}`)

      const result = await authService.login(email, password)

      // Guardar tokens en cookies seguras
      res.cookie("access_token", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 1000,
      })
      res.cookie("refresh_token", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })

      logger.debug(`Login successful for email: ${email}`)
      res.status(200).json({ user: result.user })
    } catch (error) {
      logger.error(`Login failed for email: ${req.body.email} - ${error.message}`)
      next(error)
    }
  }

  async refresh(req, res, next) {
    try {
      logger.debug(`Refresh token attempt - Cookies present: ${JSON.stringify(Object.keys(req.cookies))}`)

      const refreshToken = req.cookies.refresh_token
      if (!refreshToken) {
        logger.warn("Refresh token missing from cookies")
        // 403 indicates the refresh token itself is invalid/missing
        return res.status(403).json({
          error: "No refresh token provided",
          code: "REFRESH_TOKEN_MISSING",
        })
      }

      const result = await authService.refresh(refreshToken)

      // Actualizar las cookies
      res.cookie("access_token", result.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 1000,
      })
      res.cookie("refresh_token", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })

      logger.debug("Token refreshed successfully")
      return res.status(200).json({
        message: "Token refreshed successfully",
      })
    } catch (error) {
      logger.error(`Token refresh failed: ${error.message}`)
      res.clearCookie("access_token")
      res.clearCookie("refresh_token")
      return res.status(403).json({
        error: "Invalid refresh token",
        code: "REFRESH_TOKEN_INVALID",
      })
    }
  }

  async logout(req, res, next) {
    try {
      const accessToken = req.cookies.access_token
      if (accessToken) await authService.logout(accessToken)

      // Limpiar cookies
      res.clearCookie("access_token")
      res.clearCookie("refresh_token")

      return res.status(200).json({ message: "Logged out successfully" })
    } catch (error) {
      next(error)
    }
  }

  async logoutAll(req, res, next) {
    try {
      await authService.logoutAll(req.user.id)
      res.clearCookie("access_token")
      res.clearCookie("refresh_token")
      res.status(200).json({ message: "Logged out from all devices" })
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
