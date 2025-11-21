# ⚡ Solución Rápida - 3 Pasos

## 🎯 Tu Problema
```
Error: duplicate key value violates unique constraint "users_pkey"
```

**Causa**: Ya existe un usuario con ese email en Supabase Auth.

---

## ✅ Solución en 3 Pasos

### 📍 PASO 1: Abre Supabase Dashboard
```
1. Ve a: https://supabase.com/dashboard
2. Selecciona tu proyecto
```

### 📍 PASO 2: Elimina el Usuario Duplicado
```
1. En el menú lateral, haz clic en: Authentication
2. Haz clic en: Users
3. Busca el usuario con tu email
4. Haz clic en los 3 puntos (⋮) al lado del usuario
5. Selecciona: "Delete user"
6. Confirma la eliminación
```

### 📍 PASO 3: Reintenta el Registro
```
1. Ve a: http://localhost:3000/register
2. Completa el formulario nuevamente
3. ¡Listo! Ahora debería funcionar
```

---

## 🔍 Verificación Opcional (Si quieres estar seguro)

### Verificar que no haya datos huérfanos:

**En Supabase Dashboard:**

1. **Table Editor** → **tenants**
   - ¿Hay algún tenant creado?
   - Si hay uno sin usuarios asociados, elimínalo

2. **Table Editor** → **users**
   - ¿Hay algún registro?
   - Si hay registros sin usuario de Auth asociado, elimínalos

---

## 💡 Información Adicional

### ¿Por qué pasó esto?
Un registro anterior falló después de crear el usuario en Auth pero antes de completar el proceso. Quedó un usuario "huérfano".

### ¿Se volverá a repetir?
No. He actualizado el código para que:
- ✅ Verifique si el usuario existe antes de crearlo
- ✅ Muestre un mensaje claro si el email ya está registrado
- ✅ Haga mejor rollback en caso de errores

---

## 📁 Archivos Relacionados

Si necesitas más detalles, consulta:
- `SOLUCION_USUARIO_DUPLICADO.md` - Guía completa con todas las opciones
- `scripts/999_cleanup_orphaned_users.sql` - Script SQL de limpieza
- `SOLUCION_ERROR_ROLE.md` - Solución del error anterior de columna 'role'

---

## 🚀 Estado del Proyecto

✅ Servidor funcionando en: http://localhost:3000  
✅ Scripts SQL actualizados  
✅ Código de registro mejorado  
✅ Documentación completa  

**→ Solo falta que elimines el usuario duplicado del Dashboard**

---

## 📞 ¿Sigue sin funcionar?

Si después de seguir estos 3 pasos el error persiste:

1. Asegúrate de haber ejecutado el script: `scripts/005_add_user_roles.sql`
2. Verifica tus variables de entorno en `.env.local`
3. Reinicia el servidor: Ctrl+C y luego `npm run dev`
4. Revisa la consola del servidor para más detalles

---

**¡Listo! Con estos 3 pasos deberías poder registrarte sin problemas.** 🎉

