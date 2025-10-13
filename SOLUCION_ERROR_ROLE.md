# 🔧 Solución: Error "Could not find the 'role' column"

## Problema Identificado
El código de registro intentaba insertar una columna `role` que no existía en la tabla `users` de Supabase.

## ✅ Cambios Realizados

### 1. Código Corregido
- **Archivo**: `app/api/auth/register/route.ts`
- **Cambio**: Se reemplazó `role: "admin"` por `is_admin: true`

### 2. Script de Migración Creado
- **Archivo**: `scripts/005_add_user_roles.sql`
- **Propósito**: Agrega las columnas `is_admin` y `password_change_required` a la tabla `users`

### 3. Documentación Actualizada
- `README_DATABASE.md` - Incluye el nuevo script en la secuencia
- `INSTRUCCIONES_REGISTRO.md` - Marca como obligatorio el nuevo script

---

## 🚀 Pasos para Solucionar

### Paso 1: Ejecutar el Script SQL en Supabase

1. Abre tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a **SQL Editor**
3. Copia y pega el contenido de `scripts/005_add_user_roles.sql`
4. Haz clic en **Run** (o presiona Ctrl/Cmd + Enter)
5. Deberías ver el mensaje: ✓ Columnas de roles agregadas a la tabla users

### Paso 2: Reintentar el Registro

1. El servidor ya está corriendo en http://localhost:3000
2. Ve a http://localhost:3000/register
3. Completa el formulario con:
   - Nombre de la Organización
   - Tu nombre completo
   - Email
   - Contraseña (mínimo 6 caracteres)
4. El registro debería funcionar correctamente ahora

---

## 📋 Verificación Rápida

Para verificar que el script se ejecutó correctamente, puedes ejecutar esta query en Supabase SQL Editor:

```sql
-- Verificar que las columnas existen
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
  AND column_name IN ('is_admin', 'password_change_required');
```

Deberías ver ambas columnas de tipo `boolean`.

---

## 🔍 Detalles Técnicos

### Estructura Anterior (Incompleta)
```typescript
{
  id: UUID,
  tenant_id: UUID,
  email: string,
  full_name: string,
  // ❌ Faltaban columnas de rol
  is_active: boolean
}
```

### Estructura Nueva (Completa)
```typescript
{
  id: UUID,
  tenant_id: UUID,
  email: string,
  full_name: string,
  is_admin: boolean,              // ✅ Nueva
  password_change_required: boolean, // ✅ Nueva
  is_active: boolean
}
```

---

## ⚠️ Nota Importante

Si ya ejecutaste todos los scripts SQL iniciales pero **NO** el `005_add_user_roles.sql`, necesitas ejecutarlo ahora. Este script es **obligatorio** para que el registro de usuarios funcione.

## 🎯 Orden Completo de Scripts

Para nuevas instalaciones, ejecutar en este orden:

1. `000_create_base_tables.sql`
2. `001_create_properties_tables.sql`
3. `002_enable_rls_policies.sql`
4. `003_seed_configuration_data.sql`
5. `004_create_auth_functions.sql`
6. **`005_add_user_roles.sql`** ← Nuevo script

---

## 📞 Si el Error Persiste

Si después de ejecutar el script sigues teniendo problemas:

1. Verifica que el script se ejecutó sin errores
2. Limpia la caché del navegador
3. Reinicia el servidor Next.js (Ctrl+C y `npm run dev`)
4. Verifica las variables de entorno en `.env.local`

---

✅ **El servidor está corriendo en http://localhost:3000**  
✅ **El código está corregido**  
🔄 **Solo falta ejecutar el script SQL en Supabase**

