# Configuración del Usuario Superadmin

## Pasos para crear el usuario superadmin

### 1. Crear usuario en Authentication
1. Ve a **Authentication** > **Users** en Supabase
2. Haz clic en **Add User** > **Create new user**
3. Ingresa los siguientes datos:
   - **Email**: `alec.muza@capacit.io`
   - **Password**: `alecmuza09`
   - **Auto Confirm User**: ✅ (marcar esta opción)
4. Haz clic en **Create User**

### 2. Crear perfil de admin en la base de datos
1. Ve al **SQL Editor** en Supabase
2. Abre el archivo `supabase-create-admin.sql`
3. Copia y ejecuta el contenido
4. Esto creará el perfil de admin en la tabla `users` vinculado al usuario de auth

### 3. Verificar creación
1. Ve a **Table Editor** > **users**
2. Busca el usuario con email `alec.muza@capacit.io`
3. Verifica que el campo `role` sea `admin`

## Características del Superadmin

- ✅ Acceso completo al sistema
- ✅ Puede ver todos los usuarios
- ✅ Puede crear, editar y eliminar usuarios (excepto otros admins)
- ✅ Puede verificar/desverificar usuarios
- ✅ Acceso a todas las funcionalidades sin restricciones

## Seguridad

- ⚠️ **IMPORTANTE**: Los usuarios con rol `admin` solo pueden ser creados manualmente por otro admin o mediante scripts SQL
- ⚠️ El formulario de registro **NO** permite crear usuarios admin
- ⚠️ Solo los admins pueden eliminar usuarios (pero no otros admins)

## Notas

- El usuario admin tiene acceso a la página de administración en `/perfil` cuando está logueado
- Desde ahí puede gestionar todos los usuarios del sistema
- Los cambios en el esquema SQL deben ejecutarse para que las políticas RLS funcionen correctamente
