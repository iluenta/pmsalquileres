-- Script para crear la tabla property_images
-- Permite gestionar una galería de hasta 15 imágenes por propiedad
-- Cada imagen tiene un título y una puede ser marcada como portada

-- Crear la tabla property_images si no existe
CREATE TABLE IF NOT EXISTS public.property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  title VARCHAR(255) NOT NULL,
  is_cover BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Añadir columnas si no existen (por si la tabla ya existía)
DO $$
BEGIN
  -- Añadir is_cover si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'property_images' 
    AND column_name = 'is_cover'
  ) THEN
    ALTER TABLE public.property_images ADD COLUMN is_cover BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;

  -- Añadir sort_order si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'property_images' 
    AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE public.property_images ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;
  END IF;

  -- Añadir title si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'property_images' 
    AND column_name = 'title'
  ) THEN
    ALTER TABLE public.property_images ADD COLUMN title VARCHAR(255) NOT NULL DEFAULT 'Imagen';
  END IF;

  -- Añadir created_by si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'property_images' 
    AND column_name = 'created_by'
  ) THEN
    ALTER TABLE public.property_images ADD COLUMN created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;
  END IF;

  -- Añadir updated_at si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'property_images' 
    AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.property_images ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Eliminar constraint si existe para recrearlo
ALTER TABLE public.property_images DROP CONSTRAINT IF EXISTS unique_cover_per_property;

-- Añadir constraint: Solo una imagen puede ser portada por propiedad
-- Usamos un índice único parcial en lugar de constraint para evitar problemas
CREATE UNIQUE INDEX IF NOT EXISTS unique_cover_per_property 
ON public.property_images(property_id) 
WHERE is_cover = TRUE;

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON public.property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_property_images_tenant_id ON public.property_images(tenant_id);
CREATE INDEX IF NOT EXISTS idx_property_images_is_cover ON public.property_images(property_id, is_cover) WHERE is_cover = TRUE;
CREATE INDEX IF NOT EXISTS idx_property_images_sort_order ON public.property_images(property_id, sort_order);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_property_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS trigger_update_property_images_updated_at ON public.property_images;
CREATE TRIGGER trigger_update_property_images_updated_at
  BEFORE UPDATE ON public.property_images
  FOR EACH ROW
  EXECUTE FUNCTION update_property_images_updated_at();

-- Función para asegurar que solo haya una imagen de portada por propiedad
CREATE OR REPLACE FUNCTION ensure_single_cover_image()
RETURNS TRIGGER AS $$
BEGIN
  -- Si se está marcando una imagen como portada
  IF NEW.is_cover = TRUE THEN
    -- Desmarcar todas las demás imágenes de portada de la misma propiedad
    UPDATE public.property_images
    SET is_cover = FALSE
    WHERE property_id = NEW.property_id
      AND id != NEW.id
      AND is_cover = TRUE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para asegurar una sola portada
DROP TRIGGER IF EXISTS trigger_ensure_single_cover_image ON public.property_images;
CREATE TRIGGER trigger_ensure_single_cover_image
  BEFORE INSERT OR UPDATE ON public.property_images
  FOR EACH ROW
  WHEN (NEW.is_cover = TRUE)
  EXECUTE FUNCTION ensure_single_cover_image();

-- Habilitar RLS
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios autenticados pueden ver las imágenes de su tenant
CREATE POLICY "Users can view property images from their tenant"
  ON public.property_images
  FOR SELECT
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Política: Los usuarios autenticados pueden insertar imágenes en propiedades de su tenant
CREATE POLICY "Users can insert property images in their tenant"
  ON public.property_images
  FOR INSERT
  TO authenticated
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Política: Los usuarios autenticados pueden actualizar imágenes de su tenant
CREATE POLICY "Users can update property images in their tenant"
  ON public.property_images
  FOR UPDATE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  )
  WITH CHECK (
    tenant_id IN (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Política: Los usuarios autenticados pueden eliminar imágenes de su tenant
CREATE POLICY "Users can delete property images from their tenant"
  ON public.property_images
  FOR DELETE
  TO authenticated
  USING (
    tenant_id IN (
      SELECT tenant_id FROM public.users WHERE id = auth.uid()
    )
  );

-- Política pública: Cualquiera puede ver imágenes de propiedades activas (para landing pública)
CREATE POLICY "Public can view images of active properties"
  ON public.property_images
  FOR SELECT
  TO anon, authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = property_images.property_id
        AND properties.is_active = TRUE
    )
  );

-- Comentarios para documentación
COMMENT ON TABLE public.property_images IS 'Galería de imágenes para propiedades. Máximo 15 imágenes por propiedad.';
COMMENT ON COLUMN public.property_images.image_url IS 'URL de la imagen almacenada en Supabase Storage';
COMMENT ON COLUMN public.property_images.title IS 'Título descriptivo de la imagen para contexto en landing y guía';
COMMENT ON COLUMN public.property_images.is_cover IS 'Indica si esta imagen es la portada principal de la propiedad';
COMMENT ON COLUMN public.property_images.sort_order IS 'Orden de visualización de las imágenes en la galería';

