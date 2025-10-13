-- Función para crear un nuevo usuario con tenant
CREATE OR REPLACE FUNCTION public.create_user_with_tenant(
  p_email TEXT,
  p_password TEXT,
  p_full_name TEXT,
  p_tenant_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Crear usuario en auth.users (Supabase Auth)
  v_user_id := gen_random_uuid();
  
  -- Insertar en la tabla users
  INSERT INTO public.users (
    id,
    email,
    full_name,
    tenant_id,
    is_admin,
    password_change_required,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    p_email,
    p_full_name,
    p_tenant_id,
    false,
    false,
    NOW(),
    NOW()
  );
  
  -- Crear configuración por defecto del usuario
  INSERT INTO public.user_settings (
    user_id,
    language,
    timezone,
    date_format,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    'es',
    'Europe/Madrid',
    'DD/MM/YYYY',
    NOW(),
    NOW()
  );
  
  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener información completa del usuario
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
    us.language,
    us.timezone,
    us.date_format
  FROM public.users u
  INNER JOIN public.tenants t ON u.tenant_id = t.id
  LEFT JOIN public.user_settings us ON u.id = us.user_id
  WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
