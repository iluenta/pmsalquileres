-- Script para crear la tabla property_pricing_plans
-- Permite gestionar planes de precios múltiples por temporada (alta/baja)
-- Soporta planes: noche, semana (con descuento), quincena (con descuento)

CREATE TABLE IF NOT EXISTS public.property_pricing_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('night', 'week', 'fortnight')), -- Tipo de plan
  season VARCHAR(10) NOT NULL CHECK (season IN ('high', 'low', 'all')), -- Temporada: alta, baja, o todo el año
  base_price DECIMAL(10, 2) NOT NULL CHECK (base_price >= 0), -- Precio base del plan
  discount_percentage DECIMAL(5, 2) NOT NULL DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100), -- Descuento 0-100 (solo week/fortnight)
  final_price DECIMAL(10, 2) NOT NULL CHECK (final_price >= 0), -- Precio final calculado: base_price * (1 - discount_percentage/100)
  description TEXT, -- Descripción del plan
  features TEXT[] DEFAULT '{}', -- Array de características incluidas
  is_active BOOLEAN NOT NULL DEFAULT TRUE, -- Si el plan está activo
  sort_order INTEGER NOT NULL DEFAULT 0, -- Orden de visualización
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_property_pricing_plans_property_id ON public.property_pricing_plans(property_id);
CREATE INDEX IF NOT EXISTS idx_property_pricing_plans_tenant_id ON public.property_pricing_plans(tenant_id);
CREATE INDEX IF NOT EXISTS idx_property_pricing_plans_plan_type ON public.property_pricing_plans(plan_type);
CREATE INDEX IF NOT EXISTS idx_property_pricing_plans_season ON public.property_pricing_plans(season);
CREATE INDEX IF NOT EXISTS idx_property_pricing_plans_is_active ON public.property_pricing_plans(property_id, is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_property_pricing_plans_sort_order ON public.property_pricing_plans(property_id, sort_order);

-- Trigger para calcular final_price automáticamente
CREATE OR REPLACE FUNCTION calculate_pricing_plan_final_price()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular precio final: base_price * (1 - discount_percentage/100)
  NEW.final_price = NEW.base_price * (1 - NEW.discount_percentage / 100);
  
  -- Validar que discount_percentage solo se use en week/fortnight
  IF NEW.plan_type = 'night' AND NEW.discount_percentage > 0 THEN
    RAISE EXCEPTION 'El plan tipo "night" no puede tener descuento';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_pricing_plan_final_price
  BEFORE INSERT OR UPDATE ON public.property_pricing_plans
  FOR EACH ROW
  EXECUTE FUNCTION calculate_pricing_plan_final_price();

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_property_pricing_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_property_pricing_plans_updated_at
  BEFORE UPDATE ON public.property_pricing_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_property_pricing_plans_updated_at();

-- RLS Policies
ALTER TABLE public.property_pricing_plans ENABLE ROW LEVEL SECURITY;

-- Policy: Lectura pública de planes activos
CREATE POLICY "Public can view active pricing plans"
  ON public.property_pricing_plans
  FOR SELECT
  USING (is_active = TRUE);

-- Policy: Usuarios autenticados del tenant pueden gestionar planes
CREATE POLICY "Tenant users can manage pricing plans"
  ON public.property_pricing_plans
  FOR ALL
  USING (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  )
  WITH CHECK (
    tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  );

-- Comentarios para documentación
COMMENT ON TABLE public.property_pricing_plans IS 'Planes de precios múltiples por temporada para propiedades. Soporta planes de noche, semana y quincena con descuentos configurables.';
COMMENT ON COLUMN public.property_pricing_plans.plan_type IS 'Tipo de plan: night (noche), week (semana), fortnight (quincena)';
COMMENT ON COLUMN public.property_pricing_plans.season IS 'Temporada: high (alta), low (baja), all (todo el año)';
COMMENT ON COLUMN public.property_pricing_plans.base_price IS 'Precio base del plan antes de descuentos';
COMMENT ON COLUMN public.property_pricing_plans.discount_percentage IS 'Porcentaje de descuento (0-100). Solo aplica a planes week y fortnight.';
COMMENT ON COLUMN public.property_pricing_plans.final_price IS 'Precio final calculado automáticamente: base_price * (1 - discount_percentage/100)';
COMMENT ON COLUMN public.property_pricing_plans.features IS 'Array de características incluidas en el plan (ej: ["WiFi incluido", "Cocina equipada"])';

