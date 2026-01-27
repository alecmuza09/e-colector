-- Permitir que el dueño pueda ver sus propios productos (sin importar status)
-- (necesario para "Mis publicaciones" y para editar publicaciones)

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Evitar error si ya existe con otro nombre: intentamos crear con nombre estable
  BEGIN
    EXECUTE 'CREATE POLICY "Users can view own products" ON public.products
      FOR SELECT USING (
        auth.role() = ''authenticated'' AND
        auth.uid() IN (SELECT auth_user_id FROM public.users WHERE id = user_id)
      );';
  EXCEPTION
    WHEN duplicate_object THEN
      -- ya existe, no hacer nada
      NULL;
  END;
END $$;

