-- Script para crear la tabla de reservas bookings
-- Ejecutar en Supabase SQL Editor
-- IMPORTANTE: La tabla persons debe existir antes de ejecutar este script

-- Verificar que la tabla persons existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'persons'
  ) THEN
    RAISE EXCEPTION 'La tabla persons no existe. Debes crearla primero antes de ejecutar este script.';
  END IF;
END $$;

-- Eliminar la tabla bookings si existe para recrearla desde cero
-- Esto asegura que todas las columnas y relaciones estén correctas
DROP TABLE IF EXISTS public.bookings CASCADE;

-- Crear tabla bookings
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  booking_code VARCHAR(50) NOT NULL,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE RESTRICT,
  person_id UUID NOT NULL REFERENCES public.persons(id) ON DELETE RESTRICT,
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  number_of_guests INTEGER NOT NULL DEFAULT 1,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  booking_status_id UUID REFERENCES public.configuration_values(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  CONSTRAINT bookings_check_dates CHECK (check_out_date > check_in_date),
  CONSTRAINT bookings_check_guests CHECK (number_of_guests > 0),
  CONSTRAINT bookings_check_amounts CHECK (paid_amount >= 0 AND total_amount >= 0)
);

-- Crear índice único para booking_code por tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_code_tenant 
ON public.bookings(tenant_id, booking_code);

-- Crear índices para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_bookings_tenant ON public.bookings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bookings_property ON public.bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_person ON public.bookings(person_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(booking_status_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON public.bookings(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_bookings_created_at ON public.bookings(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver bookings de su tenant
CREATE POLICY "Users can view bookings of their tenant"
ON public.bookings
FOR SELECT
USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- Política: Los usuarios solo pueden insertar bookings en su tenant
CREATE POLICY "Users can insert bookings in their tenant"
ON public.bookings
FOR INSERT
WITH CHECK (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- Política: Los usuarios solo pueden actualizar bookings de su tenant
CREATE POLICY "Users can update bookings of their tenant"
ON public.bookings
FOR UPDATE
USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- Política: Los usuarios solo pueden eliminar bookings de su tenant
CREATE POLICY "Users can delete bookings of their tenant"
ON public.bookings
FOR DELETE
USING (tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid()));

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_bookings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_bookings_updated_at ON public.bookings;
CREATE TRIGGER trigger_update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION update_bookings_updated_at();

-- Función para generar booking_code único
CREATE OR REPLACE FUNCTION generate_booking_code(tenant_uuid UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
  new_code VARCHAR(50);
  counter INTEGER := 1;
BEGIN
  LOOP
    -- Formato: BK-YYYYMMDD-XXX (ej: BK-20250120-001)
    new_code := 'BK-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 3, '0');
    
    -- Verificar si el código ya existe para este tenant
    IF NOT EXISTS (
      SELECT 1 FROM public.bookings 
      WHERE tenant_id = tenant_uuid AND booking_code = new_code
    ) THEN
      RETURN new_code;
    END IF;
    
    counter := counter + 1;
    
    -- Prevenir loops infinitos
    IF counter > 999 THEN
      new_code := 'BK-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD((EXTRACT(EPOCH FROM NOW())::BIGINT % 1000)::TEXT, 3, '0');
      RETURN new_code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Comentarios para documentación
COMMENT ON TABLE public.bookings IS 'Tabla de reservas de propiedades vacacionales';
COMMENT ON COLUMN public.bookings.booking_code IS 'Código único de la reserva (ej: BK-20250120-001)';
COMMENT ON COLUMN public.bookings.booking_status_id IS 'Estado de la reserva desde configuration_values';

