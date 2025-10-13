-- =====================================================
-- MIGRACIÓN: Agregar columna is_admin a la tabla users
-- =====================================================

-- Agregar columna is_admin a la tabla users
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Agregar columna password_change_required (útil para gestión de usuarios)
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS password_change_required BOOLEAN DEFAULT false;

-- Crear índice para búsquedas de admins
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON public.users(is_admin);

-- Comentarios para documentar las columnas
COMMENT ON COLUMN public.users.is_admin IS 'Indica si el usuario tiene permisos de administrador en su tenant';
COMMENT ON COLUMN public.users.password_change_required IS 'Indica si el usuario debe cambiar su contraseña en el próximo login';

-- =====================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✓ Columnas de roles agregadas a la tabla users';
    RAISE NOTICE '✓ Ahora puedes crear usuarios con rol de administrador';
END $$;

