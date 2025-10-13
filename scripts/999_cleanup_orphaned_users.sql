-- =====================================================
-- SCRIPT DE LIMPIEZA: Eliminar usuarios huérfanos o duplicados
-- =====================================================
-- ADVERTENCIA: Este script eliminará datos. Úsalo con precaución.
-- Solo ejecuta este script si tienes problemas con usuarios duplicados.
-- =====================================================

-- 1. Ver usuarios huérfanos (están en auth pero no en public.users)
DO $$
DECLARE
    auth_user_count INTEGER;
    public_user_count INTEGER;
BEGIN
    -- Nota: No podemos consultar auth.users directamente desde SQL
    -- Este query solo funciona para la tabla public.users
    
    SELECT COUNT(*) INTO public_user_count FROM public.users;
    
    RAISE NOTICE '═══════════════════════════════════════════════';
    RAISE NOTICE 'REPORTE DE USUARIOS';
    RAISE NOTICE '═══════════════════════════════════════════════';
    RAISE NOTICE 'Usuarios en public.users: %', public_user_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Para ver usuarios en auth.users, ve a:';
    RAISE NOTICE 'Supabase Dashboard → Authentication → Users';
    RAISE NOTICE '═══════════════════════════════════════════════';
END $$;

-- =====================================================
-- OPCIÓN 1: Ver todos los usuarios en public.users
-- =====================================================
SELECT 
    u.id,
    u.email,
    u.full_name,
    t.name as tenant_name,
    u.is_admin,
    u.is_active,
    u.created_at
FROM public.users u
LEFT JOIN public.tenants t ON u.tenant_id = t.id
ORDER BY u.created_at DESC;

-- =====================================================
-- OPCIÓN 2: Ver tenants creados
-- =====================================================
SELECT 
    id,
    name,
    slug,
    is_active,
    created_at,
    (SELECT COUNT(*) FROM public.users WHERE tenant_id = tenants.id) as user_count
FROM public.tenants
ORDER BY created_at DESC;

-- =====================================================
-- OPCIÓN 3: Eliminar TODOS los usuarios y tenants
-- =====================================================
-- ⚠️ DESCOMENTA SOLO SI QUIERES EMPEZAR DE CERO
-- ⚠️ Esto NO eliminará usuarios de auth.users
-- ⚠️ Tendrás que eliminarlos manualmente desde el Dashboard

-- DELETE FROM public.users;
-- DELETE FROM public.tenants;

-- RAISE NOTICE '✓ Usuarios y tenants eliminados de public schema';
-- RAISE NOTICE '⚠️ IMPORTANTE: Debes eliminar usuarios de Auth manualmente:';
-- RAISE NOTICE '   1. Ve a Supabase Dashboard → Authentication → Users';
-- RAISE NOTICE '   2. Elimina cada usuario manualmente';
-- RAISE NOTICE '   O ejecuta este comando con el Admin API de Supabase';

-- =====================================================
-- OPCIÓN 4: Eliminar un tenant específico y sus usuarios
-- =====================================================
-- Reemplaza 'TENANT_ID_AQUI' con el ID del tenant que quieres eliminar
-- DELETE FROM public.users WHERE tenant_id = 'TENANT_ID_AQUI';
-- DELETE FROM public.tenants WHERE id = 'TENANT_ID_AQUI';

-- =====================================================
-- DESPUÉS DE LIMPIAR
-- =====================================================
-- Para eliminar usuarios de Supabase Auth:
-- 1. Ve a: https://supabase.com/dashboard/project/YOUR_PROJECT/auth/users
-- 2. Haz clic en cada usuario y selecciona "Delete user"
-- 3. O usa el Admin API desde tu código para eliminarlos programáticamente

