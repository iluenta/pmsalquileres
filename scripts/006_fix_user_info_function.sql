-- =====================================================
-- ARREGLAR FUNCIÓN get_user_info
-- =====================================================
-- La función actual falla porque intenta hacer JOIN con user_settings
-- que no existe en nuestro esquema actual.

-- Eliminar la función anterior
DROP FUNCTION IF EXISTS public.get_user_info(UUID);

-- Crear función simplificada que funcione con nuestro esquema actual
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
  date_format TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    u.full_name,
    u.tenant_id,
    t.name,
    t.slug,
    u.is_admin,
    u.theme_color,
    u.language,        -- Usar valores de la tabla users directamente
    u.timezone,        -- Usar valores de la tabla users directamente  
    u.date_format      -- Usar valores de la tabla users directamente
  FROM public.users u
  INNER JOIN public.tenants t ON u.tenant_id = t.id
  WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✓ Función get_user_info corregida';
    RAISE NOTICE '✓ Ahora funciona sin dependencias de user_settings';
END $$;
