-- Script: Añadir campos de persona de soporte y teléfonos de interés a guide_contact_info
-- Fecha: 2025-01-20
-- Descripción: Añade campos para persona de soporte y estructura JSONB para teléfonos de interés

-- Añadir campo para nombre de persona de soporte
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'guide_contact_info' 
        AND column_name = 'support_person_name'
    ) THEN
        ALTER TABLE guide_contact_info 
        ADD COLUMN support_person_name TEXT;
        
        COMMENT ON COLUMN guide_contact_info.support_person_name IS 'Nombre de la persona de soporte adicional a los anfitriones';
    END IF;
END $$;

-- Añadir campo para teléfono de persona de soporte
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'guide_contact_info' 
        AND column_name = 'support_person_phone'
    ) THEN
        ALTER TABLE guide_contact_info 
        ADD COLUMN support_person_phone TEXT;
        
        COMMENT ON COLUMN guide_contact_info.support_person_phone IS 'Teléfono de la persona de soporte adicional a los anfitriones';
    END IF;
END $$;

-- Añadir campo JSONB para teléfonos de interés (categorías adicionales)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'guide_contact_info' 
        AND column_name = 'interest_phones'
    ) THEN
        ALTER TABLE guide_contact_info 
        ADD COLUMN interest_phones JSONB DEFAULT '[]'::jsonb;
        
        COMMENT ON COLUMN guide_contact_info.interest_phones IS 'Array de categorías con múltiples contactos (farmacia, veterinario, médico, etc.)';
    END IF;
END $$;

-- Añadir campo para mensaje de los anfitriones
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'guide_contact_info' 
        AND column_name = 'host_message'
    ) THEN
        ALTER TABLE guide_contact_info 
        ADD COLUMN host_message TEXT;
        
        COMMENT ON COLUMN guide_contact_info.host_message IS 'Mensaje opcional de los anfitriones para los huéspedes';
    END IF;
END $$;

-- Añadir campo para WhatsApp de persona de soporte
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'guide_contact_info' 
        AND column_name = 'support_person_whatsapp'
    ) THEN
        ALTER TABLE guide_contact_info 
        ADD COLUMN support_person_whatsapp TEXT;
        
        COMMENT ON COLUMN guide_contact_info.support_person_whatsapp IS 'WhatsApp de la persona de soporte adicional a los anfitriones';
    END IF;
END $$;

-- Crear índice GIN para búsquedas eficientes en interest_phones
CREATE INDEX IF NOT EXISTS idx_guide_contact_info_interest_phones 
ON guide_contact_info USING GIN (interest_phones);

-- Verificar que las columnas se añadieron correctamente
DO $$
DECLARE
    column_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO column_count
    FROM information_schema.columns
    WHERE table_name = 'guide_contact_info'
    AND column_name IN ('support_person_name', 'support_person_phone', 'interest_phones');
    
    IF column_count = 3 THEN
        RAISE NOTICE '✓ Todas las columnas se añadieron correctamente';
    ELSE
        RAISE WARNING '⚠ Solo se añadieron % de 3 columnas esperadas', column_count;
    END IF;
END $$;

