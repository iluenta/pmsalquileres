-- =====================================================
-- LIMPIAR TODOS LOS DATOS
-- =====================================================
-- ⚠️ Este script eliminará TODOS los usuarios y tenants
-- ⚠️ incluyendo los datos de demostración
-- =====================================================

-- Eliminar todos los usuarios
DELETE FROM public.users;

-- Eliminar todos los tenants
DELETE FROM public.tenants;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '═══════════════════════════════════════════════';
    RAISE NOTICE '✓ Todos los usuarios han sido eliminados';
    RAISE NOTICE '✓ Todos los tenants han sido eliminados';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  SIGUIENTE PASO IMPORTANTE:';
    RAISE NOTICE '   Elimina los usuarios de Supabase Auth manualmente:';
    RAISE NOTICE '   1. Ve a Supabase Dashboard';
    RAISE NOTICE '   2. Authentication → Users';
    RAISE NOTICE '   3. Elimina TODOS los usuarios';
    RAISE NOTICE '';
    RAISE NOTICE '✓ Después puedes registrar tu primer usuario';
    RAISE NOTICE '═══════════════════════════════════════════════';
END $$;

