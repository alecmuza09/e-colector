import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });

  // 1. Validar token del solicitante
  const authHeader = req.headers.get('authorization') || '';
  const requesterToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!requesterToken) return json({ error: 'Missing Authorization bearer token' }, 401);

  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${requesterToken}` },
  });
  if (!userRes.ok) return json({ error: 'Token inválido o expirado' }, 401);
  const requester = await userRes.json();

  // 2. Verificar que sea admin (usando service role para evitar RLS)
  const profileRes = await fetch(
    `${SUPABASE_URL}/rest/v1/users?select=role&auth_user_id=eq.${encodeURIComponent(requester.id)}&role=eq.admin&limit=1`,
    { headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` } }
  );
  if (!profileRes.ok) return json({ error: 'No se pudo verificar el rol admin' }, 500);
  const profiles = await profileRes.json().catch(() => []);
  if (!Array.isArray(profiles) || profiles.length === 0) {
    return json({ error: 'Acceso denegado: solo admins' }, 403);
  }

  // 3. Obtener TODOS los usuarios (service role bypasea RLS)
  const usersRes = await fetch(
    `${SUPABASE_URL}/rest/v1/users?select=*&order=created_at.desc`,
    { headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` } }
  );
  if (!usersRes.ok) {
    const txt = await usersRes.text().catch(() => '');
    return json({ error: `No se pudieron obtener los usuarios: ${txt}` }, 500);
  }

  const users = await usersRes.json();
  return json({ ok: true, users: users || [] });
});
