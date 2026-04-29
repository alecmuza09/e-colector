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

const normalize = (v: string) => String(v || '').trim().toLowerCase();

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS_HEADERS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  // 1. Validar token del solicitante
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
    return json({ error: 'Solo admins pueden crear usuarios' }, 403);
  }

  // 3. Leer y validar body
  let body: any = {};
  try { body = await req.json(); } catch { return json({ error: 'JSON inválido' }, 400); }

  const {
    full_name,
    email,
    password,
    role = 'buyer',
    phone_number = null,
    city = null,
    is_verified = false,
    email_confirm = true,
  } = body;

  if (!full_name || !email || !password) {
    return json({ error: 'full_name, email y password son obligatorios' }, 400);
  }
  if (typeof password !== 'string' || password.length < 8) {
    return json({ error: 'La contraseña debe tener al menos 8 caracteres' }, 400);
  }
  if (!['buyer', 'seller', 'collector', 'admin'].includes(role)) {
    return json({ error: 'Rol inválido' }, 400);
  }

  const targetEmail = normalize(email);

  // Helper: buscar auth_user_id por email si el usuario ya existe
  const getAuthIdByEmail = async (emailToFind: string): Promise<string | null> => {
    const r1 = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(emailToFind)}`,
      { headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` } }
    ).catch(() => null);
    if (r1 && r1.ok) {
      const j = await r1.json().catch(() => null);
      const id = j?.users?.[0]?.id || j?.[0]?.id || j?.id;
      if (id) return id;
    }
    // Fallback: listar página y buscar
    const r2 = await fetch(
      `${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=200`,
      { headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` } }
    );
    if (!r2.ok) return null;
    const list = await r2.json().catch(() => null);
    const users = list?.users || list || [];
    const found = Array.isArray(users) ? users.find((u: any) => normalize(u?.email) === emailToFind) : null;
    return found?.id || null;
  };

  // Helper: upsert perfil en public.users
  const upsertProfile = async (authUserId: string): Promise<{ ok: boolean; user?: any; error?: string }> => {
    // Verificar que no haya perfil con mismo email pero distinto auth_user_id
    const existing = await fetch(
      `${SUPABASE_URL}/rest/v1/users?select=id,auth_user_id&email=eq.${encodeURIComponent(targetEmail)}&limit=1`,
      { headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` } }
    );
    if (existing.ok) {
      const rows = await existing.json().catch(() => []);
      const row = rows?.[0];
      if (row?.auth_user_id && row.auth_user_id !== authUserId) {
        return { ok: false, error: `Ya existe un perfil con email ${targetEmail} ligado a otro usuario.` };
      }
    }

    const upsertRes = await fetch(`${SUPABASE_URL}/rest/v1/users?on_conflict=auth_user_id`, {
      method: 'POST',
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=representation',
      },
      body: JSON.stringify({
        auth_user_id: authUserId,
        role,
        full_name,
        email: targetEmail,
        phone_number: phone_number || null,
        city: city || null,
        is_verified: !!is_verified,
        public_profile: role !== 'admin',
        terms_accepted: true,
        profile_data: {},
      }),
    });

    const upsertJson = await upsertRes.json().catch(() => ({}));
    if (!upsertRes.ok) {
      const msg = upsertJson?.message || upsertJson?.hint || upsertJson?.details || 'No se pudo crear el perfil';
      return { ok: false, error: msg };
    }
    return { ok: true, user: Array.isArray(upsertJson) ? upsertJson[0] : upsertJson };
  };

  // 4. Crear usuario en Supabase Auth (Admin API)
  const createAuthRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: targetEmail,
      password,
      email_confirm: !!email_confirm,
      user_metadata: { full_name },
    }),
  });

  const createAuthJson = await createAuthRes.json().catch(() => ({}));

  if (!createAuthRes.ok) {
    const errMsg = createAuthJson?.msg || createAuthJson?.error || 'No se pudo crear el usuario en Auth';
    // Si ya existe, intentar crear/actualizar el perfil
    const alreadyExists = /already.*registered|already.*exists|already.*in use/i.test(String(errMsg));
    if (alreadyExists) {
      const existingId = await getAuthIdByEmail(targetEmail);
      if (!existingId) {
        return json({ error: 'El usuario ya existe en Auth, pero no se pudo obtener su ID.' }, 409);
      }
      const up = await upsertProfile(existingId);
      if (!up.ok) return json({ error: up.error }, 400);
      return json({ ok: true, user: up.user, note: 'Auth ya existía; se creó/actualizó el perfil.' });
    }
    return json({ error: errMsg }, 400);
  }

  const createdAuthId = createAuthJson?.id;
  if (!createdAuthId) return json({ error: 'Respuesta inesperada de Auth Admin API' }, 500);

  // 5. Crear perfil en public.users
  const up = await upsertProfile(createdAuthId);
  if (!up.ok) {
    // Limpiar usuario huérfano en Auth
    await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${encodeURIComponent(createdAuthId)}`, {
      method: 'DELETE',
      headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
    }).catch(() => {});
    return json({ error: up.error }, 400);
  }

  console.info('[admin-create-user] Usuario creado:', targetEmail, '| rol:', role);
  return json({ ok: true, user: up.user });
});
