-- Script para crear la tabla property_reviews
-- Permite gestionar reseñas de clientes vinculadas a propiedades
-- Soporta reseñas manuales, de bookings, o de sistemas externos

CREATE TABLE IF NOT EXISTS public.property_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  guest_name TEXT NOT NULL, -- Nombre del huésped (para reseñas manuales)
  person_id UUID REFERENCES public.persons(id) ON DELETE SET NULL, -- Si está vinculado a huésped del sistema
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL, -- Si está vinculado a reserva real
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL, -- Texto de la reseña
  review_date DATE NOT NULL, -- Fecha de la reseña (puede ser diferente a created_at)
  is_approved BOOLEAN NOT NULL DEFAULT FALSE, -- Para moderación
  source VARCHAR(20) NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'external', 'booking')), -- Origen de la reseña
  external_id TEXT, -- ID de sistema externo (futuro)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_property_reviews_property_id ON public.property_reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_property_reviews_tenant_id ON public.property_reviews(tenant_id);
CREATE INDEX IF NOT EXISTS idx_property_reviews_booking_id ON public.property_reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_property_reviews_is_approved ON public.property_reviews(is_approved) WHERE is_approved = TRUE;
CREATE INDEX IF NOT EXISTS idx_property_reviews_review_date ON public.property_reviews(review_date DESC);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_property_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_property_reviews_updated_at
  BEFORE UPDATE ON public.property_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_property_reviews_updated_at();

-- RLS Policies
ALTER TABLE public.property_reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Lectura pública solo de reseñas aprobadas
CREATE POLICY "Public can view approved reviews"
  ON public.property_reviews
  FOR SELECT
  USING (is_approved = TRUE);

-- Policy: Usuarios autenticados del tenant pueden ver todas las reseñas de sus propiedades
CREATE POLICY "Tenant users can view all reviews"
  ON public.property_reviews
  FOR SELECT
  USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

-- Policy: Usuarios autenticados del tenant pueden insertar reseñas
CREATE POLICY "Tenant users can insert reviews"
  ON public.property_reviews
  FOR INSERT
  WITH CHECK (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

-- Policy: Usuarios autenticados del tenant pueden actualizar reseñas
CREATE POLICY "Tenant users can update reviews"
  ON public.property_reviews
  FOR UPDATE
  USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

-- Policy: Usuarios autenticados del tenant pueden eliminar reseñas
CREATE POLICY "Tenant users can delete reviews"
  ON public.property_reviews
  FOR DELETE
  USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

-- Comentarios para documentación
COMMENT ON TABLE public.property_reviews IS 'Reseñas de clientes sobre propiedades. Soporta reseñas manuales, vinculadas a bookings, o de sistemas externos.';
COMMENT ON COLUMN public.property_reviews.guest_name IS 'Nombre del huésped (para reseñas manuales o externas)';
COMMENT ON COLUMN public.property_reviews.person_id IS 'ID del huésped en el sistema (opcional, si está vinculado a un person)';
COMMENT ON COLUMN public.property_reviews.booking_id IS 'ID de la reserva (opcional, si la reseña está vinculada a una reserva real)';
COMMENT ON COLUMN public.property_reviews.rating IS 'Calificación de 1 a 5 estrellas';
COMMENT ON COLUMN public.property_reviews.review_date IS 'Fecha de la reseña (puede ser diferente a created_at)';
COMMENT ON COLUMN public.property_reviews.is_approved IS 'Indica si la reseña está aprobada y visible públicamente';
COMMENT ON COLUMN public.property_reviews.source IS 'Origen de la reseña: manual (introducida manualmente), booking (de una reserva), external (de sistema externo)';
COMMENT ON COLUMN public.property_reviews.external_id IS 'ID de la reseña en el sistema externo (para futura integración)';

