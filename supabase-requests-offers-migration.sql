-- ============================================
-- MIGRACIÓN: Vincular ofertas a solicitudes de recolección
-- ============================================
-- Ejecutar en el SQL Editor de Supabase

-- Agregar columna request_id a la tabla offers
-- Esto permite que recolectores hagan ofertas directamente sobre solicitudes de recolección
ALTER TABLE public.offers ADD COLUMN IF NOT EXISTS request_id UUID REFERENCES public.requests(id) ON DELETE CASCADE;

-- Índice para consultas por request_id
CREATE INDEX IF NOT EXISTS idx_offers_request_id ON public.offers(request_id);

-- La tabla offers ahora puede estar vinculada a un producto (compra/venta normal)
-- O a una solicitud de recolección (request_id).
-- Ambos son opcionales para mantener compatibilidad hacia atrás.
