# 🔄 Solución: Bucle Infinito en Dashboard

## ❌ Problema Identificado

El dashboard entra en un bucle infinito después del login porque:

1. **Función `get_user_info` falla** - Intenta hacer JOIN con `public.user_settings` que no existe
2. **Redirects infinitos** - Como `userInfo` está vacío, el dashboard redirige a `/login` constantemente
3. **Dependencia rota** - La función SQL no coincide con el esquema actual de la base de datos

---

## ✅ Solución

### **PASO 1: Ejecutar el Script SQL de Corrección**

1. **Abre Supabase Dashboard** → **SQL Editor**

2. **Copia y pega este contenido:**

```sql
-- Eliminar la función anterior
DROP FUNCTION IF EXISTS public.get_user_info(UUID);

-- Crear función simplificada que funcione con nuestro esquema actual
CREATE OR REPLACE FUNCTION public.get_user_info(p_user_id UUID)
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  full_name TEXT,
  tenant_id UUID,
  tenant_name TEXT,
  tenant_slug TEXT,
  is_admin BOOLEAN,
  theme_color TEXT,
  language TEXT,
  timezone TEXT,
  date_format TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.full_name,
    u.tenant_id,
    t.name,
    t.slug,
    u.is_admin,
    u.theme_color,
    u.language,        -- Usar valores de la tabla users directamente
    u.timezone,        -- Usar valores de la tabla users directamente  
    u.date_format      -- Usar valores de la tabla users directamente
  FROM public.users u
  INNER JOIN public.tenants t ON u.tenant_id = t.id
  WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

3. **Haz clic en "Run"**

---

### **PASO 2: Verificar que la Función Funciona**

1. **Ve a:** http://localhost:3001/api/debug/user-info
2. **Deberías ver algo como:**

```json
{
  "success": true,
  "data": {
    "user_id": "tu-user-id",
    "user_email": "tu-email@ejemplo.com",
    "user_info": [
      {
        "user_id": "tu-user-id",
        "email": "tu-email@ejemplo.com",
        "full_name": "Tu Nombre",
        "tenant_id": "tenant-id",
        "tenant_name": "Mi Primera Empresa",
        "tenant_slug": "mi-primera-empresa",
        "is_admin": true,
        "theme_color": "blue",
        "language": "es",
        "timezone": "Europe/Madrid",
        "date_format": "DD/MM/YYYY"
      }
    ],
    "user_info_count": 1
  }
}
```

**Si ves `user_info_count: 0` o un error, la función aún no funciona correctamente.**

---

### **PASO 3: Probar el Dashboard**

Una vez que `/api/debug/user-info` devuelva datos correctos:

1. **Ve a:** http://localhost:3001/dashboard
2. **El bucle infinito debería desaparecer**
3. **Deberías ver el dashboard normalmente**

---

## 🔍 Diagnóstico Adicional

Si el problema persiste, verifica:

### **1. Verificar que el Usuario Existe en public.users**

En Supabase SQL Editor:

```sql
SELECT u.id, u.email, u.full_name, u.tenant_id, t.name as tenant_name
FROM public.users u
LEFT JOIN public.tenants t ON u.tenant_id = t.id;
```

### **2. Verificar la Sesión de Auth**

En Supabase SQL Editor:

```sql
-- Esto no funcionará directamente, pero puedes verificar en Dashboard → Authentication → Users
```

### **3. Limpiar Caché del Navegador**

- **Ctrl + Shift + R** (hard refresh)
- O abre una ventana de incógnito

---

## 🛠️ Archivos Creados

- ✅ `scripts/006_fix_user_info_function.sql` - Script de corrección
- ✅ `app/api/debug/user-info/route.ts` - Endpoint de diagnóstico

---

## 📋 Checklist de Verificación

Antes de probar el dashboard:

- [ ] ✅ Script SQL ejecutado sin errores
- [ ] ✅ `/api/debug/user-info` devuelve `success: true`
- [ ] ✅ `user_info_count` es mayor que 0
- [ ] ✅ Datos del usuario aparecen correctamente
- [ ] ✅ Navegador con caché limpia

---

## 🎯 Resultado Esperado

Después de ejecutar el script SQL:

```
✅ Función get_user_info corregida
✅ Ahora funciona sin dependencias de user_settings
```

Y el endpoint `/api/debug/user-info` debería devolver datos del usuario correctamente.

---

**¡Una vez corregida la función SQL, el dashboard debería funcionar sin bucles infinitos!** 🚀
