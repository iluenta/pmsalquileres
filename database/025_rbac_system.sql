-- 025_rbac_system.sql
-- Implementación de Control de Acceso Basado en Roles (RBAC)

-- 1. Tabla de Permisos (Globales del Sistema)
CREATE TABLE IF NOT EXISTS public.permissions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    code character varying NOT NULL UNIQUE,
    description text,
    module character varying, -- Para agrupación (properties, bookings, finance...)
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT permissions_pkey PRIMARY KEY (id)
);

-- 2. Tabla de Roles
CREATE TABLE IF NOT EXISTS public.roles (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    tenant_id uuid, -- NULL si es un sistema global de rol, UUID si es personalizado por tenant
    code character varying NOT NULL,
    name character varying NOT NULL,
    description text,
    is_system_role boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT roles_pkey PRIMARY KEY (id),
    CONSTRAINT roles_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);

-- Índices únicos parciales para manejar correctamente los roles globales (NULL) y por tenant
CREATE UNIQUE INDEX IF NOT EXISTS roles_global_code_unique ON public.roles (code) WHERE tenant_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS roles_tenant_code_unique ON public.roles (code, tenant_id) WHERE tenant_id IS NOT NULL;

-- 3. Tabla Relacional: Roles - Permisos
CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id uuid NOT NULL,
    permission_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT role_permissions_pkey PRIMARY KEY (role_id, permission_id),
    CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE,
    CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE CASCADE
);

-- 4. Tabla Relacional: Usuarios - Roles
CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id uuid NOT NULL,
    role_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_roles_pkey PRIMARY KEY (user_id, role_id),
    CONSTRAINT user_roles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
    CONSTRAINT user_roles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.roles(id) ON DELETE CASCADE
);

-- 5. Funciones de Ayuda
CREATE OR REPLACE FUNCTION public.check_user_permission(p_permission_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 
        FROM public.user_roles ur
        JOIN public.role_permissions rp ON ur.role_id = rp.role_id
        JOIN public.permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = auth.uid()
        AND p.code = p_permission_code
    );
END;
$$;

-- 6. Seeds Iniciales (Permisos)
INSERT INTO public.permissions (code, module, description) VALUES
('properties.view', 'properties', 'Ver listado y detalles de propiedades'),
('properties.edit', 'properties', 'Crear y editar propiedades'),
('properties.delete', 'properties', 'Eliminar propiedades'),
('bookings.view', 'bookings', 'Ver calendario y listado de reservas'),
('bookings.edit', 'bookings', 'Crear y editar reservas'),
('bookings.delete', 'bookings', 'Eliminar reservas'),
('guides.view', 'guides', 'Ver guías de propiedades'),
('guides.edit', 'guides', 'Editar contenidos de las guías'),
('payments.view', 'finance', 'Ver cobros y pagos'),
('payments.edit', 'finance', 'Registrar y editar pagos'),
('reports.view', 'finance', 'Ver informes financieros'),
('users.manage', 'admin', 'Gestionar usuarios del tenant'),
('config.manage', 'admin', 'Gestionar configuración del tenant')
ON CONFLICT (code) DO NOTHING;

-- 7. Seeds Iniciales (Roles del SaaS)
-- Insertamos roles globales (tenant_id IS NULL)
INSERT INTO public.roles (code, name, is_system_role, description) VALUES
('admin', 'Administrador', true, 'Control total sobre el tenant'),
('host_plus', 'Anfitrión Plus', true, 'Operativa completa y finanzas'),
('host', 'Anfitrión', true, 'Operativa básica de propiedades y reservas')
ON CONFLICT (code, tenant_id) DO NOTHING;

-- 8. Mapeo de Permisos a Roles
DO $$
DECLARE
    role_admin_id UUID;
    role_host_plus_id UUID;
    role_host_id UUID;
BEGIN
    SELECT id INTO role_admin_id FROM public.roles WHERE code = 'admin' AND tenant_id IS NULL;
    SELECT id INTO role_host_plus_id FROM public.roles WHERE code = 'host_plus' AND tenant_id IS NULL;
    SELECT id INTO role_host_id FROM public.roles WHERE code = 'host' AND tenant_id IS NULL;

    -- Admin: Todos los permisos
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT role_admin_id, id FROM public.permissions
    ON CONFLICT DO NOTHING;

    -- Anfitrión Plus: Propiedades, Reservas, Guías, Pagos
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT role_host_plus_id, id FROM public.permissions 
    WHERE code IN ('properties.view', 'properties.edit', 'bookings.view', 'bookings.edit', 'guides.view', 'guides.edit', 'payments.view', 'payments.edit')
    ON CONFLICT DO NOTHING;

    -- Anfitrión: Propiedades, Reservas, Guías
    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT role_host_id, id FROM public.permissions 
    WHERE code IN ('properties.view', 'properties.edit', 'bookings.view', 'bookings.edit', 'guides.view', 'guides.edit')
    ON CONFLICT DO NOTHING;
END $$;

-- 9. Función para obtener información completa del usuario incluyendo RBAC
DROP FUNCTION IF EXISTS public.get_user_info(UUID);
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
    date_format TEXT,
    roles TEXT[],
    permissions TEXT[]
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email::TEXT,
        u.full_name::TEXT,
        u.tenant_id,
        t.name::TEXT,
        t.slug::TEXT,
        u.is_admin,
        u.theme_color::TEXT,
        u.language::TEXT,
        u.timezone::TEXT,
        u.date_format::TEXT,
        COALESCE(ARRAY(
            SELECT r.code::TEXT
            FROM public.user_roles ur 
            JOIN public.roles r ON ur.role_id = r.id 
            WHERE ur.user_id = u.id
        ), '{}'::TEXT[]),
        COALESCE(ARRAY(
            SELECT DISTINCT p.code::TEXT
            FROM public.user_roles ur 
            JOIN public.role_permissions rp ON ur.role_id = rp.role_id 
            JOIN public.permissions p ON rp.permission_id = p.id 
            WHERE ur.user_id = u.id
        ), '{}'::TEXT[])
    FROM public.users u
    JOIN public.tenants t ON u.tenant_id = t.id
    WHERE u.id = p_user_id;
END;
$$;

-- 10. Habilitar RLS y Políticas Básicas para RBAC
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Permisos: Lectura pública (autenticados), escritura Admin SaaS (por ahora manual)
DROP POLICY IF EXISTS "Lectura para todos los autenticados" ON public.permissions;
CREATE POLICY "Lectura para todos los autenticados" ON public.permissions FOR SELECT USING (auth.role() = 'authenticated');

-- Roles: Aislamiento por Tenant o Global
DROP POLICY IF EXISTS "Lectura de roles del tenant o globales" ON public.roles;
CREATE POLICY "Lectura de roles del tenant o globales" ON public.roles FOR SELECT USING (tenant_id IS NULL OR tenant_id = public.user_tenant_id());

-- Role Permissions: Lectura si el rol es accesible
DROP POLICY IF EXISTS "Lectura de mapeos rol-permiso" ON public.role_permissions;
CREATE POLICY "Lectura de mapeos rol-permiso" ON public.role_permissions FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.roles r WHERE r.id = role_id AND (r.tenant_id IS NULL OR r.tenant_id = public.user_tenant_id()))
);

-- User Roles: Lectura de los propios roles o del mismo tenant
DROP POLICY IF EXISTS "Lectura de asignaciones de roles" ON public.user_roles;
CREATE POLICY "Lectura de asignaciones de roles" ON public.user_roles FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users u WHERE u.id = user_id AND u.tenant_id = public.user_tenant_id())
);
