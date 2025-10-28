import { supabase, supabaseAdmin } from "../utils/supabase.js"
import { sanitizeUser } from "../utils/sanitize.js"

export class AuthService {
  async register(userData) {
    const { email, password, first_name, last_name, role, phone } = userData
    console.log("📥 Registrando usuario:", email)

    // Verificar si ya existe
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      throw new Error(`Error verificando usuario existente: ${checkError.message}`)
    }

    if (existingUser) {
      const error = new Error("El usuario ya existe")
      error.statusCode = 409
      throw error
    }

    // Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name,
        last_name,
        role: role || "CLIENT",
        phone,
      },
    })

    if (authError) throw new Error(authError.message)

    // Insertar en tabla de usuarios
    const { error: insertError } = await supabaseAdmin.from("users").insert([
      {
        id: authData.user.id,
        email,
        phone,
        role: role || "CLIENT",
        first_name,
        last_name,
        is_active: true,
      },
    ])
    if (insertError) throw new Error(insertError.message)

    // Iniciar sesión automáticamente
    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (sessionError) throw new Error(sessionError.message)

    return {
      user: sanitizeUser(authData.user),
      accessToken: sessionData.session.access_token,
      refreshToken: sessionData.session.refresh_token,
    }
  }

  async login(email, password) {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      const error = new Error("Credenciales inválidas")
      error.statusCode = 401
      throw error
    }

    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single()

    if (userError || !user) {
      const error = new Error("Usuario no encontrado")
      error.statusCode = 404
      throw error
    }

    if (!user.is_active) {
      const error = new Error("Cuenta inactiva")
      error.statusCode = 403
      throw error
    }

    return {
      user: sanitizeUser(user),
      accessToken: authData.session.access_token,
      refreshToken: authData.session.refresh_token,
    }
  }

  async refresh(refreshToken) {
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    })

    if (error || !data?.session) {
      const err = new Error("Invalid refresh token")
      err.statusCode = 401
      throw err
    }

    return {
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    }
  }

  async logout(accessToken) {
    if (!accessToken) return
    await supabase.auth.setSession({ access_token: accessToken, refresh_token: "" })
    await supabase.auth.signOut()
  }

  async logoutAll(userId) {
    await supabaseAdmin.auth.admin.signOut(userId, "global")
  }

  async changePassword(userId, currentPassword, newPassword) {
    const { data: user } = await supabaseAdmin.from("users").select("email").eq("id", userId).single()
    if (!user) throw new Error("User not found")

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })
    if (signInError) throw new Error("Contraseña actual incorrecta")

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    })
    if (updateError) throw updateError

    await this.logoutAll(userId)
  }

  async verifyToken(accessToken) {
    const { data, error } = await supabase.auth.getUser(accessToken)
    if (error || !data.user) {
      const err = new Error("Invalid token")
      err.statusCode = 401
      throw err
    }
    return data.user
  }
}
