-- ============================================
-- FIX: publicar material (RLS en products)
-- Error típico: "new row violates row-level security policy"
-- Ejecutar en Supabase → SQL Editor
-- ============================================

-- 1) El usuario autenticado debe poder leer su propia fila en users (para validar inserts)
drop policy if exists "Users can view own profile" on public.users;
create policy "Users can view own profile"
on public.users for select
using (auth.uid() = auth_user_id);

-- 2) Política de INSERT en products: user_id debe ser el id del perfil del usuario actual
drop policy if exists "Authenticated users can insert products" on public.products;
create policy "Authenticated users can insert products"
on public.products for insert
with check (
  auth.role() = 'authenticated'
  and user_id = (
    select id from public.users
    where auth_user_id = auth.uid()
    limit 1
  )
);

-- 3) UPDATE/DELETE propios (por si faltaban o estaban mal)
drop policy if exists "Users can update own products" on public.products;
create policy "Users can update own products"
on public.products for update
using (
  auth.role() = 'authenticated'
  and user_id = (select id from public.users where auth_user_id = auth.uid() limit 1)
)
with check (
  user_id = (select id from public.users where auth_user_id = auth.uid() limit 1)
);

drop policy if exists "Users can delete own products" on public.products;
create policy "Users can delete own products"
on public.products for delete
using (
  auth.role() = 'authenticated'
  and user_id = (select id from public.users where auth_user_id = auth.uid() limit 1)
);

do $$
begin
  raise notice 'Políticas RLS de products actualizadas. Prueba publicar de nuevo.';
end $$;
