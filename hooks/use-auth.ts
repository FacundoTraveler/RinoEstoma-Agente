'use client'

import { useState, useEffect, useCallback, useContext, createContext } from 'react'
import { supabase } from '@/lib/supabase-client'
import { User as DBUser } from '@/lib/types'
import * as authUtils from '@/lib/auth/auth-utils'

interface AuthContextType {
  user: DBUser | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<boolean>
  signUp: (data: authUtils.SignUpData) => Promise<boolean>
  signOut: () => Promise<boolean>
  updateProfile: (updates: Partial<DBUser>) => Promise<boolean>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

/**
 * Hook para gestionar autenticación
 */
export function useAuth(): AuthContextType {
  const [user, setUser] = useState<DBUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Cargar usuario actual al montar
  useEffect(() => {
    const loadUser = async () => {
      setIsLoading(true)
      try {
        const currentUser = await authUtils.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('[v0] Error loading user:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()

    // Suscribirse a cambios de sesión
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
            // Defer ALL auth state changes outside the Supabase auth lock to prevent deadlock
            setTimeout(async () => {
                      if (session) {
                                  const currentUser = await authUtils.getUserById(session.user.id)
                                  setUser(currentUser)
                      } else {
                                  setUser(null)
                      }
            }, 0)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const signIn = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        const result = await authUtils.signIn({ email, password })

        if (result.success && result.session) {
          setUser(result.session.user)
          return true
        }

        console.error('[v0] Sign in failed:', result.error)
        return false
      } catch (error) {
        console.error('[v0] Sign in error:', error)
        return false
      }
    },
    []
  )

  const signUp = useCallback(
    async (data: authUtils.SignUpData): Promise<boolean> => {
      try {
        const result = await authUtils.signUp(data)

        if (result.success && result.user) {
          setUser(result.user)
          return true
        }

        console.error('[v0] Sign up failed:', result.error)
        return false
      } catch (error) {
        console.error('[v0] Sign up error:', error)
        return false
      }
    },
    []
  )

  const signOut = useCallback(async (): Promise<boolean> => {
    try {
      const result = await authUtils.signOut()

      if (result.success) {
        setUser(null)
        return true
      }

      return false
    } catch (error) {
      console.error('[v0] Sign out error:', error)
      return false
    }
  }, [])

  const updateProfile = useCallback(
    async (updates: Partial<DBUser>): Promise<boolean> => {
      if (!user) return false

      try {
        const result = await authUtils.updateUserProfile(user.id, updates)

        if (result.success && result.user) {
          setUser(result.user)
          return true
        }

        return false
      } catch (error) {
        console.error('[v0] Update profile error:', error)
        return false
      }
    },
    [user]
  )

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    updateProfile,
  }
}

/**
 * Hook para usar contexto de autenticación
 */
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}

/**
 * Hook para verificar tipo de usuario
 */
export function useUserType() {
  const { user } = useAuth()

  return {
    isAdmin: user?.user_type === 'admin',
    isProfessional: user?.user_type === 'professional',
    isPatient: user?.user_type === 'patient',
    userType: user?.user_type,
  }
}

/**
 * Hook para requerir autenticación
 */
export function useRequireAuth(): {
  user: DBUser | null
  isLoading: boolean
} {
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !user) {
      // Redirigir a login
      if (typeof window !== 'undefined') {
        window.location.href = '/auth/sign-in'
      }
    }
  }, [user, isLoading])

  return { user, isLoading }
}

/**
 * Hook para requerir rol específico
 */
export function useRequireRole(requiredRole: 'admin' | 'professional') {
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && (!user || user.user_type !== requiredRole)) {
      // Redirigir a home o error
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    }
  }, [user, isLoading, requiredRole])

  return { user, isLoading }
}
