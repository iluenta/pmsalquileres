-- Consolidated Functions and Triggers

-- 1. Security Functions
CREATE OR REPLACE FUNCTION public.user_tenant_id()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_tenant_id UUID;
BEGIN
  -- Get tenant_id for authenticated user
  SELECT u.tenant_id INTO user_tenant_id
  FROM public.users u
  WHERE u.id = auth.uid();
  
  RETURN user_tenant_id;
END;
$$;

COMMENT ON FUNCTION public.user_tenant_id() IS 'Safely returns the tenant_id of the authenticated user with fixed search_path.';

-- 2. Slug Generation Logic
CREATE OR REPLACE FUNCTION public.normalize_to_slug(input_text TEXT)
RETURNS TEXT 
LANGUAGE plpgsql 
IMMUTABLE
SET search_path = 'public'
AS $$
DECLARE
    result TEXT;
BEGIN
    result := LOWER(input_text);
    result := REPLACE(result, 'á', 'a');
    result := REPLACE(result, 'é', 'e');
    result := REPLACE(result, 'í', 'i');
    result := REPLACE(result, 'ó', 'o');
    result := REPLACE(result, 'ú', 'u');
    result := REPLACE(result, 'ñ', 'n');
    result := REPLACE(result, 'ü', 'u');
    result := REGEXP_REPLACE(result, '[^a-z0-9]+', '-', 'g');
    result := TRIM(BOTH '-' FROM result);
    WHILE result LIKE '%-%-%' LOOP
        result := REPLACE(result, '--', '-');
    END LOOP;
    IF LENGTH(result) > 50 THEN
        result := LEFT(result, 50);
        result := RTRIM(result, '-');
    END IF;
    RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_unique_slug(base_text TEXT, exclude_property_id UUID DEFAULT NULL)
RETURNS TEXT 
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
    slug_exists BOOLEAN;
BEGIN
    base_slug := public.normalize_to_slug(base_text);
    IF base_slug IS NULL OR base_slug = '' THEN
        base_slug := 'propiedad';
    END IF;
    final_slug := base_slug;
    LOOP
        IF exclude_property_id IS NULL THEN
            SELECT EXISTS(SELECT 1 FROM public.properties WHERE slug = final_slug) INTO slug_exists;
        ELSE
            SELECT EXISTS(SELECT 1 FROM public.properties WHERE slug = final_slug AND id != exclude_property_id) INTO slug_exists;
        END IF;
        EXIT WHEN NOT slug_exists;
        counter := counter + 1;
        final_slug := LEFT(base_slug, 50 - LENGTH(counter::TEXT) - 1) || '-' || counter;
    END LOOP;
    RETURN final_slug;
END;
$$;

CREATE OR REPLACE FUNCTION public.auto_generate_slug()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    IF NEW.slug IS NULL OR TRIM(NEW.slug) = '' THEN
        NEW.slug := public.generate_unique_slug(NEW.name, NEW.id);
    ELSE
        NEW.slug := public.normalize_to_slug(NEW.slug);
        IF EXISTS (
            SELECT 1 FROM public.properties 
            WHERE slug = NEW.slug 
            AND (TG_OP = 'INSERT' OR id != NEW.id)
        ) THEN
            NEW.slug := public.generate_unique_slug(NEW.slug, NEW.id);
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'properties' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS trigger_auto_generate_slug ON public.properties;
        CREATE TRIGGER trigger_auto_generate_slug
        BEFORE INSERT OR UPDATE ON public.properties
        FOR EACH ROW
        EXECUTE FUNCTION public.auto_generate_slug();
    END IF;
END $$;

-- 3. Coordinates Sync Logic
CREATE OR REPLACE FUNCTION public.sync_property_coordinates_to_guide()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    -- This function handles both INSERT (new guide) and UPDATE (property coordinate change)
    IF TG_TABLE_NAME = 'property_guides' THEN
        -- Copiar coordenadas de la propiedad asociada al crear la guía
        UPDATE public.property_guides
        SET 
            latitude = p.latitude,
            longitude = p.longitude
        FROM public.properties p
        WHERE property_guides.property_id = p.id
            AND property_guides.id = NEW.id
            AND p.latitude IS NOT NULL 
            AND p.longitude IS NOT NULL;
    ELSIF TG_TABLE_NAME = 'properties' THEN
        -- Sincronizar coordenadas a las guías cuando cambian en la propiedad
        UPDATE public.property_guides
        SET 
            latitude = NEW.latitude,
            longitude = NEW.longitude,
            updated_at = now()
        WHERE property_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$;

DO $$
BEGIN
    -- Trigger for property_guides
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'property_guides' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS trigger_copy_coordinates_on_guide_insert ON public.property_guides;
        CREATE TRIGGER trigger_copy_coordinates_on_guide_insert
            AFTER INSERT ON public.property_guides
            FOR EACH ROW
            EXECUTE FUNCTION public.sync_property_coordinates_to_guide();
    END IF;

    -- Trigger for properties (requires latitude/longitude columns)
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'latitude' AND table_schema = 'public') THEN
        DROP TRIGGER IF EXISTS trigger_sync_coordinates_on_property_update ON public.properties;
        CREATE TRIGGER trigger_sync_coordinates_on_property_update
            AFTER UPDATE OF latitude, longitude ON public.properties
            FOR EACH ROW
            EXECUTE FUNCTION public.sync_property_coordinates_to_guide();
    END IF;
END $$;

-- 4. Universal Timestamp Update
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Alias for backward compatibility if needed, but better to use the universal one
CREATE OR REPLACE FUNCTION public.update_apartment_sections_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SET search_path = 'public'
AS $$
BEGIN
    RETURN public.update_updated_at_column();
END;
$$;

-- 5. Automatically apply the trigger to all tables that have an updated_at column
DO $$ 
DECLARE 
  t RECORD;
BEGIN
  FOR t IN 
    SELECT table_name 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND column_name = 'updated_at' 
      AND table_name NOT IN (SELECT table_name FROM information_schema.views WHERE table_schema = 'public')
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS update_%I_updated_at ON public.%I', t.table_name, t.table_name);
    EXECUTE format('CREATE TRIGGER update_%I_updated_at BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t.table_name, t.table_name);
  END LOOP;
END $$;
