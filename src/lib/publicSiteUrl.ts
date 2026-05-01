/** URL pública de la app en producción (correos, redirects). */
const DEFAULT_PUBLIC_SITE = 'https://app.e-colector.com';

function isPlaceholder(value: string): boolean {
  const v = value.trim();
  return v === 'VITE_PUBLIC_SITE_URL' || v === 'VITE_SITE_URL' || v === '${VITE_PUBLIC_SITE_URL}';
}

/**
 * URL base para enlaces (emails, OAuth redirect).
 * Ignora valores que no sean http(s) y placeholders típicos de .env mal copiado.
 */
export function resolvePublicSiteUrl(): string {
  const candidates = [import.meta.env.VITE_PUBLIC_SITE_URL, import.meta.env.VITE_SITE_URL];

  for (const raw of candidates) {
    const s = typeof raw === 'string' ? raw.trim().replace(/\/+$/, '') : '';
    if (!s || isPlaceholder(s)) continue;
    if (s.startsWith('http://') || s.startsWith('https://')) return s;
  }

  if (typeof window !== 'undefined') {
    const o = String(window.location?.origin || '').trim().replace(/\/+$/, '');
    if (o.startsWith('http://') || o.startsWith('https://')) return o;
  }

  return DEFAULT_PUBLIC_SITE;
}
