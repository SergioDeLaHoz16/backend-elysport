// src/controllers/admin.controller.js
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ⚠️ usa la SERVICE_ROLE_KEY (no la ANON)
);

export class AdminController {
  /**
   * ✅ Crea un nuevo usuario tanto en Supabase Auth como en public.users
   */
  async createUser(req, res) {
    try {
      const { email, password, first_name, last_name, phone, role } = req.body;

      if (!email || !password || !first_name || !last_name || !role) {
        return res.status(400).json({ error: "Faltan datos obligatorios" });
      }

      // 1️⃣ Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role },
      });

      if (authError) {
        console.error("[AdminController] Error creando usuario en Supabase:", authError.message);
        return res.status(400).json({ error: authError.message });
      }

      const userId = authData.user.id;

      // 2️⃣ Insertar en public.users
      const { error: dbError } = await supabase.from("users").insert([
        {
          id: userId,
          email,
          first_name,
          last_name,
          phone,
          role,
          is_active: true,
        },
      ]);

      if (dbError) {
        console.error("[AdminController] Error insertando en tabla users:", dbError.message);
        return res.status(400).json({ error: dbError.message });
      }

      return res.status(201).json({
        message: "Usuario creado correctamente",
        user: { id: userId, email, first_name, last_name, role },
      });
    } catch (error) {
      console.error("[AdminController] Error general en createUser:", error);
      res.status(500).json({ error: "Error interno al crear usuario" });
    }
  }
}
