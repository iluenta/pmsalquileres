# 🚀 Guía de Deployment en Vercel

## 📋 Configuración de Variables de Entorno

### 1. **Variables Requeridas en Vercel**

Ve a tu proyecto en Vercel Dashboard → Settings → Environment Variables y agrega:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
```

### 2. **Cómo Obtener los Valores de Supabase**

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. Ve a **Settings → API**
4. Copia los valores:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret** → `SUPABASE_SERVICE_ROLE_KEY`

### 3. **Configuración en Vercel**

#### **Método 1: Dashboard de Vercel**
1. Ve a tu proyecto en Vercel
2. **Settings** → **Environment Variables**
3. Agrega cada variable con su valor correspondiente
4. **Redeploy** el proyecto

#### **Método 2: CLI de Vercel**
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

### 4. **Configuración de Base de Datos**

Antes del deployment, asegúrate de ejecutar estos scripts SQL en tu instancia de Supabase:

```sql
-- Ejecutar en orden:
1. scripts/000_create_base_tables.sql
2. scripts/001_create_properties_tables.sql
3. scripts/002_enable_rls_policies.sql
4. scripts/003_seed_configuration_data.sql
5. scripts/004_create_auth_functions.sql
6. scripts/005_add_user_roles.sql
7. scripts/006_fix_user_info_function.sql
8. scripts/007_fix_function_data_types.sql
```

### 5. **Solución de Problemas Comunes**

#### **Error: "Missing Supabase environment variables"**
- ✅ Verifica que todas las variables estén configuradas en Vercel
- ✅ Asegúrate de que los nombres sean exactos (case-sensitive)
- ✅ Redeploy después de agregar variables

#### **Error de Build: "Your project's URL and API key are required"**
- ✅ Verifica que `NEXT_PUBLIC_SUPABASE_URL` esté configurada
- ✅ Verifica que `NEXT_PUBLIC_SUPABASE_ANON_KEY` esté configurada
- ✅ Las variables deben estar disponibles durante el build

#### **Error de Autenticación en Producción**
- ✅ Verifica que `SUPABASE_SERVICE_ROLE_KEY` esté configurada
- ✅ Asegúrate de que las políticas RLS estén habilitadas
- ✅ Verifica que las funciones de autenticación estén creadas

### 6. **Verificación Post-Deployment**

1. **Visita tu aplicación** en la URL de Vercel
2. **Prueba el registro** de un nuevo usuario
3. **Verifica el login** con el usuario creado
4. **Navega por el dashboard** para confirmar que todo funciona

### 7. **Monitoreo**

- **Vercel Dashboard**: Monitorea el rendimiento y errores
- **Supabase Dashboard**: Verifica logs y métricas de la base de datos
- **Console del navegador**: Revisa errores del frontend

---

## 🎯 **Checklist de Deployment**

- [ ] Variables de entorno configuradas en Vercel
- [ ] Scripts SQL ejecutados en Supabase
- [ ] Proyecto desplegado sin errores
- [ ] Registro de usuario funcionando
- [ ] Login funcionando
- [ ] Dashboard accesible
- [ ] Base de datos conectada

**¡Tu PMS de alquileres vacacionales estará listo para producción!** 🚀
