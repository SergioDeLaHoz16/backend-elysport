import { supabaseAdmin, supabase } from "../utils/supabase.js"

/**
 * ✅ Middleware de autenticación
 * - Verifica el JWT en cookies o en el header Authorization
 * - Obtiene los datos del usuario desde la base de datos
 */
export const authenticate = async (req, res, next) => {
  try {
    const token =
      req.cookies?.access_token ||
      (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : null)

    if (!token) {
      return res.status(401).json({ error: "No token provided" })
    }

    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) {
      return res.status(401).json({ error: "Invalid or expired token" })
    }

    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("id, email, role, first_name, last_name, is_active")
      .eq("id", data.user.id)
      .single()

    if (userError || !user || !user.is_active) {
      return res.status(401).json({ error: "User not found or inactive" })
    }

    // 4️⃣ Adjuntar datos del usuario al request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      isActive: user.is_active,
    }

    next()
  } catch (error) {
    console.error("❌ Auth error:", error.message)
    return res.status(401).json({ error: "Invalid or expired token" })
  }
}

/**
 * ✅ Middleware de autorización por roles
 * - Permite acceso solo a los roles definidos
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: insufficient permissions" })
    }

    next()
  }
}
