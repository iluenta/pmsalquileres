-- Script de limpieza para tablas de configuración
-- ADVERTENCIA: Este script eliminará todos los tipos y valores de configuración.
-- Si existen registros (propiedades, reservas, movimientos) que referencian estos valores, 
-- el script fallará a menos que se use CASCADE.

DO $$ 
BEGIN
    -- Deshabilitar triggers temporalmente para mayor velocidad (opcional)
    -- SET session_replication_role = 'replica';

    -- Limpiar valores primero (dependen de tipos)
    -- Usamos TRUNCATE con CASCADE para asegurar que se borren incluso si hay dependencias
    -- ¡CUIDADO!: Esto podría poner a NULL o borrar registros en otras tablas según la FK definida.
    TRUNCATE TABLE public.configuration_values CASCADE;
    
    -- Limpiar tipos
    TRUNCATE TABLE public.configuration_types CASCADE;

    -- Reiniciar secuencias si las hubiera (aunque usamos UUIDs)
    
    -- Volver a habilitar triggers
    -- SET session_replication_role = 'origin';
END $$;

-- Mensaje informativo
DO $$ 
BEGIN
    RAISE NOTICE 'Tablas configuration_types y configuration_values limpiadas con éxito.';
END $$;
