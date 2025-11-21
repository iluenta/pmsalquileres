-- =====================================================
-- CORRECCIÓN SIMPLE: Función user_tenant_id con search_path fijo
-- =====================================================
-- Este script corrige el warning de Supabase SIN eliminar las políticas RLS

-- SOLUCIÓN: Usar CREATE OR REPLACE para actualizar la función existente
-- Esto mantiene todas las políticas RLS que dependen de la función

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

-- Otorgar permisos necesarios (por si acaso)
GRANT EXECUTE ON FUNCTION public.user_tenant_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_tenant_id() TO anon;

-- Comentario explicativo
COMMENT ON FUNCTION public.user_tenant_id() IS 
'Función segura para obtener el tenant_id del usuario autenticado. 
Tiene search_path fijo para evitar vulnerabilidades de seguridad.
Actualizada para corregir warning de Supabase.';

-- =====================================================
-- VERIFICACIÓN
-- =====================================================
-- Para verificar que la función funciona correctamente:
-- SELECT public.user_tenant_id();

-- Para verificar el search_path de la función:
-- SELECT proname, prosrc FROM pg_proc WHERE proname = 'user_tenant_id';
