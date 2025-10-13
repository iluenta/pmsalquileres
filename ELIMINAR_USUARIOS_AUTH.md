# 🔴 GUÍA: Eliminar Usuarios de Supabase Authentication

## ⚠️ TU SITUACIÓN ACTUAL

```
Estado de tu Base de Datos:
┌─────────────────────────────────────────┐
│ public.tenants   → ✅ VACÍA             │
│ public.users     → ✅ VACÍA             │
│ auth.users       → ❌ TIENE USUARIOS    │
└─────────────────────────────────────────┘
```

**El problema**: Los usuarios en `auth.users` no se pueden eliminar con SQL normal. Debes hacerlo desde el Dashboard de Supabase.

---

## 🎯 SOLUCIÓN - 5 Pasos Simples

### **PASO 1: Abre Supabase Dashboard**

1. Ve a: **https://supabase.com/dashboard**
2. Inicia sesión si es necesario
3. Haz clic en tu proyecto

---

### **PASO 2: Ve a Authentication**

En el menú lateral izquierdo:
```
🔍 Busca el ícono de escudo 🛡️
📍 Haz clic en: "Authentication"
```

---

### **PASO 3: Ve a Users**

Dentro de Authentication:
```
📍 Haz clic en: "Users"
```

Verás una tabla con todos los usuarios.

---

### **PASO 4: Elimina CADA Usuario**

Para **CADA** usuario en la lista:

```
1. Haz clic en los 3 puntos (⋮) al final de la fila
2. Selecciona: "Delete user"
3. Confirma haciendo clic en "Delete" en el modal
4. Repite hasta que la lista esté COMPLETAMENTE VACÍA
```

**Ejemplo visual:**
```
┌──────────────────────────────────────────────────┐
│ email@example.com  │ Created  │ Last sign in  ⋮ │ ← Haz clic aquí
│                                            ▼     │
│                                      Delete user │ ← Selecciona esto
└──────────────────────────────────────────────────┘
```

---

### **PASO 5: Verifica que Esté Vacío**

La página debe mostrar:
```
"No users yet"
```

O una tabla completamente vacía.

---

## ✅ DESPUÉS DE LIMPIAR

1. **Vuelve a tu aplicación**: http://localhost:3000/register

2. **Completa el formulario de registro:**
   - Nombre de la Organización: Lo que quieras
   - Nombre Completo: Tu nombre
   - Email: Tu email
   - Contraseña: Al menos 6 caracteres
   - Confirmar Contraseña: La misma

3. **Haz clic en "Crear Cuenta"**

4. **¡Listo!** Ahora debería funcionar sin errores

---

## 🔍 Verificación Adicional (Opcional)

Si quieres estar 100% seguro de que todo está limpio:

### En Supabase SQL Editor, ejecuta:

```sql
-- Ver usuarios en public.users (debería estar vacía)
SELECT * FROM public.users;

-- Ver tenants en public.tenants (debería estar vacía)
SELECT * FROM public.tenants;
```

Ambas queries deben retornar **0 filas**.

---

## ❓ Preguntas Frecuentes

### **¿Por qué no puedo eliminar usuarios con SQL?**
Porque `auth.users` es una tabla especial del sistema de autenticación de Supabase que solo se puede modificar a través de:
- El Dashboard (método manual)
- La Admin API (método programático)

### **¿Eliminar usuarios de Auth también elimina de public.users?**
No. Son tablas separadas. Por eso ejecutaste el SQL para limpiar `public.users` y `public.tenants`, pero los usuarios de Auth quedaron.

### **¿Cuántos usuarios debo eliminar?**
TODOS los que veas en Authentication → Users. Déjala completamente vacía para empezar de cero.

### **¿Y si quiero conservar el usuario demo?**
Entonces elimina solo los usuarios que NO sean `admin@demo.com`. Pero ten cuidado de que el usuario demo tenga su correspondiente entrada en `public.users` y `public.tenants`.

---

## 🚨 Si Sigues Teniendo Problemas

Si después de eliminar TODOS los usuarios de Auth el error persiste:

1. **Verifica variables de entorno** (`.env.local`):
   ```
   NEXT_PUBLIC_SUPABASE_URL=tu_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_key_anonima
   SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
   ```

2. **Reinicia el servidor Next.js**:
   ```bash
   Ctrl + C
   npm run dev
   ```

3. **Limpia la caché del navegador**:
   - Ctrl + Shift + Delete
   - Selecciona "Cookies y otros datos de sitios"
   - Haz clic en "Borrar datos"

4. **Intenta con un email diferente** al que usaste antes

---

## 📸 Captura de Pantalla del Dashboard

Cuando estés en **Authentication → Users**, deberías ver algo así:

```
┌────────────────────────────────────────────────────┐
│  Authentication                                     │
│                                                     │
│  ┌─────────────────┐                               │
│  │ • Users         │ ← Haz clic aquí               │
│  │   Policies      │                               │
│  │   Providers     │                               │
│  │   Templates     │                               │
│  └─────────────────┘                               │
│                                                     │
│  Users                            [Add user]       │
│  ┌──────────────────────────────────────────────┐ │
│  │ Email          │ Created │ Last sign in │ ⋮ │ │
│  ├──────────────────────────────────────────────┤ │
│  │ user@demo.com  │ 1h ago  │ Never        │ ⋮ │ │ ← Elimina esto
│  └──────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────┘
```

**Haz clic en `⋮` → "Delete user"**

---

## ✅ Checklist Final

Antes de reintentar el registro, verifica:

- [ ] No hay usuarios en **Authentication → Users** (lista completamente vacía)
- [ ] No hay registros en `public.users` (query SQL retorna 0 filas)
- [ ] No hay registros en `public.tenants` (query SQL retorna 0 filas)
- [ ] El servidor Next.js está corriendo (http://localhost:3000)
- [ ] Las variables de entorno están configuradas

Si todos los checks están ✅, el registro funcionará sin problemas.

---

**¡Ya casi está! Solo necesitas limpiar los usuarios de Authentication desde el Dashboard.** 🚀

