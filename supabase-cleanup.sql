-- ============================================
-- SCRIPT DE LIMPIEZA DE DATOS - E-COLECTOR
-- ============================================
-- Este script elimina todos los datos de las tablas
-- pero mantiene la estructura y configuración
-- Ejecutar en el SQL Editor de Supabase

-- Desactivar temporalmente RLS para limpiar datos
ALTER TABLE public.favorites DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Eliminar todos los datos (en orden de dependencias)
DELETE FROM public.favorites;
DELETE FROM public.messages;
DELETE FROM public.offers;
DELETE FROM public.requests;
DELETE FROM public.products;
DELETE FROM public.users WHERE auth_user_id IS NOT NULL; -- Mantener solo usuarios del sistema si los hay

-- Reactivar RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Reiniciar secuencias si es necesario (aunque usamos UUID, esto es por si acaso)
-- No necesario para UUID, pero lo dejamos comentado por referencia

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE 'Limpieza completada. Todas las tablas han sido vaciadas.';
END $$;
