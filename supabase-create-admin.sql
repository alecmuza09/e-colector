-- ============================================
-- CREAR USUARIO SUPERADMIN
-- ============================================
-- Este script crea el usuario superadmin
-- Ejecutar en el SQL Editor de Supabase DESPUÉS de crear el usuario en Auth

-- NOTA: Primero debes crear el usuario en Authentication > Users
-- Email: alec.muza@capacit.io
-- Password: alecmuza09
-- Luego ejecuta este script para crear el perfil en la tabla users

-- Obtener el auth_user_id del usuario creado
DO $$
DECLARE
  v_auth_user_id UUID;
BEGIN
  -- Buscar el usuario por email en auth.users
  SELECT id INTO v_auth_user_id
  FROM auth.users
  WHERE email = 'alec.muza@capacit.io'
  LIMIT 1;

  -- Si el usuario existe, crear el perfil de admin
  IF v_auth_user_id IS NOT NULL THEN
    INSERT INTO public.users (
      auth_user_id,
      role,
      full_name,
      email,
      is_verified,
      public_profile,
      terms_accepted
    ) VALUES (
      v_auth_user_id,
      'admin',
      'Alec Muza',
      'alec.muza@capacit.io',
      true,
      false,
      true
    )
    ON CONFLICT (auth_user_id) DO UPDATE
    SET role = 'admin',
        is_verified = true;
    
    RAISE NOTICE 'Usuario admin creado exitosamente con ID: %', v_auth_user_id;
  ELSE
    RAISE EXCEPTION 'Usuario no encontrado en auth.users. Por favor crea el usuario primero en Authentication > Users';
  END IF;
END $$;
