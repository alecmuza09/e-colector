-- ============================================
-- UPDATE: products image_urls (multi-fotos)
-- ============================================
-- Ejecuta en Supabase SQL Editor

alter table public.products
  add column if not exists image_urls text[] default '{}'::text[];

do $$
begin
  raise notice 'products.image_urls listo.';
end $$;

