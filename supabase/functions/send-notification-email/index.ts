import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const FROM_EMAIL = 'E-Colector <notificaciones@app.e-colector.com>';
const ADMIN_EMAIL = 'hola@e-colector.com';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getReceiverEmail(userId: string): Promise<string | null> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/users?id=eq.${userId}&select=email&limit=1`,
    {
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      },
    }
  );
  if (!res.ok) {
    console.error('[getReceiverEmail] HTTP', res.status);
    return null;
  }
  const rows = await res.json();
  return rows?.[0]?.email ?? null;
}

async function sendEmail(to: string, subject: string, html: string): Promise<{ ok: boolean; resendError?: string }> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error('[Resend] Error:', res.status, JSON.stringify(data));
    return { ok: false, resendError: data?.message || `HTTP ${res.status}` };
  }
  console.info('[Resend] Enviado a', to, '| id:', data?.id);
  return { ok: true };
}

function buildNewMessageEmail(senderName: string, messagePreview: string, appUrl: string): string {
  const preview = messagePreview.length > 200 ? messagePreview.slice(0, 200) + '…' : messagePreview;
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#059669;padding:24px 32px;text-align:center;">
        <h1 style="color:white;margin:0;font-size:22px;font-weight:700;">♻️ e-colector</h1>
        <p style="color:#a7f3d0;margin:4px 0 0;font-size:14px;">Conectando materiales con propósito</p>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#111827;margin-top:0;font-size:18px;">📬 Tienes un nuevo mensaje</h2>
        <p style="color:#6b7280;font-size:15px;line-height:1.6;">
          <strong style="color:#111827;">${senderName}</strong> te ha enviado un mensaje en e-colector:
        </p>
        <div style="background:white;border:1px solid #e5e7eb;border-left:4px solid #059669;border-radius:8px;padding:16px 20px;margin:20px 0;">
          <p style="color:#374151;margin:0;font-size:14px;line-height:1.7;white-space:pre-wrap;">${preview}</p>
        </div>
        <div style="text-align:center;margin:28px 0;">
          <a href="${appUrl}/mensajes"
             style="display:inline-block;background:#059669;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
            Ver mensaje →
          </a>
        </div>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
        <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">
          Recibiste este correo porque tienes una cuenta en e-colector.com.<br>
          Puedes gestionar tus preferencias en tu perfil.
        </p>
      </div>
    </div>`;
}

