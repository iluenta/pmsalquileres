# Instrucciones para Registrar el Primer Usuario

## Opción 1: Registro desde la Aplicación (Recomendado)

1. **Ejecuta los scripts SQL en orden:**
   - `scripts/000_create_base_tables.sql`
   - `scripts/001_create_properties_tables.sql`
   - `scripts/002_enable_rls_policies.sql`
   - `scripts/003_seed_configuration_data.sql`
   - `scripts/005_add_user_roles.sql` ⚠️ **IMPORTANTE: Sin este script, el registro fallará**

2. **Inicia la aplicación:**
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Accede a la página de registro:**
   - Navega a `http://localhost:3000/register`
   - O desde la página de login, haz clic en "Regístrate aquí"

4. **Completa el formulario:**
   - **Nombre de la Organización**: El nombre de tu empresa (ej: "Mi Empresa de Alquileres")
   - **Nombre Completo**: Tu nombre completo
   - **Email**: Tu correo electrónico
   - **Contraseña**: Mínimo 6 caracteres
   - **Confirmar Contraseña**: Repite la contraseña

5. **Confirma tu email:**
   - Supabase enviará un email de confirmación
   - Haz clic en el enlace del email para activar tu cuenta
   - Si estás en desarrollo, puedes desactivar la confirmación de email en Supabase

6. **Inicia sesión:**
   - Vuelve a `/login`
   - Ingresa con tu email y contraseña

## Opción 2: Crear Usuario desde Supabase Dashboard

1. **Accede al Dashboard de Supabase:**
   - Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Selecciona tu proyecto

2. **Crea un Tenant:**
   - Ve a "Table Editor" → "tenants"
   - Haz clic en "Insert row"
   - Completa:
     - `name`: Nombre de tu organización
     - `slug`: nombre-en-minusculas-con-guiones
     - `is_active`: true
   - Copia el `id` generado (lo necesitarás)

3. **Crea el Usuario en Auth:**
   - Ve a "Authentication" → "Users"
   - Haz clic en "Add user"
   - Ingresa email y contraseña
   - En "User Metadata" agrega:
     \`\`\`json
     {
       "full_name": "Tu Nombre",
       "tenant_id": "el-id-del-tenant-que-copiaste"
     }
     \`\`\`
   - Copia el `id` del usuario creado

4. **Crea el Registro en la Tabla Users:**
   - Ve a "Table Editor" → "users"
   - Haz clic en "Insert row"
   - Completa:
     - `id`: El ID del usuario de Auth
     - `tenant_id`: El ID del tenant
     - `email`: El mismo email
     - `full_name`: Tu nombre
     - `is_active`: true

5. **Inicia sesión:**
   - Ve a `/login` en tu aplicación
   - Ingresa con el email y contraseña

## Desactivar Confirmación de Email (Solo Desarrollo)

Para facilitar el desarrollo, puedes desactivar la confirmación de email:

1. Ve a Supabase Dashboard → Authentication → Settings
2. En "Email Auth" desactiva "Enable email confirmations"
3. Guarda los cambios

Ahora los usuarios podrán iniciar sesión inmediatamente después de registrarse.

## Solución de Problemas

### "Email not confirmed"
- Revisa tu bandeja de entrada y spam
- O desactiva la confirmación de email en Supabase (solo desarrollo)

### "Invalid login credentials"
- Verifica que el email y contraseña sean correctos
- Asegúrate de que el usuario existe en auth.users

### "User not found in database"
- Verifica que el registro existe en la tabla `public.users`
- El `id` debe coincidir con el de `auth.users`
- El `tenant_id` debe existir en la tabla `tenants`

### "Permission denied"
- Asegúrate de haber ejecutado el script `002_enable_rls_policies.sql`
- Verifica que las políticas RLS estén activas

## Próximos Pasos

Una vez que hayas iniciado sesión:

1. **Configura tu perfil** en `/dashboard/profile`
2. **Personaliza el sistema** en `/dashboard/settings`
3. **Crea tipos de configuración** en `/dashboard/configuration`
4. **Añade tus propiedades** en `/dashboard/properties`

¡Listo! Ya puedes empezar a usar tu PMS de alquileres vacacionales.
