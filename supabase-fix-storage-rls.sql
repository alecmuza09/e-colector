-- ============================================
-- FIX: subir fotos a product-images (Storage RLS)
-- Error: "No tienes permiso para subir imágenes" / row-level security
-- Ejecutar en Supabase → SQL Editor (todo el script)
-- ============================================

-- Asegurar bucket público
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

-- Lectura pública
drop policy if exists "Public can read product images" on storage.objects;
create policy "Public can read product images"
on storage.objects for select
using (bucket_id = 'product-images');

-- INSERT: NO usar owner = auth.uid() en WITH CHECK (owner se asigna después del insert).
-- La app sube a: {auth_user_id}/{productKey}/{uuid}.ext
drop policy if exists "Authenticated can upload product images" on storage.objects;
create policy "Authenticated can upload product images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Variante permisiva si la anterior falla por formato de ruta (solo usuarios logueados al bucket)
drop policy if exists "Authenticated can upload product images fallback" on storage.objects;
create policy "Authenticated can upload product images fallback"
on storage.objects for insert
to authenticated
with check (bucket_id = 'product-images');

-- UPDATE / DELETE: solo archivos en tu carpeta o que seas owner
drop policy if exists "Owners can update product images" on storage.objects;
create policy "Owners can update product images"
on storage.objects for update
to authenticated
using (
  bucket_id = 'product-images'
  and (
    owner = auth.uid()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
)
with check (bucket_id = 'product-images');

drop policy if exists "Owners can delete product images" on storage.objects;
create policy "Owners can delete product images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'product-images'
  and (
    owner = auth.uid()
    or (storage.foldername(name))[1] = auth.uid()::text
  )
);

do $$
begin
  raise notice 'Storage RLS product-images actualizado. Vuelve a publicar con fotos.';
end $$;
