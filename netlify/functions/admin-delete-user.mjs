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

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Faltan variables de entorno: SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY',
      }),
    };
  }

  const keyRole = getJwtRole(SERVICE_ROLE_KEY);
  if (keyRole !== 'service_role') {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error:
          'SUPABASE_SERVICE_ROLE_KEY no es una service_role key válida (revisa que pegaste la key "service_role" de Supabase Settings > API).',
      }),
    };
  }

  const authHeader = event.headers?.authorization || event.headers?.Authorization;
  const requesterToken = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;
  if (!requesterToken) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Missing Authorization bearer token' }) };
  }

  // 1) Validar token del solicitante
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

  // 2) Verificar rol admin del solicitante
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
    return { statusCode: 403, body: JSON.stringify({ error: 'Solo admins pueden eliminar usuarios' }) };
  }

  // 3) Parse body
  let payload = {};
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'JSON inválido' }) };
  }
  const { user_id, auth_user_id } = payload;
  if (!user_id || !auth_user_id) {
    return { statusCode: 400, body: JSON.stringify({ error: 'user_id y auth_user_id son obligatorios' }) };
  }

  // 4) Evitar borrar admins
  const targetRoleRes = await fetch(
    `${SUPABASE_URL}/rest/v1/users?select=role&id=eq.${encodeURIComponent(user_id)}&limit=1`,
    {
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
    }
  );
  const targetRows = await targetRoleRes.json().catch(() => []);
  if (targetRows?.[0]?.role === 'admin') {
    return { statusCode: 400, body: JSON.stringify({ error: 'No se puede eliminar un usuario admin' }) };
  }

  // 5) Borrar perfil en public.users
  const deleteProfileRes = await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(user_id)}`, {
    method: 'DELETE',
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      Prefer: 'return=minimal',
    },
  });
  if (!deleteProfileRes.ok) {
    const txt = await deleteProfileRes.text().catch(() => '');
    return { statusCode: 400, body: JSON.stringify({ error: `No se pudo borrar perfil: ${txt}` }) };
  }

  // 6) Borrar usuario en Auth
  const deleteAuthRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${encodeURIComponent(auth_user_id)}`, {
    method: 'DELETE',
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
  });

  if (!deleteAuthRes.ok) {
    const txt = await deleteAuthRes.text().catch(() => '');
    // Nota: aquí ya borramos el perfil. Reportamos el error para que el admin lo resuelva.
    return { statusCode: 400, body: JSON.stringify({ error: `Perfil borrado, pero falló borrar Auth user: ${txt}` }) };
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true }) };
}

