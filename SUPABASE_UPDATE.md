# Actualización del Esquema de Supabase

## Pasos para actualizar el esquema en Supabase

### 1. Limpiar datos existentes (Opcional)
Si quieres empezar desde cero, ejecuta primero el script de limpieza:

1. Ve al **SQL Editor** en Supabase
2. Abre el archivo `supabase-cleanup.sql`
3. Copia y ejecuta el contenido
4. Esto eliminará todos los datos pero mantendrá la estructura

### 2. Actualizar políticas RLS
El esquema actualizado incluye mejoras en las políticas de Row Level Security:

- **Productos**: Ahora permiten acceso anónimo para ver productos activos (necesario para producción)
- **Solicitudes**: Permiten acceso anónimo para ver solicitudes activas
- **Autenticación**: Mejoras en la verificación de usuarios autenticados

### 3. Ejecutar el esquema actualizado
1. Ve al **SQL Editor** en Supabase
2. Si ya ejecutaste el esquema anterior, puedes ejecutar solo las partes actualizadas
3. O ejecuta el esquema completo `supabase-schema.sql` (se actualizará automáticamente)

### 4. Verificar las políticas
1. Ve a **Authentication** > **Policies** en Supabase
2. Verifica que las políticas estén activas
3. Asegúrate de que "Anyone can view active products" esté habilitada

## Notas importantes

- Las políticas RLS ahora permiten acceso anónimo a productos activos
- Esto es necesario para que la aplicación funcione en producción (Netlify)
- Los usuarios anónimos solo pueden VER productos, no crear, editar o eliminar
- Para crear productos, los usuarios deben estar autenticados

## Solución de problemas

Si encuentras errores de permisos:
1. Verifica que las políticas RLS estén habilitadas
2. Asegúrate de que el rol 'authenticated' esté correctamente configurado
3. Revisa los logs de Supabase para ver errores específicos
