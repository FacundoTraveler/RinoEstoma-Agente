import { supabase } from '@/lib/supabase-client'
import { User as DBUser, UserType } from '@/lib/types'

/**
 * Authentication Utilities
 * Maneja autenticación, sesiones y gestión de usuarios
 */

export interface AuthSession {
  user: DBUser
  token: string
  expiresAt: number
}

export interface SignUpData {
  email: string
  password: string
  full_name?: string
  phone_number?: string
  user_type?: UserType
}

export interface SignInData {
  email: string
  password: string
}

/**
 * Registrar nuevo usuario
 */
export async function signUp(data: SignUpData): Promise<{
  success: boolean
  user?: DBUser
  error?: string
}> {
  try {
    // Crear usuario con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.full_name,
          phone_number: data.phone_number,
          user_type: data.user_type || 'patient',
        },
      },
    })

    if (authError) {
      return {
        success: false,
        error: authError.message,
      }
    }

    if (!authData.user) {
      return {
        success: false,
        error: 'Unknown error creating user',
      }
    }

    // Crear perfil en tabla users
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          email: data.email,
          phone_number: data.phone_number,
          full_name: data.full_name,
          user_type: data.user_type || 'patient',
        },
      ])
      .select()
      .single()

    if (profileError) {
      console.error('[v0] Error creating user profile:', profileError)
      return {
        success: false,
        error: 'Error creating user profile',
      }
    }

    return {
      success: true,
      user: profile,
    }
  } catch (error) {
    console.error('[v0] Sign up error:', error)
    return {
      success: false,
      error: 'Sign up failed',
    }
  }
}

/**
 * Iniciar sesión
 */
export async function signIn(data: SignInData): Promise<{
  success: boolean
  session?: AuthSession
  error?: string
}> {
  try {
    // Autenticarse con Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (authError) {
      return {
        success: false,
        error: authError.message,
      }
    }

    if (!authData.session) {
      return {
        success: false,
        error: 'No session returned',
      }
    }

    // Obtener perfil del usuario
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError || !profile) {
      return {
        success: false,
        error: 'User profile not found',
      }
    }

    return {
      success: true,
      session: {
        user: profile,
        token: authData.session.access_token,
        expiresAt: authData.session.expires_at || 0,
      },
    }
  } catch (error) {
    console.error('[v0] Sign in error:', error)
    return {
      success: false,
      error: 'Sign in failed',
    }
  }
}

/**
 * Cerrar sesión
 */
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return { success: true }
  } catch (error) {
    console.error('[v0] Sign out error:', error)
    return {
      success: false,
      error: 'Sign out failed',
    }
  }
}

/**
 * Obtener usuario actual
 */
export async function getCurrentUser(): Promise<DBUser | null> {
  try {
    const { data: authSession } = await supabase.auth.getSession()

    if (!authSession.session) {
      return null
    }

    const { data: profile } = await supabase
      .from('users')
      .select('*')
      .eq('id', authSession.session.user.id)
      .single()

    return profile || null
  } catch (error) {
    console.error('[v0] Error getting current user:', error)
    return null
  }
}

/**
 * Obtener usuario por ID
 */
export async function getUserById(id: string): Promise<DBUser | null> {
  try {
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    return user || null
  } catch (error) {
    console.error('[v0] Error fetching user:', error)
    return null
  }
}

/**
 * Actualizar perfil de usuario
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<DBUser>
): Promise<{ success: boolean; error?: string; user?: DBUser }> {
  try {
    const { data: updated, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: true,
      user: updated,
    }
  } catch (error) {
    console.error('[v0] Error updating user profile:', error)
    return {
      success: false,
      error: 'Update failed',
    }
  }
}

/**
 * Cambiar contraseña
 */
export async function changePassword(
  oldPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return { success: true }
  } catch (error) {
    console.error('[v0] Error changing password:', error)
    return {
      success: false,
      error: 'Password change failed',
    }
  }
}

/**
 * Solicitar reset de contraseña
 */
export async function resetPasswordRequest(email: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
    })

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return { success: true }
  } catch (error) {
    console.error('[v0] Error requesting password reset:', error)
    return {
      success: false,
      error: 'Request failed',
    }
  }
}

/**
 * Verificar si usuario es administrador
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const user = await getUserById(userId)
    return user?.user_type === 'admin'
  } catch (error) {
    return false
  }
}

/**
 * Verificar si usuario es profesional
 */
export async function isProfessional(userId: string): Promise<boolean> {
  try {
    const user = await getUserById(userId)
    return user?.user_type === 'professional'
  } catch (error) {
    return false
  }
}

/**
 * Listar usuarios (solo para admin)
 */
export async function listUsers(limit: number = 50): Promise<DBUser[]> {
  try {
    const { data: users } = await supabase
      .from('users')
      .select('*')
      .limit(limit)

    return users || []
  } catch (error) {
    console.error('[v0] Error listing users:', error)
    return []
  }
}

/**
 * Actualizar tipo de usuario (solo admin)
 */
export async function updateUserType(
  userId: string,
  userType: UserType
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ user_type: userType })
      .eq('id', userId)

    if (error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return { success: true }
  } catch (error) {
    console.error('[v0] Error updating user type:', error)
    return {
      success: false,
      error: 'Update failed',
    }
  }
}
