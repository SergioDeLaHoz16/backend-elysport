import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export class AdminService {
  async createUser({ email, password, first_name, last_name, role }) {
    try {
      // ✅ 1. Crear el usuario en Supabase Auth
      const { data, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { role },
      });

      if (authError) {
        console.error("[AdminService] Error creando usuario en Auth:", authError.message);
        throw new Error("No se pudo crear el usuario en Supabase Auth.");
      }

      const userId = data.user.id;

      // ✅ 2. Insertar registro en public.users
      const { error: dbError } = await supabaseAdmin.from("users").insert({
        id: userId,
        email,
        first_name,
        last_name,
        role,
        is_active: true,
      });

      if (dbError) {
        console.error("[AdminService] Error insertando usuario en tabla users:", dbError.message);
        throw new Error("Usuario creado en Auth, pero falló al insertar en public.users");
      }

      return { id: userId, email, role };
    } catch (err) {
      console.error("[AdminService] Error general:", err.message);
      throw err;
    }
  }
}
