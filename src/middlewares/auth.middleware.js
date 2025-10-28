// middlewares/auth.middleware.js
import jwt from "jsonwebtoken";

export const authenticateUser = (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ error: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Guardamos los datos del usuario autenticado
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};
