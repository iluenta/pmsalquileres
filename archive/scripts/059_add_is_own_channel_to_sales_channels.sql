-- Script para añadir el campo is_own_channel a la tabla sales_channels
-- Este campo identifica el canal de venta que debe usarse para reservas creadas desde la landing pública

-- Añadir el campo is_own_channel
ALTER TABLE public.sales_channels
  ADD COLUMN IF NOT EXISTS is_own_channel BOOLEAN NOT NULL DEFAULT false;

-- Crear índice para búsquedas rápidas del canal propio
CREATE INDEX IF NOT EXISTS idx_sales_channels_own_channel 
ON public.sales_channels(tenant_id, is_own_channel) 
WHERE is_own_channel = true;

-- Constraint: Solo puede haber un canal propio por tenant
CREATE UNIQUE INDEX IF NOT EXISTS idx_sales_channels_unique_own_channel_per_tenant
ON public.sales_channels(tenant_id)
WHERE is_own_channel = true;

-- Comentario para documentación
COMMENT ON COLUMN public.sales_channels.is_own_channel IS 
  'Indica si este es el canal propio que debe usarse para reservas creadas desde la landing pública. Solo puede haber un canal propio por tenant.';

