import { logger } from "./logger.js"

export const errorHandler = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  })

  // Supabase/PostgreSQL errors
  if (err.code === "23505") {
    // Unique violation
    return res.status(409).json({
      error: "Duplicate entry",
      message: "A record with this information already exists",
    })
  }

  if (err.code === "23503") {
    // Foreign key violation
    return res.status(400).json({
      error: "Invalid reference",
      message: "Referenced record does not exist",
    })
  }

  if (err.code === "22P02") {
    // Invalid text representation
    return res.status(400).json({
      error: "Invalid data format",
      message: "The provided data format is invalid",
    })
  }

  // Validation errors
  if (err.name === "ZodError") {
    return res.status(400).json({
      error: "Validation error",
      details: err.errors,
    })
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      error: "Invalid token",
      message: "The provided token is invalid",
    })
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      error: "Token expired",
      message: "The provided token has expired",
    })
  }

  // Default error
  const statusCode = err.statusCode || 500
  res.status(statusCode).json({
    error: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  })
}
