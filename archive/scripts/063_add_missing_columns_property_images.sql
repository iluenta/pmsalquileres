-- Script para añadir columnas faltantes a property_images
-- Ejecutar este script si la tabla ya existe pero le faltan columnas

-- Añadir created_by si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'property_images' 
    AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.property_images ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
    RAISE NOTICE 'Columna created_by añadida a property_images';
  ELSE
    RAISE NOTICE 'La columna created_by ya existe en property_images';
  END IF;
END $$;

-- Añadir updated_at si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'property_images' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.property_images ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    RAISE NOTICE 'Columna updated_at añadida a property_images';
  ELSE
    RAISE NOTICE 'La columna updated_at ya existe en property_images';
  END IF;
END $$;

