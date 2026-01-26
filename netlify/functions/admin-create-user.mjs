export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Faltan variables de entorno: SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY',
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

  // 4) Crear usuario en Auth (Admin API)
  const createAuthRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password,
      email_confirm: !!email_confirm,
      user_metadata: { full_name },
    }),
  });

  const createAuthJson = await createAuthRes.json().catch(() => ({}));
  if (!createAuthRes.ok) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: createAuthJson?.msg || createAuthJson?.error || 'No se pudo crear usuario en Auth' }),
    };
  }

  const createdAuthUserId = createAuthJson?.id;
  if (!createdAuthUserId) {
    return { statusCode: 500, body: JSON.stringify({ error: 'Respuesta inesperada de Auth Admin API' }) };
  }

  // 5) Crear perfil en public.users
  const insertProfileRes = await fetch(`${SUPABASE_URL}/rest/v1/users`, {
    method: 'POST',
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      auth_user_id: createdAuthUserId,
      role,
      full_name,
      email,
      phone_number: phone_number || null,
      city: city || null,
      is_verified: !!is_verified,
      public_profile: role === 'admin' ? false : true,
      terms_accepted: true,
      profile_data: {},
    }),
  });

  const insertProfileJson = await insertProfileRes.json().catch(() => ({}));
  if (!insertProfileRes.ok) {
    // Si falla el insert, intenta borrar el auth user para no dejar huérfanos
    await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${encodeURIComponent(createdAuthUserId)}`, {
      method: 'DELETE',
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
    }).catch(() => {});

    const msg =
      insertProfileJson?.message ||
      insertProfileJson?.hint ||
      insertProfileJson?.details ||
      insertProfileJson?.error ||
      'No se pudo crear el perfil en public.users';
    return { statusCode: 400, body: JSON.stringify({ error: msg }) };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ ok: true, user: insertProfileJson?.[0] || null }),
  };
}

