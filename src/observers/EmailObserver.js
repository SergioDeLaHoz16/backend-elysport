import nodemailer from "nodemailer"
import { logger } from "../middlewares/logger.js"

export class EmailObserver {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    })
  }

  async update(event) {
    try {
      const { userEmail, title, message } = event

      if (!userEmail) {
        logger.warn("No email provided for notification")
        return
      }

      await this.transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: userEmail,
        subject: title,
        html: `
          <div style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #1E3A8A;">${title}</h2>
            <p>${message}</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 12px;">
              Este es un mensaje automático de ElySport. Por favor no responder.
            </p>
          </div>
        `,
      })

      logger.info(`Email sent to ${userEmail}`)
    } catch (error) {
      logger.error(`Failed to send email: ${error.message}`)
    }
  }
}
