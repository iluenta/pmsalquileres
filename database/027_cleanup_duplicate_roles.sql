-- SCRIPT DE LIMPIEZA DE ROLES DUPLICADOS
-- Este script elimina los duplicados visibles en la pantalla de Roles y Permisos

DO $$
DECLARE
    role_record RECORD;
    primary_role_id UUID;
BEGIN
    -- 1. Eliminar la restricción antigua que falló con los NULLs
    ALTER TABLE public.roles DROP CONSTRAINT IF EXISTS roles_code_tenant_unique;

    -- 2. Limpiar duplicados de roles de sistema (los que tienen tenant_id IS NULL)
    FOR role_record IN SELECT code, count(*) FROM public.roles WHERE tenant_id IS NULL GROUP BY code HAVING count(*) > 1 LOOP
        -- Identificar el ID que nos quedaremos (el más antiguo)
        SELECT id INTO primary_role_id FROM public.roles WHERE code = role_record.code AND tenant_id IS NULL ORDER BY created_at ASC LIMIT 1;
        
        -- Mover asignaciones de usuarios de los duplicados al principal
        UPDATE public.user_roles 
        SET role_id = primary_role_id 
        WHERE role_id IN (SELECT id FROM public.roles WHERE code = role_record.code AND tenant_id IS NULL AND id <> primary_role_id)
        ON CONFLICT DO NOTHING;

        -- Mover permisos de los duplicados al principal
        UPDATE public.role_permissions 
        SET role_id = primary_role_id 
        WHERE role_id IN (SELECT id FROM public.roles WHERE code = role_record.code AND tenant_id IS NULL AND id <> primary_role_id)
        ON CONFLICT DO NOTHING;

        -- Eliminar los duplicados sobrantes
        DELETE FROM public.roles WHERE code = role_record.code AND tenant_id IS NULL AND id <> primary_role_id;
        
        RAISE NOTICE 'Rol global % limpiado', role_record.code;
    END LOOP;

    -- 3. Crear un índice UNICO parcial para evitar que esto vuelva a pasar con NULLs
    -- En versiones antiguas de PG, un UNIQUE index sobre (code, tenant_id) permite múltiples NULLs.
    -- Este índice asegura la unicidad estricta para roles globales.
    CREATE UNIQUE INDEX IF NOT EXISTS roles_global_code_unique ON public.roles (code) WHERE tenant_id IS NULL;
    
    -- 4. Re-añadir la restricción para roles de tenant (donde tenant_id no es null)
    CREATE UNIQUE INDEX IF NOT EXISTS roles_tenant_code_unique ON public.roles (code, tenant_id) WHERE tenant_id IS NOT NULL;

END $$;
