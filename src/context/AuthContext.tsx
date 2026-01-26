import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { UserRole } from '../types/user';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  role: UserRole;
  full_name: string;
  email: string;
  phone_number?: string;
  city?: string;
  profile_picture_url?: string;
  is_verified: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: UserRole | null;
  userName: string | null;
  user: SupabaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Procesa links de Supabase tipo "#access_token=...&refresh_token=..."
  const hydrateSessionFromUrl = async () => {
    if (typeof window === 'undefined') return;
    const hash = window.location.hash?.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
    if (!hash) return;

    const params = new URLSearchParams(hash);
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');

    if (access_token && refresh_token) {
      const { error } = await supabase.auth.setSession({ access_token, refresh_token });
      if (error) {
        console.error('Error setting session from URL hash:', error);
      }
      // Limpia el hash para no re-procesarlo
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
    }
  };

  // Cargar sesión al iniciar
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        await hydrateSessionFromUrl();

        // Verificar sesión existente
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        setIsAuthenticated(!!session?.user);
        if (session?.user) {
          await loadUserProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (e) {
        console.error('Auth init error:', e);
        setLoading(false);
      }
    };

    init();

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsAuthenticated(!!session?.user);
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setUserProfile(null);
        setUserRole(null);
        setUserName(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Cargar perfil de usuario desde la tabla users
  const loadUserProfile = async (authUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUserId)
        .single();

      if (error) throw error;

      if (data) {
        setUserProfile(data as UserProfile);
        setUserRole(data.role as UserRole);
        setUserName(data.full_name);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // Iniciar sesión
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        await loadUserProfile(data.user.id);
      }

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  // Registro
  const signUp = async (email: string, password: string, userData: any) => {
    try {
      // Crear usuario en auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Importante: que el email apunte al dominio actual (Netlify o local)
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        return { error: authError };
      }

      if (authData.user) {
        // Crear perfil en la tabla users
        const { error: profileError } = await supabase.from('users').insert({
          auth_user_id: authData.user.id,
          role: userData.role,
          full_name: userData.name,
          email: email,
          phone_number: userData.phone,
          city: userData.city,
          terms_accepted: userData.termsAccepted,
          profile_data: userData.additionalData || {},
        });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          return { error: profileError };
        }

        await loadUserProfile(authData.user.id);
      }

      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  // Cerrar sesión
  const logout = async () => {
    await supabase.auth.signOut();
    setUserProfile(null);
    setUserRole(null);
    setUserName(null);
  };

  // Refrescar perfil
  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id);
    }
  };

  const value = {
    isAuthenticated,
    userRole,
    userName,
    user,
    userProfile,
    loading,
    login,
    signUp,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 