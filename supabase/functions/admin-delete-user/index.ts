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

  // 1. Validar token del solicitante (quien llama debe estar autenticado)
  const authHeader = req.headers.get('authorization') || '';
  const requesterToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!requesterToken) return json({ error: 'Missing Authorization bearer token' }, 401);

  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${requesterToken}` },
  });
  if (!userRes.ok) return json({ error: 'Token inválido o expirado' }, 401);
  const requester = await userRes.json();

  // 2. Verificar que el solicitante sea admin
  const profileRes = await fetch(
    `${SUPABASE_URL}/rest/v1/users?select=role&auth_user_id=eq.${encodeURIComponent(requester.id)}&role=eq.admin&limit=1`,
    { headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` } }
  );
  if (!profileRes.ok) return json({ error: 'No se pudo verificar el rol admin' }, 500);
  const profiles = await profileRes.json().catch(() => []);
  if (!Array.isArray(profiles) || profiles.length === 0) {
    return json({ error: 'Solo admins pueden eliminar usuarios' }, 403);
  }

  // 3. Leer body
  let body: { user_id?: string; auth_user_id?: string } = {};
  try { body = await req.json(); } catch { return json({ error: 'JSON inválido' }, 400); }

  const { user_id, auth_user_id } = body;
  if (!user_id || !auth_user_id) {
    return json({ error: 'user_id y auth_user_id son obligatorios' }, 400);
  }

  // 4. Evitar borrar admins
  const targetRes = await fetch(
    `${SUPABASE_URL}/rest/v1/users?select=role&id=eq.${encodeURIComponent(user_id)}&limit=1`,
    { headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` } }
  );
  const targetRows = await targetRes.json().catch(() => []);
  if (targetRows?.[0]?.role === 'admin') {
    return json({ error: 'No se puede eliminar un usuario admin' }, 400);
  }

  // 5. Borrar mensajes del usuario (evitar FK violations)
  await fetch(
    `${SUPABASE_URL}/rest/v1/messages?or=(sender_id.eq.${user_id},receiver_id.eq.${user_id})`,
    {
      method: 'DELETE',
      headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}`, Prefer: 'return=minimal' },
    }
  );

  // 6. Borrar perfil en public.users
  const delProfileRes = await fetch(
    `${SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(user_id)}`,
    {
      method: 'DELETE',
      headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}`, Prefer: 'return=minimal' },
    }
  );
  if (!delProfileRes.ok) {
    const txt = await delProfileRes.text().catch(() => '');
    return json({ error: `No se pudo borrar el perfil: ${txt}` }, 400);
  }

  // 7. Borrar usuario en Supabase Auth
  const delAuthRes = await fetch(
    `${SUPABASE_URL}/auth/v1/admin/users/${encodeURIComponent(auth_user_id)}`,
    {
      method: 'DELETE',
      headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
    }
  );
  if (!delAuthRes.ok) {
    const txt = await delAuthRes.text().catch(() => '');
    console.error('[admin-delete-user] Error borrando auth user:', txt);
    return json({ error: `Perfil borrado, pero falló eliminar de Auth: ${txt}` }, 400);
  }

  console.info('[admin-delete-user] Usuario eliminado correctamente:', user_id, auth_user_id);
  return json({ ok: true });
});
