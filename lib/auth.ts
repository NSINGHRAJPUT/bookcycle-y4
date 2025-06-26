import { supabase } from "./supabase"
import type { User } from "./supabase"

export async function signUp(
  email: string,
  password: string,
  userData: {
    name: string
    role: "student" | "manager"
    institution?: string
  },
) {
  try {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) throw authError

    if (authData.user) {
      // Create user profile
      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .insert({
          id: authData.user.id,
          name: userData.name,
          email,
          role: userData.role,
          institution: userData.institution,
          reward_points: userData.role === "student" ? 100 : 0, // Welcome bonus for students
        })
        .select()
        .single()

      if (profileError) throw profileError

      return { user: profileData, session: authData.session }
    }

    throw new Error("Failed to create user")
  } catch (error) {
    console.error("Sign up error:", error)
    throw error
  }
}

export async function signIn(email: string, password: string) {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) throw authError

    if (authData.user) {
      // Get user profile
      const { data: profileData, error: profileError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .single()

      if (profileError) throw profileError

      return { user: profileData, session: authData.session }
    }

    throw new Error("Failed to sign in")
  } catch (error) {
    console.error("Sign in error:", error)
    throw error
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser()

    if (!authUser) return null

    const { data: profileData, error } = await supabase.from("users").select("*").eq("id", authUser.id).single()

    if (error) throw error

    return profileData
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}
