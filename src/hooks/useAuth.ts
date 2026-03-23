/**
 * Hook de Autenticación TAMV
 * Triple Federado: Conceptual | Legal | Técnico
 */

import { useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  is_creator: boolean;
  is_verified: boolean;
  tau_balance: number;
  xp_points: number;
  level: number;
  federation_hash: string | null;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Cargar perfil del usuario
  const loadProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error loading profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in loadProfile:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    // Configurar listener de estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Cargar perfil de forma diferida
          setTimeout(async () => {
            const profileData = await loadProfile(session.user.id);
            setProfile(profileData);
          }, 0);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        loadProfile(session.user.id).then(setProfile);
      }

      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [loadProfile]);

  // Registro
  const signUp = useCallback(async (
    email: string,
    password: string,
    username: string
  ) => {
    try {
      setLoading(true);

      // Verificar si el username ya existe
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (existingUser) {
        toast.error('Este nombre de usuario ya está en uso');
        return { error: { message: 'Username already taken' } };
      }

      const redirectUrl = `${window.location.origin}/`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username
          }
        }
      });

      if (error) {
        toast.error(error.message);
        return { error };
      }

      if (data.user) {
        // Crear perfil
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            username,
            display_name: username
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
        }

        // Asignar rol de usuario
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: data.user.id,
            role: 'user'
          });

        if (roleError) {
          console.error('Error assigning role:', roleError);
        }

        toast.success('¡Bienvenido al Metaverso TAMV!');
      }

      return { data };
    } catch (error) {
      console.error('SignUp error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  }, []);

  // Inicio de sesión
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast.error(error.message);
        return { error };
      }

      toast.success('¡Bienvenido de vuelta!');
      navigate('/');
      return { data };
    } catch (error) {
      console.error('SignIn error:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Cerrar sesión
  const signOut = useCallback(async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      toast.success('Sesión cerrada correctamente');
      navigate('/login');
    } catch (error) {
      console.error('SignOut error:', error);
      toast.error('Error al cerrar sesión');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Actualizar perfil
  const updateProfile = useCallback(async (updates: Partial<Profile>) => {
    if (!user) return { error: { message: 'No authenticated user' } };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        toast.error('Error al actualizar perfil');
        return { error };
      }

      setProfile(data);
      toast.success('Perfil actualizado');
      return { data };
    } catch (error) {
      console.error('UpdateProfile error:', error);
      return { error };
    }
  }, [user]);

  return {
    user,
    session,
    profile,
    loading,
    isAuthenticated: !!session,
    signUp,
    signIn,
    signOut,
    updateProfile
  };
};
