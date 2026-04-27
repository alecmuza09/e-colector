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

const APP_URL = import.meta.env.VITE_PUBLIC_SITE_URL || window.location.origin;

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
