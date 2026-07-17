// src/contexts/RDMAuthContext.tsx
// Contexto de autenticación endurecido para RDM Digital Hub (Vite + Supabase + Lovable, despliegue en Vercel).

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
const AUTH_QUERY_TIMEOUT_MS = 5_000

function withTimeout<T>(promise: Promise<T>, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      window.setTimeout(
        () => reject(new Error(`${label} excedió ${AUTH_QUERY_TIMEOUT_MS}ms`)),
        AUTH_QUERY_TIMEOUT_MS,
      )
    }),
  ])
}

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
      try {
        const [
          { data: profileData, error: profileError },
          { data: rolesData, error: rolesError },
        ] = await Promise.all([
          withTimeout(
            Promise.resolve(supabase.from('profiles').select('*').eq('id', uid).maybeSingle()),
            'profiles',
          ),
          withTimeout(
            Promise.resolve(supabase.from('user_roles').select('role').eq('user_id', uid)),
            'user_roles',
          ),
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
        const message = e instanceof Error ? e.message : 'Error desconocido al cargar perfil/roles'
        setError(`[auth] Excepción en loadProfileAndRoles: ${message}`)
        setProfile(null)
        setRoles([])
      }
    },
    [],
  )

  useEffect(() => {
    let isMounted = true

    setIsSupabaseReady(true)

    // 1. Listener de cambios de auth (sign‑in, sign‑out, refresh).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evt, s) => {
      if (!isMounted) return

      setSession(s)
      setUser(s?.user ?? null)

      const uid = s?.user?.id
      if (uid) {
        setTimeout(() => {
          void loadProfileAndRoles(uid)
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
        } = await withTimeout(supabase.auth.getSession(), 'auth.getSession')

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
        const message = e instanceof Error ? e.message : 'Error desconocido al inicializar sesión'
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
      const message = e instanceof Error ? e.message : 'Error desconocido al iniciar sesión'
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
    setLoading(true)
    setError(null)
    try {
      const isDev = import.meta.env.DEV

      // En desarrollo: si no hay redirect URL configurada, no esperar confirmación de email
      // para desarrollo más fluido (email confirmations disabled en Supabase dashboard)
      const redirectUrl = isDev
        ? undefined
        : (import.meta.env.VITE_NEXT_PUBLIC_SUPABASE_REDIRECT_URL ??
          (typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined))

      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          ...(redirectUrl && { emailRedirectTo: redirectUrl }),
          data: { display_name: displayName },
        },
      })

      if (error) {
        const msg = `[auth] Error al registrarse: ${error.message}`
        setError(msg)
        return { error: msg }
      }

      // En dev: si no hay redirect URL y el usuario se creó, intentar auto sign-in
      // (funciona si email confirmations están deshabilitadas en Supabase dashboard)
      if (isDev && data.user && !data.session && !redirectUrl) {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (!signInError) {
          return { error: null }
        }
        // Si falla el auto sign-in, es porque requiere confirmación de email
      }

      return { error: null }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Error desconocido al registrarse'
      const msg = `[auth] Excepción en signUpEmail: ${message}`
      setError(msg)
      return { error: msg }
    } finally {
      setLoading(false)
    }
  }

  const signInGoogle = async () => {
    setError(null)

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
      const message = e instanceof Error ? e.message : 'Error desconocido en signInGoogle'
      const msg = `[auth] Excepción en signInGoogle: ${message}`
      setError(msg)
      return { error: msg }
    }
  }

  const signOut = async () => {
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
      const message = e instanceof Error ? e.message : 'Error desconocido al cerrar sesión'
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
