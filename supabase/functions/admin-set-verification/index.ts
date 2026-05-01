import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

/** Mismo remitente que send-notification-email (Resend). */
const FROM_EMAIL = 'E-Colector <notificaciones@app.e-colector.com>';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });

function escapeHtml(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildAccountVerifiedHtml(fullName: string, appUrl: string): string {
  const name = escapeHtml(fullName || 'Usuario');
  const base = appUrl.replace(/\/$/, '');
  const dashboardHref = `${base}/dashboard`;
  const loginHref = `${base}/login`;

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#059669;padding:24px 32px;text-align:center;">
        <h1 style="color:white;margin:0;font-size:22px;font-weight:700;">♻️ e-colector</h1>
        <p style="color:#a7f3d0;margin:4px 0 0;font-size:14px;">Cuenta verificada</p>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#111827;margin-top:0;font-size:18px;">¡Tu cuenta ha sido verificada, ${name}!</h2>
        <p style="color:#6b7280;font-size:15px;line-height:1.6;">
          El equipo de e-colector confirmó tu perfil. Ya puedes usar la plataforma con todas las funciones disponibles para tu tipo de cuenta (publicar, ofertar, mensajes, etc., según aplique).
        </p>
        <div style="text-align:center;margin:28px 0;">
          <a href="${dashboardHref}"
             style="display:inline-block;background:#059669;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
            Ir a mi panel →
          </a>
        </div>
        <p style="color:#9ca3af;font-size:13px;line-height:1.6;text-align:center;margin:0;">
          Si no has iniciado sesión recientemente:<br>
          <a href="${loginHref}" style="color:#059669;">${escapeHtml(loginHref)}</a>
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0;">
        <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">
          Recibiste este correo porque tu cuenta fue verificada por un administrador en app.e-colector.com.
        </p>
      </div>
    </div>`;
}

/** Resend directo (evita llamar a otra Edge Function: el gateway suele rechazar ese JWT con 401). */
async function sendAccountVerifiedEmail(userId: string): Promise<void> {
  if (!RESEND_API_KEY) {
    console.error('[admin-set-verification] Falta secret RESEND_API_KEY; no se envía correo de verificación.');
    return;
  }

  const rowRes = await fetch(
    `${SUPABASE_URL}/rest/v1/users?id=eq.${encodeURIComponent(userId)}&select=email,full_name&limit=1`,
    { headers: { apikey: SERVICE_ROLE_KEY, Authorization: `Bearer ${SERVICE_ROLE_KEY}` } }
  );
  const rows = await rowRes.json().catch(() => []);
  const row = Array.isArray(rows) ? rows[0] : null;
  if (!row?.email || typeof row.email !== 'string') {
    console.warn('[admin-set-verification] sin email para usuario', userId);
    return;
  }

  const appUrl =
    Deno.env.get('PUBLIC_SITE_URL')?.trim() ||
    Deno.env.get('SITE_URL')?.trim() ||
    'https://app.e-colector.com';

  const html = buildAccountVerifiedHtml(typeof row.full_name === 'string' ? row.full_name : '', appUrl);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: row.email.trim(),
      subject: '✅ Tu cuenta en e-colector ha sido verificada',
      html,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('[admin-set-verification] Resend:', res.status, JSON.stringify(data));
    return;
  }
  console.info('[admin-set-verification] correo cuenta verificada →', row.email, '| id:', (data as any)?.id);
}

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

  if (is_verified) {
    try {
      await sendAccountVerifiedEmail(user_id);
    } catch (e) {
      console.error('[admin-set-verification] sendAccountVerifiedEmail:', e);
    }
  }

  console.info('[admin-set-verification] user:', user_id, '→', is_verified);
  return json({ ok: true });
});
