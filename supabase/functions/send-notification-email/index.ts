import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const FROM_EMAIL = 'E-Colector <notificaciones@app.e-colector.com>';
const ADMIN_EMAIL = 'hola@e-colector.com';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function sendEmail(to: string, subject: string, html: string): Promise<{ ok: boolean; error?: string }> {
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
    return { ok: false, error: data?.message || `HTTP ${res.status}` };
  }
  console.info('[Resend] Email enviado a', to, '| id:', data?.id);
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
          Puedes gestionar tus preferencias de notificación en tu perfil.
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS_HEADERS });
  }

  try {
    const body = await req.json();
    const { type } = body;

    if (type === 'new_message') {
      const { receiver_id, sender_name, message_preview, app_url } = body;

      const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data: userData, error } = await adminClient.auth.admin.getUserById(receiver_id);

      if (error || !userData?.user?.email) {
        return new Response(JSON.stringify({ error: 'Receiver not found' }), {
          status: 404,
          headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
        });
      }

      const receiverEmail = userData.user.email;
      const html = buildNewMessageEmail(sender_name, message_preview, app_url || 'https://e-colector.com');
      const { ok, error } = await sendEmail(receiverEmail, `📬 Nuevo mensaje de ${sender_name} — e-colector`, html);

      return new Response(JSON.stringify({ success: ok, error }), {
        status: ok ? 200 : 500,
        headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      });
    }

    if (type === 'contact_form') {
      const { from_name, from_email, subject, message } = body;
      const html = buildContactFormEmail(from_name, from_email, subject, message);
      const { ok, error } = await sendEmail(ADMIN_EMAIL, `[Contacto] ${subject}`, html);

      return new Response(JSON.stringify({ success: ok, error }), {
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
