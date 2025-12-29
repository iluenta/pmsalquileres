-- Script para añadir el campo is_default a la tabla configuration_values
-- Este campo permite marcar un valor como predeterminado dentro de cada tipo de configuración
-- Solo puede haber un valor con is_default = true por cada configuration_type_id

DO $$
BEGIN
    -- Verificar si la columna is_default ya existe
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'configuration_values'
        AND column_name = 'is_default'
    ) THEN
        -- Añadir la columna is_default
        ALTER TABLE public.configuration_values
        ADD COLUMN is_default BOOLEAN DEFAULT FALSE NOT NULL;
        
        -- Comentario para la columna
        COMMENT ON COLUMN public.configuration_values.is_default IS 'Indica si este valor es el predeterminado para su tipo de configuración. Solo puede haber un valor con is_default = true por cada configuration_type_id';
        
        RAISE NOTICE 'Columna is_default añadida a la tabla configuration_values.';
    ELSE
        RAISE NOTICE 'La columna is_default ya existe en la tabla configuration_values. No se realiza ninguna acción.';
    END IF;
END
$$;

-- Crear función para asegurar que solo un valor por tipo tenga is_default = true
CREATE OR REPLACE FUNCTION ensure_single_default_configuration_value()
RETURNS TRIGGER AS $$
BEGIN
    -- Si se está marcando un valor como default (is_default = true)
    IF NEW.is_default = TRUE THEN
        -- Desmarcar todos los otros valores del mismo tipo de configuración
        UPDATE public.configuration_values
        SET is_default = FALSE
        WHERE configuration_type_id = NEW.configuration_type_id
          AND id != NEW.id
          AND is_default = TRUE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger que se ejecuta antes de INSERT o UPDATE
DROP TRIGGER IF EXISTS trigger_ensure_single_default_configuration_value ON public.configuration_values;

CREATE TRIGGER trigger_ensure_single_default_configuration_value
    BEFORE INSERT OR UPDATE OF is_default, configuration_type_id
    ON public.configuration_values
    FOR EACH ROW
    WHEN (NEW.is_default = TRUE)
    EXECUTE FUNCTION ensure_single_default_configuration_value();

-- Crear índice único parcial para asegurar que solo un valor por tipo tenga is_default = true
-- Nota: PostgreSQL no soporta índices únicos parciales directamente, pero el trigger ya lo maneja
-- Sin embargo, podemos crear un índice para mejorar el rendimiento de las consultas
CREATE INDEX IF NOT EXISTS idx_configuration_values_is_default 
ON public.configuration_values(configuration_type_id, is_default) 
WHERE is_default = TRUE;

-- Comentario para la función
COMMENT ON FUNCTION ensure_single_default_configuration_value() IS 'Asegura que solo un valor de configuración por tipo tenga is_default = true, desmarcando automáticamente otros valores cuando se marca uno como default';

