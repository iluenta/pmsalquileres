# 🔧 Corrección: Warning de Supabase - Function user_tenant_id

## ❌ Problema Identificado

Supabase muestra el warning:
> **"Function public.user_tenant_id has a role mutable search_path"**

### **¿Qué significa este warning?**
- La función `user_tenant_id` tiene un `search_path` mutable (cambiable)
- Esto puede ser un riesgo de seguridad porque permite que la función busque en esquemas no autorizados
- Supabase recomienda usar `search_path` fijo para mayor seguridad

## ✅ Solución

### **PASO 1: Ejecutar el Script de Corrección**

1. **Abre Supabase Dashboard** → **SQL Editor**

2. **Copia y pega el contenido del archivo:**
   ```
   scripts/fix_user_tenant_id_search_path.sql
   ```

3. **Haz clic en "Run"**

### **PASO 2: Verificar la Corrección**

1. **Ejecuta esta consulta para verificar:**
   ```sql
   SELECT proname, prosrc FROM pg_proc WHERE proname = 'user_tenant_id';
   ```

2. **Deberías ver que la función ahora tiene `SET search_path = 'public'`**

### **PASO 3: Probar la Función**

1. **Ejecuta esta consulta de prueba:**
   ```sql
   SELECT public.user_tenant_id();
   ```

2. **Debería retornar el tenant_id del usuario autenticado o NULL**

## 🔍 **¿Qué hace la función corregida?**

```sql
CREATE OR REPLACE FUNCTION public.user_tenant_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'  -- ← Esto corrige el warning
AS $$
DECLARE
  user_tenant_id UUID;
BEGIN
  SELECT u.tenant_id INTO user_tenant_id
  FROM public.users u
  WHERE u.id = auth.uid();
  
  RETURN user_tenant_id;
END;
$$;
```

### **Características de Seguridad:**
- ✅ `SET search_path = 'public'` - Path fijo y seguro
- ✅ `SECURITY DEFINER` - Ejecuta con permisos del creador
- ✅ Solo accede a tablas del esquema `public`
- ✅ Usa `auth.uid()` para obtener el usuario autenticado

## 🚨 **Importante**

- **Backup:** Siempre haz backup de tu base de datos antes de ejecutar scripts SQL
- **Testing:** Prueba la función en un entorno de desarrollo primero
- **Permisos:** La función mantiene los permisos necesarios para `authenticated` y `anon`

## 📋 **Verificación Final**

Después de aplicar la corrección:
1. ✅ El warning de Supabase debería desaparecer
2. ✅ La función `user_tenant_id()` debería funcionar correctamente
3. ✅ Las políticas RLS que usan esta función deberían seguir funcionando

---

**Archivo:** `scripts/fix_user_tenant_id_search_path.sql`  
**Fecha:** $(date)  
**Autor:** Sistema de corrección automática
