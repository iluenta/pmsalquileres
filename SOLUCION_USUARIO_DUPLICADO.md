# 🔧 Solución: Usuario Duplicado (Error 23505)

## ❌ Error Actual
```
duplicate key value violates unique constraint "users_pkey"
Key (id)=(d7577001-f9bb-4efc-95da-0cdafa125159) already exists.
```

## 🔍 Causa del Problema
Este error ocurre cuando:
1. Un registro anterior falló **después** de crear el usuario en Supabase Auth
2. El usuario quedó registrado en `auth.users` 
3. Cuando intentas registrarte de nuevo, el código intenta insertar el mismo ID en `public.users` y falla

---

## ✅ Solución Rápida (Recomendada)

### Opción A: Eliminar el Usuario desde Supabase Dashboard

1. **Accede a Supabase Dashboard:**
   - Ve a https://supabase.com/dashboard
   - Selecciona tu proyecto

2. **Elimina el usuario de Authentication:**
   - Ve a **Authentication** → **Users**
   - Busca el usuario con el email que intentaste registrar
   - Haz clic en los tres puntos `⋮` al lado del usuario
   - Selecciona **"Delete user"**
   - Confirma la eliminación

3. **Verifica que no haya datos huérfanos:**
   - Ve a **Table Editor** → **tenants**
   - Si hay un tenant sin usuarios asociados, elimínalo también
   - Ve a **Table Editor** → **users**
   - Verifica que no haya registros huérfanos

4. **Reintenta el registro:**
   - Vuelve a http://localhost:3000/register
   - Completa el formulario nuevamente
   - Ahora debería funcionar correctamente

---

### Opción B: Usar SQL para Limpiar (Si hay muchos usuarios duplicados)

1. **Ejecuta el script de limpieza:**
   ```sql
   -- Ver todos los usuarios actuales
   SELECT u.id, u.email, u.full_name, t.name as tenant_name
   FROM public.users u
   LEFT JOIN public.tenants t ON u.tenant_id = t.id;

   -- Ver todos los tenants
   SELECT id, name, slug FROM public.tenants;
   ```

2. **Si quieres empezar de cero** (eliminar TODOS los datos):
   ```sql
   -- ⚠️ ADVERTENCIA: Esto eliminará TODOS los usuarios y tenants
   DELETE FROM public.users;
   DELETE FROM public.tenants;
   ```

3. **Luego elimina los usuarios de Auth:**
   - Ve a **Authentication** → **Users** en Supabase Dashboard
   - Elimina manualmente cada usuario
   - O desactiva temporalmente la confirmación de email

---

## 🛡️ Prevención (Código Mejorado)

He actualizado el código de registro para prevenir este problema:

### Cambios Realizados:

**Archivo**: `app/api/auth/register/route.ts`

✅ **Agregado**: Verificación de usuarios existentes antes de crear
```typescript
// Verificar si el usuario ya existe
const { data: existingAuthUser } = await supabaseAdmin.auth.admin.listUsers()
const userExists = existingAuthUser?.users?.some((u) => u.email === email)

if (userExists) {
  return NextResponse.json(
    { error: "Ya existe un usuario con este correo electrónico" },
    { status: 409 }
  )
}
```

Ahora si intentas registrar un email que ya existe, recibirás un mensaje claro en lugar de un error técnico.

---

## 📋 Verificación Post-Limpieza

Después de limpiar los usuarios duplicados:

1. ✅ Verifica que no hay usuarios en **Authentication** → **Users**
2. ✅ Verifica que la tabla `public.users` está vacía
3. ✅ Verifica que la tabla `public.tenants` está vacía (o solo tiene datos de demo)
4. ✅ Intenta registrar un nuevo usuario
5. ✅ El registro debería completarse sin errores

---

## 🎯 Pasos Resumidos (HAZLO AHORA)

1. **Ve a Supabase Dashboard** → Authentication → Users
2. **Elimina el usuario** con el email que intentaste registrar
3. **Opcional**: Limpia la tabla tenants si hay registros huérfanos
4. **Reintenta el registro** en http://localhost:3000/register

---

## 📞 Si el Problema Persiste

Si después de seguir estos pasos el error continúa:

1. Verifica que ejecutaste el script `005_add_user_roles.sql`
2. Asegúrate de que las variables de entorno están configuradas:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Reinicia el servidor Next.js (Ctrl+C y `npm run dev`)
4. Revisa los logs del servidor para más detalles del error

---

## 🔑 Script SQL de Referencia

He creado un script completo de limpieza en:
📁 `scripts/999_cleanup_orphaned_users.sql`

Este script te ayuda a:
- Ver todos los usuarios y tenants
- Identificar datos huérfanos
- Limpiar la base de datos completamente (si es necesario)

---

✅ **Servidor funcionando**: http://localhost:3000  
✅ **Código actualizado**: Ahora previene duplicados  
🔄 **Siguiente paso**: Limpiar el usuario duplicado desde Supabase Dashboard

