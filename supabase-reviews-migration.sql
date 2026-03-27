-- ─────────────────────────────────────────────────────────────────────────────
-- Tabla de reseñas entre usuarios (post-venta, post-recolección, etc.)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.reviews (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id       UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reviewed_user_id  UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id        UUID        REFERENCES public.products(id) ON DELETE SET NULL,
  rating            INTEGER     NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment           TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW(),

  -- Un usuario sólo puede dejar una reseña por producto/transacción
  CONSTRAINT reviews_unique_per_product UNIQUE (reviewer_id, reviewed_user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_reviewed_user ON public.reviews(reviewed_user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_reviewer       ON public.reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product        ON public.reviews(product_id);

-- ── Row Level Security ──────────────────────────────────────────────────────

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Cualquiera puede leer reseñas
CREATE POLICY "Reviews are publicly readable"
  ON public.reviews FOR SELECT
  USING (true);

-- Solo el autor puede crear su propia reseña
CREATE POLICY "Users can create own reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT auth_user_id FROM public.users WHERE id = reviewer_id
    )
  );

-- El autor puede actualizar/eliminar su propia reseña
CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT auth_user_id FROM public.users WHERE id = reviewer_id
    )
  );

CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE
  USING (
    auth.uid() IN (
      SELECT auth_user_id FROM public.users WHERE id = reviewer_id
    )
  );
