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

    console.log("🧩 Creando usuario en Supabase Auth...")

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

    if (authError) {
      console.error("❌ Error creando usuario en Auth:", authError)
      const error = new Error(authError.message)
      error.statusCode = 400
      throw error
    }

    console.log("✅ Usuario Auth creado:", authData.user.id)

    // Insertar datos adicionales si tu trigger no lo hace automáticamente
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

    if (insertError) {
      console.error("❌ Error insertando usuario en tabla users:", insertError)
      throw new Error(insertError.message)
    }

    console.log("📦 Usuario insertado correctamente en tabla users")

    // Iniciar sesión inmediatamente
    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (sessionError) {
      console.error("❌ Error iniciando sesión:", sessionError)
      throw sessionError
    }

    return {
      user: sanitizeUser(authData.user),
      accessToken: sessionData.session.access_token,
      refreshToken: sessionData.session.refresh_token,
    }
  }

  async login(email, password) {
    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      const error = new Error("Invalid credentials")
      error.statusCode = 401
      throw error
    }

    // Get user data
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("*, profile:profiles(*)")
      .eq("id", authData.user.id)
      .single()

    if (userError || !user) {
      const error = new Error("User not found")
      error.statusCode = 404
      throw error
    }

    // Check if user is active
    if (!user.is_active) {
      const error = new Error("Account is inactive")
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
    try {
      // Refresh session with Supabase Auth
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      })

      if (error) {
        const err = new Error("Invalid refresh token")
        err.statusCode = 401
        throw err
      }

      return {
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
      }
    } catch (error) {
      throw error
    }
  }

  async logout(accessToken) {
    // Set the session before signing out
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: "", // Not needed for signOut
    })

    await supabase.auth.signOut()
  }

  async logoutAll(userId) {
    // Sign out all sessions for a user using admin client
    await supabaseAdmin.auth.admin.signOut(userId, "global")
  }

  async changePassword(userId, currentPassword, newPassword) {
    // Get user email
    const { data: user } = await supabaseAdmin.from("users").select("email").eq("id", userId).single()

    if (!user) {
      const error = new Error("User not found")
      error.statusCode = 404
      throw error
    }

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })

    if (signInError) {
      const error = new Error("Current password is incorrect")
      error.statusCode = 401
      throw error
    }

    // Update password using admin client
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    })

    if (updateError) {
      throw updateError
    }

    // Sign out all sessions
    await this.logoutAll(userId)
  }

  async requestPasswordReset(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password`,
    })

    if (error) {
      throw error
    }

    return { message: "Password reset email sent" }
  }

  async resetPassword(accessToken, newPassword) {
    // Set session with the access token from the reset link
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: "", // Not needed for password update
    })

    if (sessionError) {
      const error = new Error("Invalid or expired reset token")
      error.statusCode = 401
      throw error
    }

    // Update password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (updateError) {
      throw updateError
    }

    return { message: "Password reset successful" }
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
