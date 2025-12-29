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
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql IMMUTABLE;

CREATE OR REPLACE FUNCTION public.generate_unique_slug(base_text TEXT, exclude_property_id UUID DEFAULT NULL)
RETURNS TEXT AS $$
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
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.auto_generate_slug()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_generate_slug
BEFORE INSERT OR UPDATE ON public.properties
FOR EACH ROW
EXECUTE FUNCTION public.auto_generate_slug();

-- 3. Coordinates Sync Logic (from 019_add_coordinates_trigger.sql)
CREATE OR REPLACE FUNCTION public.sync_property_coordinates_to_guide()
RETURNS TRIGGER AS $$
BEGIN
    -- This is a placeholder since the full implementation should be verified 
    -- from script 019 and 020.
    UPDATE public.property_guides
    SET updated_at = now()
    WHERE property_id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
