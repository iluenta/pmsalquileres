# Agregar Campo Locality a Properties

## Problema
Se ha añadido el campo `locality` al código de la aplicación pero no existe en la base de datos, causando errores al intentar obtener datos de propiedades.

## Solución

### Paso 1: Agregar la columna a la base de datos
Ejecutar el script `009_add_locality_simple.sql` en el SQL Editor de Supabase:

```sql
-- Agregar la columna locality a la tabla properties
ALTER TABLE public.properties 
ADD COLUMN locality VARCHAR(255);

-- Agregar comentario para documentar el campo
COMMENT ON COLUMN public.properties.locality IS 'Localidad específica de la propiedad (ej: Vera, Almería)';

-- Crear índice para mejorar las consultas por localidad
CREATE INDEX idx_properties_locality ON public.properties(locality);
```

### Paso 2: Actualizar propiedades existentes (Opcional)
Ejecutar el script `010_update_properties_locality.sql` para llenar las propiedades existentes con valores basados en la ciudad:

```sql
UPDATE public.properties 
SET locality = CASE 
    WHEN city ILIKE '%vera%' THEN 'Vera'
    WHEN city ILIKE '%almería%' OR city ILIKE '%almeria%' THEN 'Almería'
    -- ... más casos
    ELSE COALESCE(city, 'Ubicación no especificada')
END
WHERE locality IS NULL;
```

### Paso 3: Verificar
Después de ejecutar los scripts, verificar que la columna existe:

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'properties' 
AND column_name = 'locality';
```

## Uso del Campo
El campo `locality` se utilizará en el widget de clima para mostrar la ubicación específica de la propiedad en lugar de "Ubicación de la propiedad".

## Archivos Modificados
- `types/guides.ts` - Interfaz Property actualizada
- `lib/api/guides-client.ts` - Consulta actualizada para incluir locality
- `lib/api/guides-public.ts` - API pública actualizada
- `components/guides/GuideWeatherWidget.tsx` - Widget actualizado para usar locality
- `components/guides/PropertyGuidePublicNew.tsx` - Componente principal actualizado

## Notas
- El campo es opcional (`VARCHAR(255)` nullable)
- Se creó un índice para mejorar el rendimiento de las consultas
- Los valores se pueden personalizar según las necesidades específicas
