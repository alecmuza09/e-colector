-- ============================================
-- UPDATE: Admin panel + Seguridad de roles
-- ============================================
-- Ejecuta este script si ya corriste el esquema antes y quieres:
-- - Evitar que usuarios se auto-asignen role='admin'
-- - Permitir que admins vean todo para el panel (conteos/actividad)
--
-- Recomendado ejecutarlo en Supabase SQL Editor.

-- 1) Trigger anti-escalación de rol
CREATE OR REPLACE FUNCTION public.prevent_users_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.role = 'admin' THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.users
        WHERE auth_user_id = auth.uid()
          AND role = 'admin'
      ) THEN
        RAISE EXCEPTION 'No autorizado para crear usuarios admin';
      END IF;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      IF NOT EXISTS (
        SELECT 1 FROM public.users
        WHERE auth_user_id = auth.uid()
          AND role = 'admin'
      ) THEN
        RAISE EXCEPTION 'No autorizado para cambiar el rol de usuario';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_users_role_escalation_trigger ON public.users;
CREATE TRIGGER prevent_users_role_escalation_trigger
BEFORE INSERT OR UPDATE OF role ON public.users
FOR EACH ROW EXECUTE FUNCTION public.prevent_users_role_escalation();

-- 2) Policies: admins ven todo
DROP POLICY IF EXISTS "Admins can view all products" ON public.products;
DROP POLICY IF EXISTS "Admins can update any product" ON public.products;
DROP POLICY IF EXISTS "Admins can delete any product" ON public.products;
DROP POLICY IF EXISTS "Admins can view all offers" ON public.offers;
DROP POLICY IF EXISTS "Admins can view all requests" ON public.requests;
DROP POLICY IF EXISTS "Admins can view all messages" ON public.messages;
DROP POLICY IF EXISTS "Admins can view all favorites" ON public.favorites;

CREATE POLICY "Admins can view all products" ON public.products
  FOR SELECT USING (
    auth.uid() IN (SELECT auth_user_id FROM public.users WHERE role = 'admin')
  );

CREATE POLICY "Admins can update any product" ON public.products
  FOR UPDATE USING (
    auth.uid() IN (SELECT auth_user_id FROM public.users WHERE role = 'admin')
  );

CREATE POLICY "Admins can delete any product" ON public.products
  FOR DELETE USING (
    auth.uid() IN (SELECT auth_user_id FROM public.users WHERE role = 'admin')
  );

CREATE POLICY "Admins can view all offers" ON public.offers
  FOR SELECT USING (
    auth.uid() IN (SELECT auth_user_id FROM public.users WHERE role = 'admin')
  );

CREATE POLICY "Admins can view all requests" ON public.requests
  FOR SELECT USING (
    auth.uid() IN (SELECT auth_user_id FROM public.users WHERE role = 'admin')
  );

CREATE POLICY "Admins can view all messages" ON public.messages
  FOR SELECT USING (
    auth.uid() IN (SELECT auth_user_id FROM public.users WHERE role = 'admin')
  );

CREATE POLICY "Admins can view all favorites" ON public.favorites
  FOR SELECT USING (
    auth.uid() IN (SELECT auth_user_id FROM public.users WHERE role = 'admin')
  );

DO $$
BEGIN
  RAISE NOTICE 'Update admin panel aplicado correctamente.';
END $$;

