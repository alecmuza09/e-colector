-- ============================================
-- SUPABASE STORAGE SETUP (E-COLECTOR)
-- Bucket: product-images
-- ============================================
-- Ejecuta en Supabase SQL Editor

-- 1) Crear bucket público para imágenes
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

-- 2) Policies en storage.objects
-- Nota: storage.objects ya tiene RLS habilitado en Supabase.

-- Lectura pública (para que cualquiera vea imágenes en listados/mapa)
drop policy if exists "Public can read product images" on storage.objects;
create policy "Public can read product images"
on storage.objects for select
using (bucket_id = 'product-images');

-- Subida por usuarios autenticados (owner = auth.uid())
drop policy if exists "Authenticated can upload product images" on storage.objects;
create policy "Authenticated can upload product images"
on storage.objects for insert
with check (
  bucket_id = 'product-images'
  and auth.role() = 'authenticated'
  and owner = auth.uid()
);

-- Actualizar/borrar solo tus objetos (opcional pero recomendado)
drop policy if exists "Owners can update product images" on storage.objects;
create policy "Owners can update product images"
on storage.objects for update
using (bucket_id = 'product-images' and owner = auth.uid())
with check (bucket_id = 'product-images' and owner = auth.uid());

drop policy if exists "Owners can delete product images" on storage.objects;
create policy "Owners can delete product images"
on storage.objects for delete
using (bucket_id = 'product-images' and owner = auth.uid());

do $$
begin
  raise notice 'Storage bucket y policies para product-images aplicadas.';
end $$;

