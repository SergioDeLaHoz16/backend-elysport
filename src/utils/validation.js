import { z } from "zod"

export const validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.parseAsync(req.body)
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation error",
          details: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        })
      }
      next(error)
    }
  }
}
