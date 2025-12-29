-- Script para permitir NULL en person_id para períodos cerrados
-- Ejecutar en Supabase SQL Editor después de ejecutar 035_add_booking_type_to_bookings.sql

-- Modificar la columna person_id para permitir NULL
ALTER TABLE public.bookings 
ALTER COLUMN person_id DROP NOT NULL;

-- Actualizar el índice si es necesario (ya debería funcionar con NULL)
-- El índice existente debería seguir funcionando

-- Actualizar la foreign key para permitir NULL
-- La foreign key ya debería permitir NULL, pero la verificamos
DO $$
BEGIN
  -- Verificar si la constraint existe y permite NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu 
      ON tc.constraint_name = ccu.constraint_name
    WHERE tc.table_name = 'bookings' 
      AND tc.constraint_type = 'FOREIGN KEY'
      AND ccu.column_name = 'person_id'
      AND ccu.table_name = 'bookings'
  ) THEN
    -- La foreign key ya existe, solo necesitamos permitir NULL (ya hecho arriba)
    RAISE NOTICE 'Foreign key constraint ya existe, person_id ahora permite NULL';
  END IF;
END $$;

-- Comentario
COMMENT ON COLUMN public.bookings.person_id IS 'ID del huésped (NULL para períodos cerrados)';

