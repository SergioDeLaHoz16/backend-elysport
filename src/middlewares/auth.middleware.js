// middlewares/auth.middleware.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

/**
 * ✅ Middleware para autenticar usuarios con el token JWT de Supabase
 * Busca el token en headers o cookies
 */
export const authenticateUser = async (req, res, next) => {
  try {
    // Buscar el token JWT (puede venir en el header o cookie)
    const authHeader = req.headers.authorization;
    const cookieToken = req.cookies?.accessToken || req.cookies?.token;
    const token =
      authHeader?.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : cookieToken;

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // ✅ Validar token con Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
      console.error("[authenticateUser] Token inválido o expirado:", error?.message);
      return res.status(401).json({ error: "Token inválido o expirado" });
    }

    // ✅ Agregar usuario normalizado al request
    req.user = {
      id: data.user.id,
      email: data.user.email,
      role: (data.user.user_metadata?.role || "CLIENT").toLowerCase(), // 👈 AQUÍ el cambio correcto
    };

    next();
  } catch (err) {
    console.error("[authenticateUser] Error general:", err.message);
    return res.status(500).json({ error: "Error interno al autenticar usuario" });
  }
};

/**
 * ✅ Middleware adicional para asegurar que solo ADMIN pueda acceder
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Acceso denegado. Solo administradores." });
  }
  next();
};
