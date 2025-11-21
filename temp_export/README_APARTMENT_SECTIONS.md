# Tabla apartment_sections

## Descripción
La tabla `apartment_sections` almacena las secciones específicas del apartamento con información detallada para las guías de huéspedes.

## Estructura de la tabla

```sql
CREATE TABLE public.apartment_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    guide_id UUID NOT NULL REFERENCES public.property_guides(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    section_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    details TEXT,
    image_url TEXT,
    icon VARCHAR(100),
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Campos

- **id**: Identificador único de la sección
- **guide_id**: ID de la guía de la propiedad (FK a property_guides)
- **tenant_id**: ID del tenant (FK a tenants)
- **section_type**: Tipo de sección (cocina, bano, salon, dormitorio, terraza, entrada, balcon, garaje)
- **title**: Título de la sección
- **description**: Descripción general de la sección
- **details**: Detalles específicos de la sección
- **image_url**: URL de la imagen de la sección
- **icon**: Icono FontAwesome para la sección
- **order_index**: Orden de visualización de la sección
- **created_at**: Fecha de creación
- **updated_at**: Fecha de última actualización

## Políticas RLS

- **SELECT**: Los usuarios pueden ver las secciones de su tenant
- **INSERT**: Los usuarios pueden crear secciones en su tenant
- **UPDATE**: Los usuarios pueden actualizar secciones de su tenant
- **DELETE**: Los usuarios pueden eliminar secciones de su tenant
- **SELECT público**: Acceso público de solo lectura para las guías

## Uso

### Crear una sección
```typescript
const newSection = await createApartmentSection({
  guide_id: "guide-id",
  section_type: "cocina",
  title: "Cocina Equipada",
  description: "Cocina completa con todos los electrodomésticos",
  details: "Vitrocerámica, horno, microondas, nevera",
  image_url: "https://example.com/kitchen.jpg",
  icon: "fas fa-utensils",
  order_index: 1
})
```

### Obtener secciones
```typescript
const sections = await getApartmentSections("guide-id")
```

### Actualizar una sección
```typescript
const updatedSection = await updateApartmentSection("section-id", {
  title: "Nuevo título",
  description: "Nueva descripción"
})
```

### Eliminar una sección
```typescript
const success = await deleteApartmentSection("section-id")
```

## Tipos de sección disponibles

- `cocina`: Cocina
- `bano`: Baño
- `salon`: Salón
- `dormitorio`: Dormitorio
- `terraza`: Terraza
- `entrada`: Entrada
- `balcon`: Balcón
- `garaje`: Garaje

## Scripts SQL

1. **Crear tabla**: `scripts/create_apartment_sections_table.sql`
2. **Migrar datos**: `scripts/migrate_guide_sections_to_apartment_sections.sql` (opcional)

## Notas

- La tabla está optimizada para el rendimiento con índices en los campos más consultados
- Incluye trigger automático para actualizar `updated_at`
- Compatible con el sistema de multi-tenancy existente
- Acceso público habilitado para las guías de huéspedes
