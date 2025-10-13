# Configuración de Base de Datos - PMS Alquileres Vacacionales

## Scripts SQL

Los scripts SQL deben ejecutarse en el siguiente orden:

1. **001_create_properties_tables.sql** - Crea las tablas principales del PMS:
   - `properties` - Propiedades vacacionales
   - `property_amenities` - Servicios y amenidades
   - `property_images` - Imágenes de propiedades
   - `bookings` - Reservas
   - `payments` - Pagos

2. **002_enable_rls_policies.sql** - Habilita Row Level Security (RLS):
   - Políticas de seguridad multitenant
   - Cada usuario solo puede ver/modificar datos de su tenant
   - Protección automática a nivel de base de datos

3. **003_seed_configuration_data.sql** - Datos iniciales:
   - Tenant de demostración
   - Tipos de configuración (propiedades, reservas, pagos, etc.)
   - Valores de configuración predefinidos

4. **004_create_auth_functions.sql** - Funciones auxiliares:
   - `create_user_with_tenant()` - Crear usuarios con tenant
   - `get_user_info()` - Obtener información completa del usuario

5. **005_add_user_roles.sql** - Agregar columnas de roles:
   - `is_admin` - Indica si el usuario es administrador
   - `password_change_required` - Gestión de cambio de contraseña
   - **IMPORTANTE**: Este script debe ejecutarse antes de crear el primer usuario

## Arquitectura Multitenant

El sistema utiliza una arquitectura multitenant donde:

- Cada registro tiene un `tenant_id` que lo asocia a una organización
- Las políticas RLS filtran automáticamente los datos por tenant
- Los usuarios solo pueden acceder a datos de su propio tenant
- La función `auth.user_tenant_id()` obtiene el tenant del usuario actual

## Seguridad

- **Row Level Security (RLS)** habilitado en todas las tablas
- Políticas que verifican el tenant_id en cada operación
- Función `auth.uid()` para identificar al usuario autenticado
- Separación completa de datos entre tenants

## Variables de Entorno

Copia `.env.local.example` a `.env.local` y configura las variables con los valores de tu proyecto Supabase.

## Ejecución de Scripts

Los scripts se pueden ejecutar desde v0 directamente o desde el SQL Editor de Supabase.
