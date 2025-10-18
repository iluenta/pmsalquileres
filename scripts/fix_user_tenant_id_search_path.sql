-- =====================================================
-- CORRECCIÓN: Función user_tenant_id con search_path mutable
-- =====================================================
-- Este script corrige el warning de Supabase sobre la función
-- public.user_tenant_id que tiene un search_path mutable

-- PASO 1: Verificar si la función existe y obtener su definición
-- (Ejecutar en Supabase SQL Editor para ver la función actual)

-- PASO 2: Actualizar la función existente (no eliminar para mantener dependencias)
-- NOTA: Usamos CREATE OR REPLACE en lugar de DROP para mantener las políticas RLS

-- PASO 3: Crear la función con search_path fijo y seguro
CREATE OR REPLACE FUNCTION public.user_tenant_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_tenant_id UUID;
BEGIN
  -- Obtener el tenant_id del usuario autenticado
  SELECT u.tenant_id INTO user_tenant_id
  FROM public.users u
  WHERE u.id = auth.uid();
  
  -- Retornar el tenant_id o NULL si no se encuentra
  RETURN user_tenant_id;
END;
$$;

-- PASO 4: Otorgar permisos necesarios
GRANT EXECUTE ON FUNCTION public.user_tenant_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_tenant_id() TO anon;

-- PASO 5: Comentario explicativo
COMMENT ON FUNCTION public.user_tenant_id() IS 
'Función segura para obtener el tenant_id del usuario autenticado. 
Tiene search_path fijo para evitar vulnerabilidades de seguridad.';

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Para verificar que la función funciona correctamente, ejecutar:
-- SELECT public.user_tenant_id();

-- Para verificar el search_path de la función:
-- SELECT proname, prosrc FROM pg_proc WHERE proname = 'user_tenant_id';
