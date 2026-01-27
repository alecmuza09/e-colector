# Netlify Functions (Admin)

Para que el **Super Admin** pueda **crear y eliminar usuarios** (incluyendo `auth.users`) desde la plataforma, necesitas funciones server-side.

Este proyecto incluye:

- `netlify/functions/admin-create-user.mjs`
- `netlify/functions/admin-delete-user.mjs`

## 1) Variables de entorno en Netlify

En tu sitio de Netlify ve a **Site settings → Environment variables** y agrega:

- **VITE_PUBLIC_SITE_URL**: `https://e-colector.netlify.app`  
  - Se usa para que los emails de confirmación/recuperación de Supabase NO apunten a `localhost`.
  - Debe ser el dominio público donde corre la app.

- **SUPABASE_URL**: `https://tgadxzrlpauyjmwbqkqf.supabase.co`
- **SUPABASE_SERVICE_ROLE_KEY**: *(Service role key de Supabase)*  
  - Supabase → Project Settings → API → **Service role key**
  - **No la pongas en el frontend**. Solo aquí.

## 2) Deploy

Al hacer deploy, Netlify detectará `netlify.toml` y publicará:

- app SPA en `dist`
- functions en `/.netlify/functions/*`

## 3) Uso desde la UI

En el perfil del Super Admin (`/perfil`):

- **Usuarios → Crear usuario**: crea `auth.users` y su perfil en `public.users`
- **Usuarios → Eliminar**: elimina perfil y auth user (no permite borrar admins)

## 4) Seguridad

- Las funciones requieren `Authorization: Bearer <jwt>` del usuario logueado.
- Validan que el solicitante tenga rol `admin` en `public.users`.
