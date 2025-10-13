-- =====================================================
-- CORREGIR TIPOS DE DATOS EN LA FUNCIÓN get_user_info
-- =====================================================
-- El error indica que los tipos de datos no coinciden
-- Necesitamos usar CAST para convertir VARCHAR a TEXT

-- Eliminar la función anterior
DROP FUNCTION IF EXISTS public.get_user_info(UUID);

-- Crear función con tipos de datos correctos
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
    u.email::TEXT,           -- Convertir VARCHAR a TEXT
    u.full_name::TEXT,       -- Convertir VARCHAR a TEXT
    u.tenant_id,
    t.name::TEXT,            -- Convertir VARCHAR a TEXT
    t.slug::TEXT,            -- Convertir VARCHAR a TEXT
    u.is_admin,
    u.theme_color::TEXT,     -- Convertir VARCHAR a TEXT
    u.language::TEXT,        -- Convertir VARCHAR a TEXT
    u.timezone::TEXT,        -- Convertir VARCHAR a TEXT
    u.date_format::TEXT      -- Convertir VARCHAR a TEXT
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
    RAISE NOTICE '✓ Función get_user_info corregida con tipos de datos';
    RAISE NOTICE '✓ Ahora convierte VARCHAR a TEXT correctamente';
END $$;
