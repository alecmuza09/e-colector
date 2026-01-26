import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function parseHashTokens() {
  const hash = window.location.hash?.startsWith('#') ? window.location.hash.slice(1) : window.location.hash;
  const params = new URLSearchParams(hash || '');
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  const type = params.get('type');
  return { access_token, refresh_token, type };
}

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        // 1) PKCE flow: /auth/callback?code=...
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
          // Limpia query params
          window.history.replaceState({}, document.title, '/auth/callback');
          navigate('/dashboard', { replace: true });
          return;
        }

        // 2) Implicit flow: #access_token=...&refresh_token=...
        const { access_token, refresh_token } = parseHashTokens();
        if (access_token && refresh_token) {
          const { error: setSessionError } = await supabase.auth.setSession({ access_token, refresh_token });
          if (setSessionError) throw setSessionError;
          // Limpia el hash
          window.history.replaceState({}, document.title, '/auth/callback');
          navigate('/dashboard', { replace: true });
          return;
        }

        // Si no hay tokens, mandar a login
        navigate('/login', { replace: true });
      } catch (e: any) {
        console.error('Auth callback error:', e);
        setError(e?.message || 'Error procesando verificación. Intenta de nuevo.');
      }
    };

    run();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow">
        <h1 className="text-xl font-semibold text-gray-900">Verificando tu cuenta...</h1>
        <p className="text-sm text-gray-600 mt-2">
          Estamos procesando la confirmación e iniciando sesión automáticamente.
        </p>
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