function buildContactFormEmail(name: string, email: string, subject: string, message: string): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#059669;padding:24px 32px;text-align:center;">
        <h1 style="color:white;margin:0;font-size:22px;font-weight:700;">♻️ e-colector</h1>
        <p style="color:#a7f3d0;margin:4px 0 0;font-size:14px;">Nuevo mensaje desde el formulario de contacto</p>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#111827;margin-top:0;font-size:18px;">📋 Nuevo contacto</h2>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <tr>
            <td style="padding:8px 12px;background:#f3f4f6;border-radius:6px 0 0 6px;color:#6b7280;font-size:13px;font-weight:600;width:90px;">Nombre</td>
            <td style="padding:8px 12px;background:#f3f4f6;border-radius:0 6px 6px 0;color:#111827;font-size:14px;">${name}</td>
          </tr>
          <tr><td colspan="2" style="padding:3px;"></td></tr>
          <tr>
            <td style="padding:8px 12px;background:#f3f4f6;border-radius:6px 0 0 6px;color:#6b7280;font-size:13px;font-weight:600;">Email</td>
            <td style="padding:8px 12px;background:#f3f4f6;border-radius:0 6px 6px 0;font-size:14px;">
              <a href="mailto:${email}" style="color:#059669;">${email}</a>
            </td>
          </tr>
          <tr><td colspan="2" style="padding:3px;"></td></tr>
          <tr>
            <td style="padding:8px 12px;background:#f3f4f6;border-radius:6px 0 0 6px;color:#6b7280;font-size:13px;font-weight:600;">Asunto</td>
            <td style="padding:8px 12px;background:#f3f4f6;border-radius:0 6px 6px 0;color:#111827;font-size:14px;font-weight:600;">${subject}</td>
          </tr>
        </table>
        <div style="background:white;border:1px solid #e5e7eb;border-radius:8px;padding:20px;margin-top:8px;">
          <p style="color:#374151;margin:0;font-size:14px;line-height:1.7;white-space:pre-wrap;">${message}</p>
        </div>
        <div style="text-align:center;margin-top:28px;">
          <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}"
             style="display:inline-block;background:#059669;color:white;padding:12px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px;">
            Responder a ${name}
          </a>
        </div>
      </div>
    </div>`;
}

function escapeHtml(s: string): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildAccountVerifiedEmail(fullName: string, appUrl: string): string {
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

function buildWelcomeRegistrationEmail(fullName: string, loginEmail: string, appUrl: string): string {
  const name = escapeHtml(fullName || 'Usuario');
  const mail = escapeHtml(loginEmail);
  const loginHref = `${appUrl.replace(/\/$/, '')}/login`;
  const rootHref = `${appUrl.replace(/\/$/, '')}/`;

  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#059669;padding:24px 32px;text-align:center;">
        <h1 style="color:white;margin:0;font-size:22px;font-weight:700;">♻️ e-colector</h1>
        <p style="color:#a7f3d0;margin:4px 0 0;font-size:14px;">Tu cuenta está lista</p>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#111827;margin-top:0;font-size:18px;">¡Bienvenido/a, ${name}!</h2>
        <p style="color:#6b7280;font-size:15px;line-height:1.6;">
          Creaste una cuenta en <strong style="color:#111827;">app.e-colector.com</strong>.
          Para entrar, usa el mismo correo con el que te registraste y tu contraseña.
        </p>
        <div style="background:white;border:1px solid #e5e7eb;border-radius:10px;padding:16px 20px;margin:22px 0;">
          <p style="margin:0 0 6px;font-size:13px;color:#6b7280;">Correo registrado</p>
          <p style="margin:0;font-size:15px;font-weight:700;color:#059669;">${mail}</p>
        </div>
        <div style="text-align:center;margin:28px 0;">
          <a href="${loginHref}"
             style="display:inline-block;background:#059669;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
            Ir a iniciar sesión →
          </a>
        </div>
        <p style="color:#9ca3af;font-size:13px;line-height:1.6;text-align:center;margin:0;">
          Si el botón no funciona, copia y pega esta dirección en tu navegador:<br>
          <a href="${loginHref}" style="color:#059669;word-break:break-all;">${escapeHtml(loginHref)}</a>
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0;">
        <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">
          También puedes visitar el inicio de la app:<br>
          <a href="${rootHref}" style="color:#059669;">${escapeHtml(rootHref)}</a>
        </p>
      </div>
    </div>`;
}

