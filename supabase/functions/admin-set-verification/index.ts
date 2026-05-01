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
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const authHeader = req.headers.get('authorization') || '';
  const requesterToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!requesterToken) return json({ error: 'Missing Authorization bearer token' }, 401);

  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${requesterToken}` },
  });
  if (!userRes.ok) return json({ error: 'Token inválido o expirado' }, 401);
  const requester = await userRes.json();

  const profileRes = await fetch(
    `${SUPABASE_URL}/rest/v1/users?select=role&auth_user_id=eq.${encodeURIComponent(requester.id)}&role=eq.admin&limit=1`,
    { headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` } }
  );
  const profiles = await profileRes.json().catch(() => []);
  if (!Array.isArray(profiles) || profiles.length === 0) {
    return json({ error: 'Solo los administradores pueden cambiar la verificación' }, 403);
  }

  let body: { user_id?: string; is_verified?: boolean };
  try {
    body = await req.json();
  } catch {
    return json({ error: 'JSON inválido' }, 400);
  }

  const { user_id, is_verified } = body;
  if (!user_id || typeof is_verified !== 'boolean') {
    return json({ error: 'user_id e is_verified (boolean) son obligatorios' }, 400);
  }

  const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(user_id)}`, {
    method: 'PATCH',
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ is_verified }),
  });

  if (!patchRes.ok) {
    const txt = await patchRes.text().catch(() => '');
    return json({ error: txt || 'No se pudo actualizar la verificación' }, 400);
  }

  console.info('[admin-set-verification] user:', user_id, '→', is_verified);
  return json({ ok: true });
});
