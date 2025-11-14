-- Script para crear la tabla de items de gastos (movement_expense_items)
-- Permite asociar múltiples servicios a un movimiento de gasto
-- Ejecutar después de 051_create_movements_table.sql

-- Verificar que la tabla movements existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'movements'
  ) THEN
    RAISE EXCEPTION 'La tabla movements no existe. Debes crearla primero.';
  END IF;
END $$;

-- Crear tabla movement_expense_items
CREATE TABLE IF NOT EXISTS public.movement_expense_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movement_id UUID NOT NULL REFERENCES public.movements(id) ON DELETE CASCADE,
  service_provider_service_id UUID REFERENCES public.service_provider_services(id) ON DELETE SET NULL,
  service_name VARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  tax_type_id UUID REFERENCES public.configuration_values(id) ON DELETE SET NULL,
  tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT movement_expense_items_amount_positive CHECK (amount >= 0),
  CONSTRAINT movement_expense_items_tax_amount_positive CHECK (tax_amount >= 0),
  CONSTRAINT movement_expense_items_total_amount_positive CHECK (total_amount >= 0)
);

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_movement_expense_items_movement_id 
ON public.movement_expense_items(movement_id);

CREATE INDEX IF NOT EXISTS idx_movement_expense_items_service_provider_service_id 
ON public.movement_expense_items(service_provider_service_id) 
WHERE service_provider_service_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_movement_expense_items_tax_type_id 
ON public.movement_expense_items(tax_type_id) 
WHERE tax_type_id IS NOT NULL;

-- Trigger para actualizar updated_at
CREATE TRIGGER update_movement_expense_items_updated_at
BEFORE UPDATE ON public.movement_expense_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Habilitar RLS
ALTER TABLE public.movement_expense_items ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver items de movimientos de su tenant
CREATE POLICY "Users can view movement expense items of their tenant"
ON public.movement_expense_items
FOR SELECT
USING (
  movement_id IN (
    SELECT id FROM public.movements 
    WHERE tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  )
);

-- Política: Los usuarios solo pueden insertar items en movimientos de su tenant
CREATE POLICY "Users can insert movement expense items in their tenant"
ON public.movement_expense_items
FOR INSERT
WITH CHECK (
  movement_id IN (
    SELECT id FROM public.movements 
    WHERE tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  )
);

-- Política: Los usuarios solo pueden actualizar items de movimientos de su tenant
CREATE POLICY "Users can update movement expense items of their tenant"
ON public.movement_expense_items
FOR UPDATE
USING (
  movement_id IN (
    SELECT id FROM public.movements 
    WHERE tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  )
);

-- Política: Los usuarios solo pueden eliminar items de movimientos de su tenant
CREATE POLICY "Users can delete movement expense items of their tenant"
ON public.movement_expense_items
FOR DELETE
USING (
  movement_id IN (
    SELECT id FROM public.movements 
    WHERE tenant_id = (SELECT tenant_id FROM public.users WHERE id = auth.uid())
  )
);

-- Comentarios
COMMENT ON TABLE public.movement_expense_items IS 'Items de servicios asociados a movimientos de gasto. Permite múltiples servicios por movimiento.';
COMMENT ON COLUMN public.movement_expense_items.movement_id IS 'Referencia al movimiento de gasto';
COMMENT ON COLUMN public.movement_expense_items.service_provider_service_id IS 'Referencia al servicio configurado del proveedor (opcional, para servicios ad-hoc)';
COMMENT ON COLUMN public.movement_expense_items.service_name IS 'Nombre del servicio (editable, puede diferir del nombre configurado)';
COMMENT ON COLUMN public.movement_expense_items.amount IS 'Importe base del servicio (sin impuestos)';
COMMENT ON COLUMN public.movement_expense_items.tax_type_id IS 'Tipo de impuesto aplicado (opcional)';
COMMENT ON COLUMN public.movement_expense_items.tax_amount IS 'Importe del impuesto calculado';
COMMENT ON COLUMN public.movement_expense_items.total_amount IS 'Total del servicio (amount + tax_amount, modificable para ajustes)';
COMMENT ON COLUMN public.movement_expense_items.notes IS 'Notas adicionales sobre el servicio';

