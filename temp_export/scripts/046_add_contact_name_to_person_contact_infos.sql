-- Script para añadir el campo contact_name a la tabla person_contact_infos
-- Este campo permite almacenar el nombre de la persona de contacto

-- Función para añadir el campo contact_name si no existe
CREATE OR REPLACE FUNCTION add_contact_name_to_person_contact_infos()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Verificar si la columna ya existe
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'person_contact_infos'
      AND column_name = 'contact_name'
  ) THEN
    -- Añadir la columna contact_name
    ALTER TABLE public.person_contact_infos
    ADD COLUMN contact_name character varying(255) NULL;
    
    -- Añadir comentario a la columna
    COMMENT ON COLUMN public.person_contact_infos.contact_name IS 'Nombre de la persona de contacto (opcional)';
    
    RAISE NOTICE 'Campo contact_name añadido a la tabla person_contact_infos';
  ELSE
    RAISE NOTICE 'El campo contact_name ya existe en la tabla person_contact_infos';
  END IF;
END;
$$;

-- Ejecutar la función
SELECT add_contact_name_to_person_contact_infos();

-- Limpiar la función temporal
DROP FUNCTION IF EXISTS add_contact_name_to_person_contact_infos();

