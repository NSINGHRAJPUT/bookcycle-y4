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
    // Create auth user with metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: userData.name,
          role: userData.role,
          institution: userData.institution,
        },
      },
    })

    if (authError) throw authError

    if (authData.user) {
      // The trigger will automatically create the user profile
      // Wait a moment for the trigger to complete
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Get the created profile
      const { data: profileData, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", authData.user.id)
        .single()

      if (profileError) {
        console.error("Profile fetch error:", profileError)
        // If profile doesn't exist, create it manually
        const { data: manualProfileData, error: manualProfileError } = await supabase
          .from("user_profiles")
          .insert({
            id: authData.user.id,
            name: userData.name,
            email,
            role: userData.role,
            institution: userData.institution,
            reward_points: userData.role === "student" ? 100 : 0,
          })
          .select()
          .single()

        if (manualProfileError) throw manualProfileError
        return { user: manualProfileData, session: authData.session }
      }

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
        .from("user_profiles")
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

    const { data: profileData, error } = await supabase.from("user_profiles").select("*").eq("id", authUser.id).single()

    if (error) throw error

    return profileData
  } catch (error) {
    console.error("Get current user error:", error)
    return null
  }
}
