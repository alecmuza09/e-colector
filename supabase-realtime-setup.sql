-- ============================================================
-- HABILITAR REALTIME EN TABLA messages
-- ============================================================
-- Ejecuta este script en Supabase Dashboard → SQL Editor
-- Esto permite que los mensajes y notificaciones lleguen
-- en tiempo real sin necesidad de refrescar la página.
-- ============================================================

-- 1. Habilitar Realtime para la tabla messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- 2. (Opcional) Verificar qué tablas tienen Realtime activo
-- SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
