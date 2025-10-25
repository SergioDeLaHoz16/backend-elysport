import { supabase, supabaseAdmin } from "../utils/supabase.js"
import { sanitizeUser } from "../utils/sanitize.js"

export class AuthService {
  async register(userData) {
    const { email, password, firstName, lastName, role, phone } = userData

    console.log("[v0] Starting registration for:", email)

    // Check if user already exists using admin client
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("email", email)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116 is "not found" which is expected
      console.error("[v0] Error checking existing user:", checkError)
      const error = new Error(`Database error checking user: ${checkError.message}`)
      error.statusCode = 500
      throw error
    }

    if (existingUser) {
      console.log("[v0] User already exists:", email)
      const error = new Error("User with this email already exists")
      error.statusCode = 409
      throw error
    }

    console.log("[v0] Creating auth user...")
    // Create user with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for admin registration
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        role: role || "CLIENT",
        phone,
      },
    })

    if (authError) {
      console.error("[v0] Auth creation error:", authError)
      const error = new Error(authError.message)
      error.statusCode = 400
      throw error
    }

    console.log("[v0] Auth user created:", authData.user.id)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("[v0] Fetching user data...")
    // Get the created user data
    const { data: user, error: userError } = await supabaseAdmin
      .from("users")
      .select("*, profile:profiles(*)")
      .eq("id", authData.user.id)
      .single()

    if (userError) {
      console.error("[v0] Error fetching user data:", {
        code: userError.code,
        message: userError.message,
        details: userError.details,
        hint: userError.hint,
      })

      // If user not found, it means the trigger didn't work
      if (userError.code === "PGRST116") {
        const error = new Error(
          "User authentication created but profile not found. Please ensure database tables and triggers are set up correctly.",
        )
        error.statusCode = 500
        throw error
      }

      const error = new Error(`Database error creating new user: ${userError.message}`)
      error.statusCode = 500
      throw error
    }

    console.log("[v0] User data fetched successfully")
    console.log("[v0] Signing in user...")

    // Generate session for the user
    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (sessionError) {
      console.error("[v0] Session creation error:", sessionError)
      throw sessionError
    }

    console.log("[v0] Registration completed successfully")

    return {
      user: sanitizeUser(user),
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
