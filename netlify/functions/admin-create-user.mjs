export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  const getJwtRole = (jwt) => {
    try {
      const parts = String(jwt || '').split('.');
      if (parts.length < 2) return null;
      const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
      const json = Buffer.from(padded, 'base64').toString('utf8');
      const payload = JSON.parse(json);
      return payload?.role || null;
    } catch {
      return null;
    }
  };

  const isValidServerKey = (key) => {
    const k = String(key || '');
    // Nuevo formato Supabase API Keys (server): sb_secret_...
    if (k.startsWith('sb_secret_')) return true;
    // Evitar usar publishable/anon key en server
    if (k.startsWith('sb_publishable_')) return false;
    // Legacy JWT keys: service_role
    return getJwtRole(k) === 'service_role';
  };

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Faltan variables de entorno: SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY',
      }),
    };
  }

  // Validación dura: la key debe ser service_role (si no, RLS bloqueará y parecerá "no eres admin")
  if (!isValidServerKey(SERVICE_ROLE_KEY)) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error:
          'SUPABASE_SERVICE_ROLE_KEY no es válida. Usa la key "service_role" (legacy JWT) o la key "sb_secret_" (secret key) desde Supabase Settings > API.',
      }),
    };
  }

  const authHeader = event.headers?.authorization || event.headers?.Authorization;
  const requesterToken = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;
  if (!requesterToken) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Missing Authorization bearer token' }) };
  }

  // 1) Validar token del solicitante (usuario logueado)
  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${requesterToken}`,
    },
  });
  if (!userRes.ok) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Token inválido o expirado' }) };
  }
  const requester = await userRes.json();

  // 2) Verificar que el solicitante sea admin en public.users
  const profileRes = await fetch(
    `${SUPABASE_URL}/rest/v1/users?select=role&auth_user_id=eq.${encodeURIComponent(requester.id)}&role=eq.admin&limit=1`,
    {
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
    }
  );
  if (!profileRes.ok) {
    const txt = await profileRes.text().catch(() => '');
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: `No se pudo verificar rol admin (users): ${profileRes.status} ${txt}`,
      }),
    };
  }
  const requesterProfiles = await profileRes.json().catch(() => []);
  const isAdmin = Array.isArray(requesterProfiles) && requesterProfiles.length > 0;
  if (!isAdmin) {
    return { statusCode: 403, body: JSON.stringify({ error: 'Solo admins pueden crear usuarios' }) };
  }

  // 3) Parse body
  let payload = {};
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'JSON inválido' }) };
  }

  const {
    full_name,
    email,
    password,
    role = 'buyer',
    phone_number = null,
    city = null,
    is_verified = false,
    email_confirm = true,
  } = payload;

  if (!full_name || !email || !password) {
    return { statusCode: 400, body: JSON.stringify({ error: 'full_name, email y password son obligatorios' }) };
  }
  if (typeof password !== 'string' || password.length < 8) {
    return { statusCode: 400, body: JSON.stringify({ error: 'password debe tener al menos 8 caracteres' }) };
  }
  if (!['buyer', 'seller', 'collector', 'admin'].includes(role)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Rol inválido' }) };
  }

  const normalizeEmail = (v) => String(v || '').trim().toLowerCase();
  const targetEmail = normalizeEmail(email);

  const getAuthAdminUserIdByEmail = async (emailToFind) => {
    // Intento 1: endpoint con filtro por email (si está soportado)
    const try1 = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(emailToFind)}`, {
      headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
    }).catch(() => null);
    if (try1 && try1.ok) {
      const j = await try1.json().catch(() => null);
      const id = j?.users?.[0]?.id || j?.[0]?.id || j?.id;
      if (id) return id;
    }

    // Intento 2: listar primera página y buscar (suficiente para la mayoría de proyectos pequeños)
    const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=200`, {
      headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
    });
    if (!listRes.ok) return null;
    const listJson = await listRes.json().catch(() => null);
    const users = listJson?.users || listJson || [];
    const found = Array.isArray(users) ? users.find((u) => normalizeEmail(u?.email) === emailToFind) : null;
    return found?.id || null;
  };

  const upsertProfile = async (authUserId) => {
    // Si ya hay un perfil con ese email pero apunta a otro auth_user_id, lo reportamos para que no rompa constraints
    const existingByEmailRes = await fetch(
      `${SUPABASE_URL}/rest/v1/users?select=id,auth_user_id,role,email&email=eq.${encodeURIComponent(targetEmail)}&limit=1`,
      { headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` } }
    );
    if (existingByEmailRes.ok) {
      const existingRows = await existingByEmailRes.json().catch(() => []);
      const existing = existingRows?.[0];
      if (existing?.auth_user_id && existing.auth_user_id !== authUserId) {
        return {
          ok: false,
          error: `Ya existe un perfil en public.users con email=${targetEmail} pero ligado a otro auth_user_id. Revisa duplicados en public.users.`,
        };
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
        public_profile: role === 'admin' ? false : true,
        terms_accepted: true,
        profile_data: {},
      }),
    });
    const upsertJson = await upsertRes.json().catch(() => ({}));
    if (!upsertRes.ok) {
      const msg =
        upsertJson?.message ||
        upsertJson?.hint ||
        upsertJson?.details ||
        upsertJson?.error ||
        'No se pudo crear/actualizar el perfil en public.users';
      return { ok: false, error: msg };
    }
    return { ok: true, user: upsertJson?.[0] || null };
  };

  // 4) Crear usuario en Auth (Admin API)
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
    const errMsg = createAuthJson?.msg || createAuthJson?.error || 'No se pudo crear usuario en Auth';
    // Si el usuario ya existe en Auth, intentamos crear/actualizar su perfil en public.users (para que aparezca en la lista)
    const looksLikeAlreadyRegistered = /already.*registered|already.*exists|already.*in use/i.test(String(errMsg));
    if (looksLikeAlreadyRegistered) {
      const existingAuthId = await getAuthAdminUserIdByEmail(targetEmail);
      if (!existingAuthId) {
        return {
          statusCode: 409,
          body: JSON.stringify({
            error:
              'El usuario ya existe en Auth, pero no pude obtener su id para crear el perfil. Revisa Authentication > Users y vuelve a intentar.',
          }),
        };
      }

      const up = await upsertProfile(existingAuthId);
      if (!up.ok) {
        return { statusCode: 400, body: JSON.stringify({ error: up.error }) };
      }
      return { statusCode: 200, body: JSON.stringify({ ok: true, user: up.user, note: 'Auth ya existía; se creó/actualizó perfil.' }) };
    }

    return { statusCode: 400, body: JSON.stringify({ error: errMsg }) };
  }

  const createdAuthUserId = createAuthJson?.id;
  if (!createdAuthUserId) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Respuesta inesperada de Auth Admin API' }) };
  }

  // 5) Crear/actualizar perfil en public.users (upsert)
  const up = await upsertProfile(createdAuthUserId);
  if (!up.ok) {
    // Si falla el perfil, intenta borrar el auth user para no dejar huérfanos
    await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${encodeURIComponent(createdAuthUserId)}`, {
      method: 'DELETE',
      headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` },
    }).catch(() => {});
    return { statusCode: 400, body: JSON.stringify({ error: up.error }) };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true, user: up.user || null }),
  };
}

