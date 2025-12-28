-- Script para agregar campo shopping_type a la tabla guide_places
-- Este campo es necesario para lugares de compras (supermercados, centros comerciales, etc.)
-- Ejecutar en Supabase SQL Editor

-- Agregar campo shopping_type (tipo de compras: supermercado, centro_comercial, tienda, etc.)
ALTER TABLE public.guide_places 
ADD COLUMN IF NOT EXISTS shopping_type VARCHAR(100);

COMMENT ON COLUMN public.guide_places.shopping_type IS 'Tipo de lugar de compras (supermercado, centro_comercial, tienda, farmacia, mercado, otros)';

-- Verificar que la columna se agregó correctamente
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
    AND table_name = 'guide_places' 
    AND column_name = 'shopping_type';

