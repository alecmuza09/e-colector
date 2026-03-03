-- ============================================================
-- SISTEMA DE PUNTOS Y RECOMPENSAS
-- Ejecuta en: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Tabla de reglas de puntos (configurable por admin)
CREATE TABLE IF NOT EXISTS public.reward_rules (
  id           UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  action_key   TEXT    NOT NULL UNIQUE,   -- identificador único: 'publicacion', 'oferta', etc.
  label        TEXT    NOT NULL,
  description  TEXT,
  points_per_action INTEGER NOT NULL DEFAULT 0,
  max_points   INTEGER,                   -- NULL = sin límite
  active       BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de niveles (configurable por admin)
CREATE TABLE IF NOT EXISTS public.reward_levels (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre      TEXT    NOT NULL,
  emoji       TEXT    NOT NULL,
  min_points  INTEGER NOT NULL,
  color       TEXT    DEFAULT 'gray',
  sort_order  INTEGER DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Datos por defecto para reglas
INSERT INTO public.reward_rules (action_key, label, description, points_per_action, max_points) VALUES
  ('publicacion', 'Publicar materiales',      'Por cada publicación activa',             15, NULL),
  ('oferta',      'Enviar / recibir ofertas',  'Por cada oferta enviada o recibida',       5, NULL),
  ('mensaje',     'Mensajes',                  'Por mensaje enviado o recibido',           2,   50),
  ('favorito',    'Favoritos guardados',        'Por favorito guardado',                   1,   20)
ON CONFLICT (action_key) DO NOTHING;

-- 4. Datos por defecto para niveles
INSERT INTO public.reward_levels (nombre, emoji, min_points, color, sort_order) VALUES
  ('Bronce',  '🥉',   0, 'orange', 1),
  ('Plata',   '🥈',  50, 'gray',   2),
  ('Oro',     '🥇', 150, 'yellow', 3),
  ('Platino', '💎', 350, 'purple', 4)
ON CONFLICT DO NOTHING;

-- 5. RLS: todos pueden leer, solo admin puede modificar
ALTER TABLE public.reward_rules  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_levels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública reward_rules"
  ON public.reward_rules FOR SELECT USING (true);

CREATE POLICY "Admin modifica reward_rules"
  ON public.reward_rules FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "Lectura pública reward_levels"
  ON public.reward_levels FOR SELECT USING (true);

CREATE POLICY "Admin modifica reward_levels"
  ON public.reward_levels FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_user_id = auth.uid() AND role = 'admin'
  ));

-- 6. Función de trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER reward_rules_updated_at
  BEFORE UPDATE ON public.reward_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
