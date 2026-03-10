-- ─── Migración: tabla green_impact_log ───────────────────────────────────────
-- Ejecuta este script en el SQL Editor de Supabase si la tabla no existe.

CREATE TABLE IF NOT EXISTS public.green_impact_log (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  collector_id UUID       NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  material    TEXT        NOT NULL,
  quantity_kg DECIMAL(10,2) NOT NULL,
  date        DATE        NOT NULL DEFAULT CURRENT_DATE,
  source      TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_green_impact_collector
  ON public.green_impact_log(collector_id);

-- Habilitar RLS
ALTER TABLE public.green_impact_log ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas anteriores si existen (para re-aplicar limpiamente)
DROP POLICY IF EXISTS "collectors_manage_own_impact" ON public.green_impact_log;
DROP POLICY IF EXISTS "admins_read_all_impact"       ON public.green_impact_log;

-- Política: cada recolector gestiona sus propios registros
CREATE POLICY "collectors_manage_own_impact" ON public.green_impact_log
  FOR ALL
  USING      (collector_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()))
  WITH CHECK (collector_id = (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- Política: los admin pueden leer todos los registros
CREATE POLICY "admins_read_all_impact" ON public.green_impact_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE auth_user_id = auth.uid() AND role = 'admin'
    )
  );
