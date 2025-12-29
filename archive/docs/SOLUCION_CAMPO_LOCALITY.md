# Agregar Campo Locality a Property Guides

## Problema
Se ha añadido el campo `locality` al código de la aplicación pero no existe en la tabla correcta (`property_guides`), causando errores al intentar obtener datos de propiedades.

## Solución

### Paso 1: Eliminar campo de properties (si existe)
Ejecutar el script `011_remove_locality_from_properties.sql`:

```sql
-- Eliminar el campo locality de la tabla properties
ALTER TABLE public.properties 
DROP COLUMN IF EXISTS locality;

-- Eliminar el índice también
DROP INDEX IF EXISTS idx_properties_locality;
```

### Paso 2: Agregar la columna a property_guides
Ejecutar el script `012_add_locality_to_property_guides.sql`:

```sql
-- Agregar la columna locality a la tabla property_guides
ALTER TABLE public.property_guides 
ADD COLUMN locality VARCHAR(255);

-- Agregar comentario para documentar el campo
COMMENT ON COLUMN public.property_guides.locality IS 'Localidad específica de la propiedad (ej: Vera, Almería)';

-- Crear índice para mejorar las consultas por localidad
CREATE INDEX idx_property_guides_locality ON public.property_guides(locality);
```

### Paso 3: Actualizar property_guides existentes (Opcional)
Ejecutar el script `013_update_property_guides_locality.sql` para llenar las guías existentes con valores basados en el título:

```sql
UPDATE public.property_guides 
SET locality = CASE 
    WHEN title ILIKE '%vera%' THEN 'Vera'
    WHEN title ILIKE '%almería%' OR title ILIKE '%almeria%' THEN 'Almería'
    -- ... más casos
    ELSE 'Ubicación no especificada'
END
WHERE locality IS NULL;
```

### Paso 4: Verificar
Después de ejecutar los scripts, verificar que la columna existe:

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'property_guides' 
AND column_name = 'locality';
```

## Uso del Campo
El campo `locality` se utilizará en el widget de clima para mostrar la ubicación específica de la propiedad en lugar de "Ubicación de la propiedad".

## Archivos Modificados
- `types/guides.ts` - Interfaz PropertyGuide actualizada
- `lib/api/guides-client.ts` - Usa locality desde guide en lugar de property
- `lib/api/guides-public.ts` - Usa locality desde guide
- `components/guides/GuideWeatherWidget.tsx` - Widget actualizado para usar locality
- `components/guides/PropertyGuidePublicNew.tsx` - Componente principal actualizado

## Notas
- El campo está en `property_guides` (tabla pública), no en `properties`
- El campo es opcional (`VARCHAR(255)` nullable)
- Se creó un índice para mejorar el rendimiento de las consultas
- Los valores se pueden personalizar según las necesidades específicas
