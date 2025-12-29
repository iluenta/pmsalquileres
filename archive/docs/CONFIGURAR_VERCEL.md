# 🔴 ERROR DE BUILD EN VERCEL - SOLUCIÓN

## ❌ Error Actual

```
Error: @supabase/ssr: Your project's URL and API key are required to create a Supabase client!
```

**Causa:** Las variables de entorno de Supabase NO están configuradas en Vercel.

---

## ✅ SOLUCIÓN: Configurar Variables de Entorno

### **Paso 1: Ir a Configuración de Variables**

1. Ve a tu proyecto en Vercel: https://vercel.com/dashboard
2. Selecciona tu proyecto `pmsalquileres`
3. Click en **Settings** (en el menú superior)
4. Click en **Environment Variables** (en el menú lateral izquierdo)

### **Paso 2: Obtener las Credenciales de Supabase**

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a **Settings** → **API**
4. Copia los siguientes valores:
   - **Project URL** (ejemplo: `https://pxuzmsugwfbppmedkkxp.supabase.co`)
   - **anon public key** (una clave larga que empieza con `eyJ...`)
   - **service_role key** (otra clave larga que empieza con `eyJ...`)

### **Paso 3: Agregar Variables en Vercel**

Agrega **CADA UNA** de estas 3 variables:

#### **Variable 1: NEXT_PUBLIC_SUPABASE_URL**
- **Key:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** Tu Project URL de Supabase (ejemplo: `https://pxuzmsugwfbppmedkkxp.supabase.co`)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- Click **Save**

#### **Variable 2: NEXT_PUBLIC_SUPABASE_ANON_KEY**
- **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** Tu anon public key de Supabase (empieza con `eyJ...`)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- Click **Save**

#### **Variable 3: SUPABASE_SERVICE_ROLE_KEY**
- **Key:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** Tu service_role key de Supabase (empieza con `eyJ...`)
- **Environments:** ✅ Production, ✅ Preview, ✅ Development
- Click **Save**

### **Paso 4: Redeploy el Proyecto**

1. Ve a **Deployments** (en el menú superior de tu proyecto en Vercel)
2. Encuentra el último deployment que falló
3. Click en el menú de 3 puntos (**...**) a la derecha
4. Click en **Redeploy**
5. Click en **Redeploy** nuevamente para confirmar

---

## 🔍 Verificación

Después del redeploy, el build debería completarse exitosamente. Verás:

```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

---

## 🚨 Errores Comunes

### **Error: "Still failing after adding variables"**
- ✅ Verifica que los nombres de las variables sean EXACTOS (case-sensitive)
- ✅ Asegúrate de haber seleccionado **Production** al agregar las variables
- ✅ Verifica que no haya espacios antes/después de los valores

### **Error: "pnpm is being used instead of npm"**
- ✅ Asegúrate de que `pnpm-lock.yaml` NO exista en el repositorio
- ✅ Solo debe existir `package-lock.json`
- ✅ El archivo `vercel.json` debe tener `"installCommand": "npm ci --legacy-peer-deps"`

### **Error: "Invalid Supabase credentials"**
- ✅ Verifica que copiaste las claves completas (sin recortar)
- ✅ Verifica que copiaste desde el proyecto correcto en Supabase
- ✅ Las claves `anon` y `service_role` son DIFERENTES

---

## 📸 Screenshot de Referencia

Tu configuración de Environment Variables en Vercel debería verse así:

```
NEXT_PUBLIC_SUPABASE_URL          Production, Preview, Development
NEXT_PUBLIC_SUPABASE_ANON_KEY     Production, Preview, Development
SUPABASE_SERVICE_ROLE_KEY         Production, Preview, Development
```

---

## 💡 Notas Importantes

- ⚠️ Las variables con prefijo `NEXT_PUBLIC_` son visibles en el navegador
- 🔒 La variable `SUPABASE_SERVICE_ROLE_KEY` es privada y solo se usa en el servidor
- 🔄 Cualquier cambio en variables de entorno requiere un **redeploy**
- 📝 Estas variables son necesarias tanto en **build time** como en **runtime**

---

**Una vez configuradas las variables, el deployment debería funcionar correctamente.** ✅

