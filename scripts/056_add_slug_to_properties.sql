-- Script para añadir el campo slug a la tabla properties
-- El slug será único globalmente y se usará para las URLs de las guías públicas
-- Tamaño máximo: 50 caracteres

DO $$
BEGIN
    -- Verificar si la columna slug ya existe
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = 'properties'
        AND column_name = 'slug'
    ) THEN
        -- Añadir la columna slug (primero como nullable para poder migrar datos)
        ALTER TABLE public.properties
        ADD COLUMN slug VARCHAR(50) NULL;
        
        -- Comentario para la columna
        COMMENT ON COLUMN public.properties.slug IS 'Slug único para URLs de guías públicas. Máximo 50 caracteres. Se genera automáticamente desde el nombre de la propiedad.';
        
        RAISE NOTICE 'Columna slug añadida a la tabla properties.';
    ELSE
        RAISE NOTICE 'La columna slug ya existe en la tabla properties.';
    END IF;
END $$;

-- Función para normalizar texto a slug (minúsculas, sin acentos, espacios a guiones)
CREATE OR REPLACE FUNCTION normalize_to_slug(input_text TEXT)
RETURNS TEXT AS $$
DECLARE
    result TEXT;
BEGIN
    -- Convertir a minúsculas
    result := LOWER(input_text);
    
    -- Normalizar acentos y caracteres especiales
    result := REPLACE(result, 'á', 'a');
    result := REPLACE(result, 'é', 'e');
    result := REPLACE(result, 'í', 'i');
    result := REPLACE(result, 'ó', 'o');
    result := REPLACE(result, 'ú', 'u');
    result := REPLACE(result, 'ñ', 'n');
    result := REPLACE(result, 'ü', 'u');
    result := REPLACE(result, 'Á', 'a');
    result := REPLACE(result, 'É', 'e');
    result := REPLACE(result, 'Í', 'i');
    result := REPLACE(result, 'Ó', 'o');
    result := REPLACE(result, 'Ú', 'u');
    result := REPLACE(result, 'Ñ', 'n');
    result := REPLACE(result, 'Ü', 'u');
    
    -- Reemplazar espacios y caracteres especiales por guiones
    result := REGEXP_REPLACE(result, '[^a-z0-9]+', '-', 'g');
    
    -- Eliminar guiones al inicio y final
    result := TRIM(BOTH '-' FROM result);
    
    -- Eliminar guiones múltiples
    WHILE result LIKE '%-%-%' LOOP
        result := REPLACE(result, '--', '-');
    END LOOP;
    
    -- Truncar a 50 caracteres
    IF LENGTH(result) > 50 THEN
        result := LEFT(result, 50);
        -- Asegurar que no termine en guión
        result := RTRIM(result, '-');
    END IF;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función para generar slug único (añade sufijo numérico si existe duplicado)
CREATE OR REPLACE FUNCTION generate_unique_slug(base_text TEXT, exclude_property_id UUID DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
    slug_exists BOOLEAN;
BEGIN
    -- Normalizar el texto base
    base_slug := normalize_to_slug(base_text);
    
    -- Si el slug base está vacío, usar un valor por defecto
    IF base_slug IS NULL OR base_slug = '' THEN
        base_slug := 'propiedad';
    END IF;
    
    final_slug := base_slug;
    
    -- Verificar si el slug ya existe
    LOOP
        IF exclude_property_id IS NULL THEN
            SELECT EXISTS(SELECT 1 FROM public.properties WHERE slug = final_slug) INTO slug_exists;
        ELSE
            SELECT EXISTS(SELECT 1 FROM public.properties WHERE slug = final_slug AND id != exclude_property_id) INTO slug_exists;
        END IF;
        
        EXIT WHEN NOT slug_exists;
        
        -- Si existe, añadir sufijo numérico
        counter := counter + 1;
        final_slug := LEFT(base_slug, 50 - LENGTH(counter::TEXT) - 1) || '-' || counter;
    END LOOP;
    
    RETURN final_slug;
END;
$$ LANGUAGE plpgsql;

-- Migrar datos existentes: generar slugs para propiedades que no lo tienen
DO $$
DECLARE
    prop RECORD;
    new_slug TEXT;
BEGIN
    FOR prop IN 
        SELECT id, name 
        FROM public.properties 
        WHERE slug IS NULL OR slug = ''
    LOOP
        new_slug := generate_unique_slug(prop.name, prop.id);
        UPDATE public.properties 
        SET slug = new_slug 
        WHERE id = prop.id;
        
        RAISE NOTICE 'Slug generado para propiedad %: %', prop.id, new_slug;
    END LOOP;
END $$;

-- Ahora hacer la columna NOT NULL y añadir constraint de unicidad
DO $$
BEGIN
    -- Verificar si hay propiedades sin slug
    IF EXISTS (SELECT 1 FROM public.properties WHERE slug IS NULL OR slug = '') THEN
        RAISE EXCEPTION 'No se pueden hacer todas las propiedades NOT NULL. Hay propiedades sin slug.';
    END IF;
    
    -- Añadir constraint NOT NULL
    ALTER TABLE public.properties
    ALTER COLUMN slug SET NOT NULL;
    
    -- Crear índice único en slug (único globalmente)
    CREATE UNIQUE INDEX IF NOT EXISTS idx_properties_slug_unique 
    ON public.properties(slug);
    
    RAISE NOTICE 'Constraint NOT NULL y índice único añadidos a slug.';
END $$;

-- Trigger para generar slug automáticamente si está vacío al insertar
CREATE OR REPLACE FUNCTION auto_generate_slug()
RETURNS TRIGGER AS $$
BEGIN
    -- Si el slug está vacío o es NULL, generarlo desde el nombre
    IF NEW.slug IS NULL OR TRIM(NEW.slug) = '' THEN
        NEW.slug := generate_unique_slug(NEW.name, NEW.id);
    ELSE
        -- Si se proporciona un slug, normalizarlo y asegurar que sea único
        NEW.slug := normalize_to_slug(NEW.slug);
        -- Verificar unicidad
        IF EXISTS (
            SELECT 1 FROM public.properties 
            WHERE slug = NEW.slug 
            AND (TG_OP = 'INSERT' OR id != NEW.id)
        ) THEN
            -- Si existe, generar uno único
            NEW.slug := generate_unique_slug(NEW.slug, NEW.id);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger antes de INSERT o UPDATE
DROP TRIGGER IF EXISTS trigger_auto_generate_slug ON public.properties;
CREATE TRIGGER trigger_auto_generate_slug
BEFORE INSERT OR UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION auto_generate_slug();

