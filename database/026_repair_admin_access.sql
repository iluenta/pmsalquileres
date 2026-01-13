-- SCRIPT DE REPARACIÓN DE PERMISOS
-- Ejecutar este script si no ves todas las opciones del menú lateral

DO $$
DECLARE
    role_admin_id UUID;
    user_record RECORD;
BEGIN
    -- 1. Asegurar que el rol admin existe
    SELECT id INTO role_admin_id FROM public.roles WHERE code = 'admin' AND tenant_id IS NULL;
    
    IF role_admin_id IS NULL THEN
        INSERT INTO public.roles (code, name, is_system_role, description)
        VALUES ('admin', 'Administrador', true, 'Control total sobre el tenant')
        RETURNING id INTO role_admin_id;
    END IF;

    -- 2. Asegurar que todos los permisos están creados y asignados al rol admin
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
    ('config.manage', 'admin', 'Gestionar configuración del tenant'),
    ('rbac.manage', 'admin', 'Gestionar roles y permisos dinámicos')
    ON CONFLICT (code) DO NOTHING;

    INSERT INTO public.role_permissions (role_id, permission_id)
    SELECT role_admin_id, id FROM public.permissions
    ON CONFLICT DO NOTHING;

    -- 3. Promover a Administradores y asignar rol Admin a los usuarios "dueños" (los que tienen is_admin=true o los que no tienen rol)
    -- Esto arreglará el acceso para Pedro Ramirez Suarez
    FOR user_record IN SELECT id, email FROM public.users WHERE is_admin = true OR NOT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = public.users.id) LOOP
        -- Asegurar flag is_admin en la tabla users
        UPDATE public.users SET is_admin = true WHERE id = user_record.id;
        
        -- Asignar el rol admin de sistema
        INSERT INTO public.user_roles (user_id, role_id)
        VALUES (user_record.id, role_admin_id)
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Usuario % reparado como Administrador', user_record.email;
    END LOOP;

END $$;
