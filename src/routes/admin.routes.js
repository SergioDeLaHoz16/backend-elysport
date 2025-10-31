import express from "express";
import { AdminController } from "../controllers/admin.controller.js";
import { authenticateUser, requireAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();
const controller = new AdminController();

// ✅ Solo administradores autenticados pueden crear usuarios
router.post(
  "/create-user",
  authenticateUser,
  requireAdmin,
  (req, res) => controller.createUser(req, res)
);

export default router;
