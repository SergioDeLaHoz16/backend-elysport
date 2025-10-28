import rateLimit from "express-rate-limit"

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
})

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Limit auth attempts
  message: "Too many authentication attempts, please try again later.",
  skipSuccessfulRequests: true,
})

export const refreshRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Max 10 refresh attempts per minute
  message: "Too many refresh attempts, please try again later.",
  skipSuccessfulRequests: true,
})
