// src/contexts/RDMAuthContext.tsx
// Contexto de autenticación endurecido para RDM Digital Hub (Vite + Supabase + Lovable, despliegue en Cloudflare).

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'

export interface Profile {
  id: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  location: string | null
  total_points: number
  level: number
}

export type AppRole = 'admin' | 'moderator' | 'merchant' | 'tourist'

interface RDMAuthContextValue {
  user: User | null
  session: Session | null
  profile: Profile | null
  roles: AppRole[]
  loading: boolean
  isSupabaseReady: boolean
  error: string | null
  signInEmail: (email: string, password: string) => Promise<{ error: string | null }>
  signUpEmail: (
    email: string,
    password: string,
    displayName: string,
  ) => Promise<{ error: string | null }>
  signInGoogle: () => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
  hasRole: (role: AppRole) => boolean
}

const RDMAuthContext = createContext<RDMAuthContextValue | undefined>(undefined)

export function RDMAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [roles, setRoles] = useState<AppRole[]>([])
  const [loading, setLoading] = useState(true)
  const [isSupabaseReady, setIsSupabaseReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadProfileAndRoles = useCallback(
    async (uid: string) => {
      if (!supabase) {
        setError(
          '[auth] Supabase no está disponible; no se pueden cargar perfiles ni roles en este entorno.',
        )
        setProfile(null)
        setRoles([])
        return
      }

      try {
        const [
          { data: profileData, error: profileError },
          { data: rolesData, error: rolesError },
        ] = await Promise.all([
          supabase.from('profiles').select('*').eq('id', uid).maybeSingle(),
          supabase.from('user_roles').select('role').eq('user_id', uid),
        ])

        if (profileError || rolesError) {
          const messages = [
            profileError?.message,
            rolesError?.message,
          ].filter(Boolean) as string[]
          if (messages.length > 0) {
            setError(
              `[auth] Error al cargar perfil/roles: ${messages.join(' | ')}`,
            )
          }
        } else {
          setError(null)
        }

        setProfile(profileData ?? null)
        setRoles(((rolesData ?? []) as { role: AppRole }[]).map((x) => x.role))
      } catch (e) {
        const message =
          e instanceof Error ? e.message : 'Error desconocido al cargar perfil/roles'
        setError(`[auth] Excepción en loadProfileAndRoles: ${message}`)
        setProfile(null)
        setRoles([])
      }
    },
    [],
  )

  useEffect(() => {
    let isMounted = true

    // Protección inicial: si el cliente Supabase no se pudo inicializar (Cloudflare sin envs, etc.),
    // no colapsamos toda la app; deshabilitamos auth y exponemos estado explícito.
    if (!supabase) {
      if (isMounted) {
        setIsSupabaseReady(false)
        setLoading(false)
        setSession(null)
        setUser(null)
        setProfile(null)
        setRoles([])
        setError(
          '[auth] Supabase no está inicializado. La autenticación está deshabilitada, ' +
            'pero el resto de la aplicación puede seguir funcionando.',
        )
      }
      return () => {
        isMounted = false
      }
    }

    setIsSupabaseReady(true)

    // 1. Listener de cambios de auth (sign‑in, sign‑out, refresh).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evt, s) => {
      if (!isMounted) return

      setSession(s)
      setUser(s?.user ?? null)

      if (s?.user) {
        // Defer DB calls para no bloquear el hilo principal.
        setTimeout(() => {
          void loadProfileAndRoles(s.user!.id)
        }, 0)
      } else {
        setProfile(null)
        setRoles([])
      }
    })

    // 2. Sesión ya existente
    const init = async () => {
      try {
        const {
          data: { session: currentSession },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (!isMounted) return

        if (sessionError) {
          setError(
            `[auth] Error al recuperar sesión inicial: ${sessionError.message}`,
          )
          setSession(null)
          setUser(null)
        } else {
          setSession(currentSession)
          setUser(currentSession?.user ?? null)
          setError(null)
        }

        if (currentSession?.user) {
          await loadProfileAndRoles(currentSession.user.id)
        }
      } catch (e) {
        if (!isMounted) return
        const message =
          e instanceof Error ? e.message : 'Error desconocido al inicializar sesión'
        setError(`[auth] Excepción en init de sesión: ${message}`)
        setSession(null)
        setUser(null)
        setProfile(null)
        setRoles([])
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    void init()

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [loadProfileAndRoles])

  const signInEmail = async (email: string, password: string) => {
    if (!supabase) {
      const msg =
        '[auth] Supabase no está disponible; no es posible iniciar sesión con email/password en este entorno.'
      setError(msg)
      return { error: msg }
    }

    setLoading(true)
    setError(null)
    try {
      const {
        data: { session: newSession },
        error,
      } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        const msg = `[auth] Error al iniciar sesión: ${error.message}`
        setError(msg)
        setUser(null)
        setSession(null)
        return { error: msg }
      }

      setSession(newSession ?? null)
      setUser(newSession?.user ?? null)
      if (newSession?.user) {
        await loadProfileAndRoles(newSession.user.id)
      }
      return { error: null }
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Error desconocido al iniciar sesión'
      const msg = `[auth] Excepción en signInEmail: ${message}`
      setError(msg)
      setUser(null)
      setSession(null)
      return { error: msg }
    } finally {
      setLoading(false)
    }
  }

  const signUpEmail = async (
    email: string,
    password: string,
    displayName: string,
  ) => {
    if (!supabase) {
      const msg =
        '[auth] Supabase no está disponible; no es posible registrarse con email/password en este entorno.'
      setError(msg)
      return { error: msg }
    }

    setLoading(true)
    setError(null)
    try {
      const redirectUrl =
        import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_REDIRECT_URL ??
        (typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined)

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { display_name: displayName },
        },
      })

      if (error) {
        const msg = `[auth] Error al registrarse: ${error.message}`
        setError(msg)
        return { error: msg }
      }

      return { error: null }
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Error desconocido al registrarse'
      const msg = `[auth] Excepción en signUpEmail: ${message}`
      setError(msg)
      return { error: msg }
    } finally {
      setLoading(false)
    }
  }

  const signInGoogle = async () => {
    setError(null)

    if (!supabase) {
      const msg = '[auth] Supabase no disponible; Google OAuth deshabilitado.'
      setError(msg)
      return { error: msg }
    }

    try {
      const redirectTo =
        import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_REDIRECT_URL ??
        (typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo },
      })

      if (error) {
        const msg = `[auth] Error en Google OAuth: ${error.message}`
        setError(msg)
        return { error: msg }
      }

      return { error: null }
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Error desconocido en signInGoogle'
      const msg = `[auth] Excepción en signInGoogle: ${message}`
      setError(msg)
      return { error: msg }
    }
  }

  const signOut = async () => {
    if (!supabase) {
      setError(
        '[auth] Supabase no está disponible; signOut no es posible en este entorno.',
      )
      return
    }

    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        setError(`[auth] Error al cerrar sesión: ${error.message}`)
        return
      }
      setSession(null)
      setUser(null)
      setProfile(null)
      setRoles([])
    } catch (e) {
      const message =
        e instanceof Error ? e.message : 'Error desconocido al cerrar sesión'
      setError(`[auth] Excepción en signOut: ${message}`)
    } finally {
      setLoading(false)
    }
  }

  const refreshProfile = async () => {
    if (!user) return
    await loadProfileAndRoles(user.id)
  }

  const hasRole = (role: AppRole) => roles.includes(role)

  const value: RDMAuthContextValue = {
    user,
    session,
    profile,
    roles,
    loading,
    isSupabaseReady,
    error,
    signInEmail,
    signUpEmail,
    signInGoogle,
    signOut,
    refreshProfile,
    hasRole,
  }

  return (
    <RDMAuthContext.Provider value={value}>
      {children}
    </RDMAuthContext.Provider>
  )
}

export function useRDMAuth(): RDMAuthContextValue {
  const ctx = useContext(RDMAuthContext)
  if (!ctx) {
    throw new Error('useRDMAuth must be used within RDMAuthProvider')
  }
  return ctx
}