function buildNearbyMaterialEmail(
  receiverName: string, title: string, address: string, category: string,
  publisherName: string, productId: string, distanceKm: number, appUrl: string
): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
      <div style="background:#7c3aed;padding:24px 32px;text-align:center;">
        <h1 style="color:white;margin:0;font-size:22px;font-weight:700;">♻️ e-colector</h1>
        <p style="color:#ddd6fe;margin:4px 0 0;font-size:14px;">Hay material cerca de ti</p>
      </div>
      <div style="padding:32px;">
        <h2 style="color:#111827;margin-top:0;font-size:18px;">📍 Nuevo material a ${distanceKm} km de tu zona</h2>
        <p style="color:#6b7280;font-size:15px;line-height:1.6;">
          Hola <strong style="color:#111827;">${receiverName}</strong>, se acaba de publicar material reciclable
          dentro de tu radio de notificación:
        </p>
        <div style="background:white;border:1px solid #e5e7eb;border-left:4px solid #7c3aed;border-radius:8px;padding:16px 20px;margin:20px 0;">
          <p style="margin:0 0 8px;font-weight:700;font-size:16px;color:#111827;">${title}</p>
          <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">📦 Categoría: <strong>${category}</strong></p>
          <p style="margin:0 0 4px;font-size:13px;color:#6b7280;">👤 Publicado por: <strong>${publisherName}</strong></p>
          ${address ? `<p style="margin:0;font-size:13px;color:#6b7280;">📍 Dirección: ${address}</p>` : ''}
        </div>
        <div style="background:#f3f0ff;border-radius:10px;padding:12px 16px;margin-bottom:24px;text-align:center;">
          <span style="font-size:24px;">🚗</span>
          <p style="margin:4px 0 0;font-weight:700;font-size:18px;color:#7c3aed;">${distanceKm} km de distancia</p>
          <p style="margin:2px 0 0;font-size:12px;color:#9ca3af;">Estimado desde tu punto de búsqueda registrado</p>
        </div>
        <div style="text-align:center;margin:28px 0;">
          <a href="${appUrl}/listado/${productId}"
             style="display:inline-block;background:#7c3aed;color:white;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
            Ver publicación →
          </a>
        </div>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
        <p style="color:#9ca3af;font-size:12px;text-align:center;margin:0;">
          Recibiste este correo porque tienes notificaciones de proximidad activadas.<br>
          Puedes desactivarlas en tu perfil de recolector en e-colector.com.
        </p>
      </div>
    </div>`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const body = await req.json();
    const { type } = body;

    if (type === 'new_message') {
      const { receiver_id, sender_name, message_preview, app_url } = body;

      const receiverEmail = await getReceiverEmail(receiver_id);
      if (!receiverEmail) {
        console.error('[new_message] Receptor no encontrado para id:', receiver_id);
        return new Response(JSON.stringify({ error: 'Receiver not found' }), {
          status: 404,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }

      const html = buildNewMessageEmail(sender_name, message_preview, app_url || 'https://e-colector.com');
      const { ok, resendError } = await sendEmail(receiverEmail, `📬 Nuevo mensaje de ${sender_name} — e-colector`, html);

      return new Response(JSON.stringify({ success: ok, error: resendError }), {
        status: ok ? 200 : 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    if (type === 'contact_form') {
      const { from_name, from_email, subject, message } = body;
      const html = buildContactFormEmail(from_name, from_email, subject, message);
      const { ok, resendError } = await sendEmail(ADMIN_EMAIL, `[Contacto] ${subject}`, html);

      return new Response(JSON.stringify({ success: ok, error: resendError }), {
        status: ok ? 200 : 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    if (type === 'account_verified') {
      const { to_email, full_name, app_url } = body;
      if (!to_email || typeof to_email !== 'string') {
        return new Response(JSON.stringify({ error: 'to_email requerido' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }
      const appUrl = typeof app_url === 'string' && app_url.trim() ? app_url.trim() : 'https://app.e-colector.com';
      const html = buildAccountVerifiedEmail(full_name || '', appUrl);
      const { ok, resendError } = await sendEmail(
        to_email.trim(),
        '✅ Tu cuenta en e-colector ha sido verificada',
        html
      );
      return new Response(JSON.stringify({ success: ok, error: resendError }), {
        status: ok ? 200 : 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    if (type === 'welcome_registration') {
      const { to_email, full_name, app_url } = body;
      if (!to_email || typeof to_email !== 'string') {
        return new Response(JSON.stringify({ error: 'to_email requerido' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }
      const appUrl = typeof app_url === 'string' && app_url.trim() ? app_url.trim() : 'https://app.e-colector.com';
      const html = buildWelcomeRegistrationEmail(full_name || '', to_email, appUrl);
      const { ok, resendError } = await sendEmail(
        to_email.trim(),
        '✅ Tu cuenta en e-colector está lista — app.e-colector.com',
        html
      );
      return new Response(JSON.stringify({ success: ok, error: resendError }), {
        status: ok ? 200 : 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    if (type === 'nearby_material') {
      const { to_email, receiver_name, product_title, product_address, product_category, publisher_name, product_id, distance_km, app_url } = body;
      if (!to_email) {
        return new Response(JSON.stringify({ error: 'to_email requerido' }), {
          status: 400,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }
      const html = buildNearbyMaterialEmail(receiver_name, product_title, product_address, product_category, publisher_name, product_id, distance_km, app_url || 'https://e-colector.com');
      const { ok, resendError } = await sendEmail(to_email, `♻️ Nuevo material cerca de ti: ${product_title}`, html);
      return new Response(JSON.stringify({ success: ok, error: resendError }), {
        status: ok ? 200 : 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown type' }), {
      status: 400,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('send-notification-email error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
    });
  }
});
