# 🏨 PMS Alquileres Vacacionales

Sistema completo de gestión de propiedades de alquiler vacacional construido con Next.js 15, React 19, TypeScript, Tailwind CSS y Supabase.

## 🚀 Características Principales

### 📊 **Dashboard Intuitivo**
- Panel de control con métricas clave
- Gráficos de ocupación y estadísticas
- Vista general de reservas recientes

### 🏠 **Gestión de Propiedades**
- CRUD completo de propiedades
- Sistema de tipos de propiedad configurables
- Gestión de comodidades y detalles
- Precios y políticas de cancelación

### 📅 **Sistema de Reservas**
- Gestión completa de reservas
- Calendario de ocupación
- Estados de reserva configurables
- Historial de cambios

### 👥 **Gestión de Huéspedes**
- Base de datos de huéspedes
- Historial de estancias
- Comunicación integrada

### 💰 **Gestión Financiera**
- Seguimiento de pagos
- Reportes de ingresos
- Gestión de depósitos
- Facturación automática

### ⚙️ **Sistema de Configuración**
- Tipos de configuración personalizables
- Valores con colores e iconos
- Sistema de temas (claro/oscuro)
- Configuración multi-tenant

## 🛠️ Tecnologías Utilizadas

- **Frontend:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS 4, shadcn/ui
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Autenticación:** Supabase Auth con RLS
- **Formularios:** React Hook Form + Zod
- **Estado:** React Context API
- **Iconos:** Lucide React
- **Gráficos:** Recharts

## 📋 Requisitos Previos

- Node.js 18+ 
- npm o pnpm
- Cuenta de Supabase
- Git

## 🔧 Instalación

1. **Clonar el repositorio:**
```bash
git clone https://github.com/iluenta/pmsalquileres.git
cd pmsalquileres
```

2. **Instalar dependencias:**
```bash
npm install
# o
pnpm install
```

3. **Configurar variables de entorno:**
```bash
cp env.example .env.local
```

Editar `.env.local` con tus credenciales de Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
```

4. **Configurar la base de datos:**
Ejecutar los scripts SQL en orden en tu instancia de Supabase:
- `scripts/000_create_base_tables.sql`
- `scripts/001_create_properties_tables.sql`
- `scripts/002_enable_rls_policies.sql`
- `scripts/003_seed_configuration_data.sql`
- `scripts/004_create_auth_functions.sql`
- `scripts/005_add_user_roles.sql`
- `scripts/006_fix_user_info_function.sql`
- `scripts/007_fix_function_data_types.sql`

5. **Iniciar el servidor de desarrollo:**
```bash
npm run dev
# o
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🗄️ Estructura de la Base de Datos

### Tablas Principales
- **tenants** - Organizaciones multi-tenant
- **users** - Usuarios del sistema con roles
- **properties** - Propiedades de alquiler
- **bookings** - Reservas y alquileres
- **guests** - Huéspedes
- **configuration_types** - Tipos de configuración
- **configuration_values** - Valores de configuración

### Características de Seguridad
- Row Level Security (RLS) habilitado
- Autenticación con Supabase Auth
- Políticas de acceso por tenant
- Validación de datos con Zod

## 🎨 Sistema de Temas

- **Tema Claro/Oscuro** automático
- **Paleta de colores** predefinida compatible con ambos temas
- **Sistema de iconos** con categorías organizadas
- **Componentes** adaptativos

## 📱 Responsive Design

- Diseño mobile-first
- Componentes adaptativos
- Navegación optimizada para móviles
- Tablas responsivas

## 🔐 Autenticación y Autorización

- Registro de usuarios con validación
- Login seguro con Supabase Auth
- Roles de usuario (admin/usuario)
- Protección de rutas
- Middleware de autenticación

## 🚀 Deployment

### Vercel (Recomendado)
1. Conectar repositorio con Vercel
2. Configurar variables de entorno
3. Deploy automático

### Otros Proveedores
- Netlify
- Railway
- DigitalOcean App Platform

## 📚 Documentación Adicional

- [Instrucciones de Registro](INSTRUCCIONES_REGISTRO.md)
- [Configuración de Base de Datos](README_DATABASE.md)
- [Scripts SQL](scripts/)

## 🐛 Solución de Problemas

### Errores Comunes
1. **Error de autenticación:** Verificar variables de entorno
2. **Error de base de datos:** Ejecutar scripts SQL en orden
3. **Error de build:** Verificar versiones de Node.js

### Logs de Debug
- Revisar consola del navegador
- Verificar logs de Supabase
- Comprobar variables de entorno

## 🤝 Contribución

1. Fork el proyecto
2. Crear branch para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👨‍💻 Autor

**Pedro Ramirez** - [@iluenta](https://github.com/iluenta)

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/) - Framework de React
- [Supabase](https://supabase.com/) - Backend as a Service
- [Tailwind CSS](https://tailwindcss.com/) - Framework de CSS
- [shadcn/ui](https://ui.shadcn.com/) - Componentes de UI
- [Lucide](https://lucide.dev/) - Iconos

---

⭐ **¡Si te gusta este proyecto, no olvides darle una estrella!**
