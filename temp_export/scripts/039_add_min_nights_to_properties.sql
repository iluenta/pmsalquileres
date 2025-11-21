-- Script para añadir el campo min_nights a la tabla properties
-- Este campo indica el número mínimo de noches permitidas para reservas comerciales

DO $$
BEGIN
    -- Verificar si la columna min_nights ya existe
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'properties'
        AND column_name = 'min_nights'
    ) THEN
        -- Añadir la columna min_nights
        ALTER TABLE public.properties
        ADD COLUMN min_nights INTEGER DEFAULT 1 CHECK (min_nights >= 1);
        
        -- Comentario para la columna
        COMMENT ON COLUMN public.properties.min_nights IS 'Número mínimo de noches permitidas para reservas comerciales. Por defecto 1 noche.';
        
        RAISE NOTICE 'Columna min_nights añadida a la tabla properties.';
    ELSE
        RAISE NOTICE 'La columna min_nights ya existe en la tabla properties.';
    END IF;
END $$;


