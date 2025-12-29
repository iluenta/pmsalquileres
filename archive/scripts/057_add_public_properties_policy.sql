-- Script para agregar política pública de solo lectura para properties
-- Esto permite que los usuarios accedan a las propiedades por slug sin autenticación
-- para las páginas públicas de guías

-- Eliminar la política si ya existe (para poder recrearla)
DROP POLICY IF EXISTS public_read_properties_by_slug ON properties;

-- Política pública para properties (solo lectura por slug)
-- Esta política permite acceso público de solo lectura a propiedades que tienen un slug
-- Útil para las URLs públicas de guías
CREATE POLICY public_read_properties_by_slug ON properties
  FOR SELECT 
  USING (slug IS NOT NULL AND slug != '');

-- Comentario para documentación
COMMENT ON POLICY public_read_properties_by_slug ON properties IS 
  'Permite acceso público de solo lectura a propiedades que tienen un slug. Usado para páginas públicas de guías.';

