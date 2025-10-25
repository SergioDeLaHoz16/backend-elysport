import { supabase, supabaseAdmin } from "../utils/supabase.js"

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" })
    }

    const token = authHeader.substring(7)

    // Verify token with Supabase
    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser(token)

    if (error || !authUser) {
      return res.status(401).json({ error: "Invalid token" })
    }

    // Fetch user data from database
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, email, role, first_name, last_name, is_active")
      .eq("id", authUser.id)
      .single()

    if (userError || !user || !user.is_active) {
      return res.status(401).json({ error: "User not found or inactive" })
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      isActive: user.is_active,
    }

    // Attach auth token for further operations
    req.authToken = token

    next()
  } catch (error) {
    return res.status(401).json({ error: "Authentication failed" })
  }
}

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: Insufficient permissions" })
    }

    next()
  }
}
