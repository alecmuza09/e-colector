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
  public_profile?: boolean;
  terms_accepted?: boolean;
  profile_data?: any;
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

  const PENDING_PROFILE_KEY = 'ecolector_pending_profile_v1';

  const getPublicSiteUrl = () => {
    // Para forzar que los links de confirmación SIEMPRE apunten a Netlify (no localhost),
    // configura VITE_PUBLIC_SITE_URL en el entorno de Netlify.
    const raw =
      (import.meta as any).env?.VITE_PUBLIC_SITE_URL ||
      (import.meta as any).env?.VITE_SITE_URL ||
      '';
    const envUrl = String(raw || '').trim().replace(/\/+$/, '');
    if (envUrl) return envUrl;
    // Fallback: usa el origen actual
    return typeof window !== 'undefined' ? window.location.origin : '';
  };

  const savePendingProfile = (payload: any) => {
    try {
      localStorage.setItem(PENDING_PROFILE_KEY, JSON.stringify(payload));
    } catch {
      // ignore
    }
  };

  const loadPendingProfile = (): any | null => {
    try {
      const raw = localStorage.getItem(PENDING_PROFILE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const clearPendingProfile = () => {
    try {
      localStorage.removeItem(PENDING_PROFILE_KEY);
    } catch {
      // ignore
    }
  };

  const ensureProfileFromPending = async (authUserId: string, email?: string | null) => {
    try {
      const { data: existing, error: existingErr } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', authUserId)
        .maybeSingle();

      if (existingErr && existingErr.code !== 'PGRST116') {
        // PGRST116 = no rows (maybeSingle)
        throw existingErr;
      }
      if (existing?.id) return;

      const pending = loadPendingProfile();
      if (!pending) return;
      if (pending?.email && email && String(pending.email).toLowerCase() !== String(email).toLowerCase()) {
        // No usar un pending de otro correo
        return;
      }

      const { error: profileError } = await supabase.from('users').insert({
        auth_user_id: authUserId,
        role: pending.role,
        full_name: pending.name,
        email: pending.email,
        phone_number: pending.phone,
        city: pending.city,
        terms_accepted: pending.termsAccepted,
        profile_data: pending.additionalData || {},
      });

      if (profileError) throw profileError;
      clearPendingProfile();
    } catch (e) {
      console.error('Error ensuring profile from pending:', e);
    }
  };

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
          await ensureProfileFromPending(session.user.id, session.user.email);
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
        ensureProfileFromPending(session.user.id, session.user.email).finally(() => {
          loadUserProfile(session.user.id);
        });
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
      // Guardar pending profile: si el signup requiere confirmación por email,
      // lo usaremos al regresar en /auth/callback para crear el perfil.
      savePendingProfile({
        name: userData?.name,
        email,
        role: userData?.role,
        phone: userData?.phone,
        city: userData?.city,
        termsAccepted: userData?.termsAccepted,
        additionalData: userData?.additionalData || {},
      });

      // Crear usuario en auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Importante: que el email apunte al dominio público (Netlify) y NO a localhost
          emailRedirectTo: `${getPublicSiteUrl()}/auth/callback`,
        },
      });

      if (authError) {
        return { error: authError };
      }

      // Objetivo: que el registro funcione SIN verificación por correo, iniciando sesión automáticamente.
      // Si Supabase está configurado sin confirmación, authData.session viene listo.
      // Si NO viene sesión, intentamos login inmediatamente con correo/contraseña.
      const sessionUser = authData.session?.user;
      if (sessionUser) {
        await ensureProfileFromPending(sessionUser.id, sessionUser.email);
        await loadUserProfile(sessionUser.id);
        return { error: null };
      }

      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        // Si el proyecto todavía exige confirmación de email, aquí fallará.
        return {
          error: {
            message:
              signInError.message ||
              'No se pudo iniciar sesión automáticamente tras el registro. Revisa la configuración de confirmación de email en Supabase Auth.',
          },
        };
      }

      if (signInData.user) {
        await ensureProfileFromPending(signInData.user.id, signInData.user.email);
        await loadUserProfile(signInData.user.id);
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