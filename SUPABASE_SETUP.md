# Configuración de Supabase para E-Colector

## Pasos para configurar la base de datos

### 1. Acceder a Supabase
1. Ve a [https://supabase.com](https://supabase.com)
2. Inicia sesión en tu proyecto: **E-Colector**
3. Project ID: `tu-project-id`

### 2. Ejecutar el esquema SQL
1. En el panel de Supabase, ve a **SQL Editor**
2. Abre el archivo `supabase-schema.sql` de este proyecto
3. Copia todo el contenido del archivo
4. Pégalo en el SQL Editor de Supabase
5. Haz clic en **Run** para ejecutar el script

Este script creará:
- Tabla `users` (perfiles de usuario)
- Tabla `products` (materiales/productos)
- Tabla `offers` (ofertas)
- Tabla `requests` (solicitudes de recolección)
- Tabla `messages` (mensajes entre usuarios)
- Tabla `favorites` (favoritos)
- Políticas de Row Level Security (RLS)
- Triggers para actualizar timestamps

### 3. Verificar las tablas
1. Ve a **Table Editor** en Supabase
2. Deberías ver las siguientes tablas:
   - `users`
   - `products`
   - `offers`
   - `requests`
   - `messages`
   - `favorites`

### 4. Configurar variables de entorno
Las variables de entorno ya están configuradas en el archivo `.env`:
```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

### 5. Probar la conexión
1. Ejecuta `npm run dev` para iniciar el servidor de desarrollo
2. Intenta registrarte o iniciar sesión
3. Verifica que los datos se guarden correctamente en Supabase

## Notas importantes

- **Row Level Security (RLS)**: Está habilitado en todas las tablas para seguridad
- **Autenticación**: Se usa Supabase Auth para manejar usuarios
- **Políticas**: Los usuarios solo pueden ver/editar sus propios datos y productos públicos activos

## Solución de problemas

Si encuentras errores:
1. Verifica que el esquema SQL se ejecutó correctamente
2. Revisa que las políticas RLS estén activas
3. Verifica que las variables de entorno estén correctas
4. Revisa la consola del navegador para errores
