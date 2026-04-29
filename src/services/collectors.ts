import { supabase } from '../lib/supabase';
import { sendNearbyMaterialEmail } from './email';

/** Distancia en kilómetros entre dos coordenadas usando la fórmula de Haversine */
export function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface CollectorPunto {
  lat: number;
  lng: number;
  address: string;
}

export interface CollectorPuntos {
  publicar?: CollectorPunto; // donde tiene material listo para dar
  buscar?: CollectorPunto;   // zona donde va a recolectar
  acopio?: CollectorPunto;   // centro de acopio / reciclaje
}

export interface NotifyNearbyOptions {
  productLat: number;
  productLng: number;
  productTitle: string;
  productAddress: string;
  productCategory: string;
  publisherName: string;
  productId: string;
}

/**
 * Busca todos los recolectores con notificaciones activas y envía
 * un email a los que se encuentren dentro de su radio configurado.
 * Se lanza como fire-and-forget; no bloquea al publicador.
 */
export async function notifyNearbyCollectors(options: NotifyNearbyOptions): Promise<void> {
  try {
    const { data: collectors } = await supabase
      .from('users')
      .select('id, email, full_name, profile_data')
      .eq('role', 'collector');

    if (!collectors || collectors.length === 0) return;

    for (const c of collectors as any[]) {
      const pd = c.profile_data || {};
      if (!pd.notificaciones_activas) continue;

      const radiusKm: number = pd.radio_notificaciones_km || 3;
      const puntos: CollectorPuntos = pd.puntos || {};

      // Punto de referencia prioritario: buscar > publicar > acopio
      const ref = puntos.buscar ?? puntos.publicar ?? puntos.acopio;
      if (!ref?.lat || !ref?.lng) continue;

      const distKm = haversineDistance(
        ref.lat, ref.lng,
        options.productLat, options.productLng
      );

      if (distKm <= radiusKm) {
        // Fire-and-forget: no esperamos respuesta
        sendNearbyMaterialEmail({
          to_email: c.email,
          receiver_name: c.full_name,
          product_title: options.productTitle,
          product_address: options.productAddress,
          product_category: options.productCategory,
          publisher_name: options.publisherName,
          product_id: options.productId,
          distance_km: Math.round(distKm * 10) / 10,
        });
      }
    }
  } catch (err) {
    console.error('[collectors] Error notificando recolectores cercanos:', err);
  }
}
