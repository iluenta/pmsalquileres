-- Script para añadir el campo image_url a la tabla properties
-- Este campo almacenará la URL de la imagen principal de la propiedad

DO $$
BEGIN
    -- Verificar si la columna image_url ya existe
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'properties'
        AND column_name = 'image_url'
    ) THEN
        -- Añadir la columna image_url
        ALTER TABLE public.properties
        ADD COLUMN image_url TEXT NULL;
        
        -- Comentario para la columna
        COMMENT ON COLUMN public.properties.image_url IS 'URL de la imagen principal de la propiedad almacenada en Supabase Storage';
        
        RAISE NOTICE 'Columna image_url añadida a la tabla properties.';
    ELSE
        RAISE NOTICE 'La columna image_url ya existe en la tabla properties. No se realiza ninguna acción.';
    END IF;
END
$$;

