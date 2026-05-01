import { supabase } from '../lib/supabase';

interface NewMessageEmailOptions {
  receiver_id: string;
  sender_name: string;
  message_preview: string;
}

interface ContactFormEmailOptions {
  from_name: string;
  from_email: string;
  subject: string;
  message: string;
}

const APP_URL =
  import.meta.env.VITE_PUBLIC_SITE_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'https://app.e-colector.com');

export async function sendNewMessageEmail(options: NewMessageEmailOptions): Promise<void> {
  try {
    await supabase.functions.invoke('send-notification-email', {
      body: {
        type: 'new_message',
        app_url: APP_URL,
        ...options,
      },
    });
  } catch (err) {
    console.error('[email] Error enviando notificación de mensaje:', err);
  }
}

export async function sendContactFormEmail(options: ContactFormEmailOptions): Promise<void> {
  try {
    await supabase.functions.invoke('send-notification-email', {
      body: {
        type: 'contact_form',
        ...options,
      },
    });
  } catch (err) {
    console.error('[email] Error enviando email de contacto:', err);
  }
}

export interface NearbyMaterialEmailOptions {
  to_email: string;
  receiver_name: string;
  product_title: string;
  product_address: string;
  product_category: string;
  publisher_name: string;
  product_id: string;
  distance_km: number;
}

export async function sendNearbyMaterialEmail(options: NearbyMaterialEmailOptions): Promise<void> {
  try {
    await supabase.functions.invoke('send-notification-email', {
      body: {
        type: 'nearby_material',
        app_url: APP_URL,
        ...options,
      },
    });
  } catch (err) {
    console.error('[email] Error enviando notificación de material cercano:', err);
  }
}

/** Correo de bienvenida tras registrar cuenta (Resend vía Edge Function) */
export async function sendWelcomeRegistrationEmail(options: { to_email: string; full_name: string }): Promise<void> {
  try {
    await supabase.functions.invoke('send-notification-email', {
      body: {
        type: 'welcome_registration',
        app_url: APP_URL,
        to_email: options.to_email.trim(),
        full_name: options.full_name.trim(),
      },
    });
  } catch (err) {
    console.error('[email] Error enviando correo de bienvenida:', err);
  }
}
