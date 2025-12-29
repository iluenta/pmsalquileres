-- Script para actualizar la tabla sales_channels
-- Reemplaza applicable_taxes (TEXT) por apply_tax (BOOLEAN) y tax_type_id (UUID)
-- Ejecutar después de 029_create_tax_type_config.sql

-- Añadir nuevas columnas
ALTER TABLE public.sales_channels
  ADD COLUMN IF NOT EXISTS apply_tax BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS tax_type_id UUID REFERENCES public.configuration_values(id) ON DELETE SET NULL;

-- Migrar datos existentes si applicable_taxes tiene contenido
-- (Opcional: si hay datos en applicable_taxes, podrías querer migrarlos)
-- Por ahora, simplemente establecemos apply_tax = false para registros existentes

-- Eliminar la columna antigua (descomentar cuando estés seguro de que no necesitas los datos)
-- ALTER TABLE public.sales_channels DROP COLUMN IF EXISTS applicable_taxes;

-- Crear índice para tax_type_id
CREATE INDEX IF NOT EXISTS idx_sales_channels_tax_type ON public.sales_channels(tax_type_id);

-- Comentarios
COMMENT ON COLUMN public.sales_channels.apply_tax IS 'Indica si se aplica IVA sobre las comisiones';
COMMENT ON COLUMN public.sales_channels.tax_type_id IS 'Referencia al tipo de impuesto (configuration_value) que se aplica';

