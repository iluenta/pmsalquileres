-- Script para crear la tabla de personas (huéspedes y otros tipos)
-- Ejecutar en Supabase SQL Editor
-- IMPORTANTE: Ejecutar antes de scripts/021_create_bookings_table.sql ya que bookings referencia a persons

-- Crear tabla persons si no existe
CREATE TABLE IF NOT EXISTS public.persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  person_category VARCHAR(50) NOT NULL DEFAULT 'guest', -- guest, owner, contact, etc.
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT persons_check_email_format CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Crear índices para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_persons_tenant ON public.persons(tenant_id);
CREATE INDEX IF NOT EXISTS idx_persons_category ON public.persons(person_category);
CREATE INDEX IF NOT EXISTS idx_persons_email ON public.persons(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_persons_name ON public.persons(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_persons_search ON public.persons USING gin(
  to_tsvector('spanish', coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || coalesce(email, '') || ' ' || coalesce(phone, ''))
);

-- Habilitar RLS
ALTER TABLE public.persons ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver persons de su tenant
CREATE POLICY IF NOT EXISTS "Users can view persons of their tenant"
ON public.persons
FOR SELECT
USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- Política: Los usuarios solo pueden insertar persons en su tenant
CREATE POLICY IF NOT EXISTS "Users can insert persons in their tenant"
ON public.persons
FOR INSERT
WITH CHECK (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- Política: Los usuarios solo pueden actualizar persons de su tenant
CREATE POLICY IF NOT EXISTS "Users can update persons of their tenant"
ON public.persons
FOR UPDATE
USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- Política: Los usuarios solo pueden eliminar persons de su tenant
CREATE POLICY IF NOT EXISTS "Users can delete persons of their tenant"
ON public.persons
FOR DELETE
USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_persons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_persons_updated_at ON public.persons;
CREATE TRIGGER trigger_update_persons_updated_at
BEFORE UPDATE ON public.persons
FOR EACH ROW
EXECUTE FUNCTION update_persons_updated_at();

-- Comentarios para documentación
COMMENT ON TABLE public.persons IS 'Tabla de personas (huéspedes, propietarios, contactos, etc.)';
COMMENT ON COLUMN public.persons.person_category IS 'Categoría de la persona: guest (huésped), owner (propietario), contact (contacto), etc.';
COMMENT ON COLUMN public.persons.email IS 'Email de contacto (opcional)';
COMMENT ON COLUMN public.persons.phone IS 'Teléfono de contacto (opcional)';

