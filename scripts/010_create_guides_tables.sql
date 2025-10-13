-- Script para crear las tablas de guías de propiedades en VERAPMS
-- Basado en la implementación de TuriGest, adaptado para la estructura de VERAPMS

-- Crear tabla de guías (una guía por propiedad)
CREATE TABLE IF NOT EXISTS property_guides (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL DEFAULT 'Guía del Huésped',
  welcome_message TEXT,
  host_names VARCHAR(255),
  host_signature TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, property_id)
);

-- Crear tabla de secciones de guía para contenido flexible
CREATE TABLE IF NOT EXISTS guide_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  guide_id UUID REFERENCES property_guides(id) ON DELETE CASCADE,
  section_type VARCHAR(50) NOT NULL, -- 'apartment', 'rules', 'house_guide', 'tips', 'contact', 'local_info'
  title VARCHAR(255),
  content TEXT,
  icon VARCHAR(100), -- Font Awesome icon class
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de playas/lugares de interés
CREATE TABLE IF NOT EXISTS guide_places (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  guide_id UUID REFERENCES property_guides(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  distance VARCHAR(100),
  rating DECIMAL(2,1),
  badge VARCHAR(100), -- 'Recomendada', 'Familiar', 'Tranquila', etc.
  image_url TEXT,
  place_type VARCHAR(50) DEFAULT 'beach', -- 'beach', 'restaurant', 'activity', 'attraction'
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de normas de la casa
CREATE TABLE IF NOT EXISTS house_rules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  guide_id UUID REFERENCES property_guides(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100), -- Font Awesome icon class
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de elementos de la guía de la casa
CREATE TABLE IF NOT EXISTS house_guide_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  guide_id UUID REFERENCES property_guides(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  details TEXT,
  icon VARCHAR(100), -- Font Awesome icon class
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla de información de contacto
CREATE TABLE IF NOT EXISTS guide_contact_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  guide_id UUID REFERENCES property_guides(id) ON DELETE CASCADE,
  host_names VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  whatsapp VARCHAR(50),
  emergency_numbers JSONB, -- Store emergency contacts as JSON
  service_issues TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, guide_id)
);

-- Crear tabla de información práctica
CREATE TABLE IF NOT EXISTS practical_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  guide_id UUID REFERENCES property_guides(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL, -- 'transport', 'shopping', 'health', 'weather', etc.
  title VARCHAR(255) NOT NULL,
  description TEXT,
  details JSONB, -- Flexible JSON for different types of info
  icon VARCHAR(100),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_property_guides_tenant_id ON property_guides(tenant_id);
CREATE INDEX IF NOT EXISTS idx_property_guides_property_id ON property_guides(property_id);
CREATE INDEX IF NOT EXISTS idx_guide_sections_tenant_id ON guide_sections(tenant_id);
CREATE INDEX IF NOT EXISTS idx_guide_sections_guide_id ON guide_sections(guide_id);
CREATE INDEX IF NOT EXISTS idx_guide_places_tenant_id ON guide_places(tenant_id);
CREATE INDEX IF NOT EXISTS idx_guide_places_guide_id ON guide_places(guide_id);
CREATE INDEX IF NOT EXISTS idx_house_rules_tenant_id ON house_rules(tenant_id);
CREATE INDEX IF NOT EXISTS idx_house_rules_guide_id ON house_rules(guide_id);
CREATE INDEX IF NOT EXISTS idx_house_guide_items_tenant_id ON house_guide_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_house_guide_items_guide_id ON house_guide_items(guide_id);
CREATE INDEX IF NOT EXISTS idx_guide_contact_info_tenant_id ON guide_contact_info(tenant_id);
CREATE INDEX IF NOT EXISTS idx_guide_contact_info_guide_id ON guide_contact_info(guide_id);
CREATE INDEX IF NOT EXISTS idx_practical_info_tenant_id ON practical_info(tenant_id);
CREATE INDEX IF NOT EXISTS idx_practical_info_guide_id ON practical_info(guide_id);

-- Habilitar Row Level Security (RLS)
ALTER TABLE property_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE house_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE house_guide_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE guide_contact_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE practical_info ENABLE ROW LEVEL SECURITY;

-- Crear políticas RLS para aislamiento por tenant
-- Usando la función user_tenant_id() existente
CREATE POLICY tenant_isolation_property_guides ON property_guides
  FOR ALL USING (tenant_id = public.user_tenant_id());

CREATE POLICY tenant_isolation_guide_sections ON guide_sections
  FOR ALL USING (tenant_id = public.user_tenant_id());

CREATE POLICY tenant_isolation_guide_places ON guide_places
  FOR ALL USING (tenant_id = public.user_tenant_id());

CREATE POLICY tenant_isolation_house_rules ON house_rules
  FOR ALL USING (tenant_id = public.user_tenant_id());

CREATE POLICY tenant_isolation_house_guide_items ON house_guide_items
  FOR ALL USING (tenant_id = public.user_tenant_id());

CREATE POLICY tenant_isolation_guide_contact_info ON guide_contact_info
  FOR ALL USING (tenant_id = public.user_tenant_id());

CREATE POLICY tenant_isolation_practical_info ON practical_info
  FOR ALL USING (tenant_id = public.user_tenant_id());

-- Crear triggers para updated_at
CREATE TRIGGER update_property_guides_updated_at BEFORE UPDATE ON property_guides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guide_sections_updated_at BEFORE UPDATE ON guide_sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guide_contact_info_updated_at BEFORE UPDATE ON guide_contact_info
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentarios para documentación
COMMENT ON TABLE property_guides IS 'Guías de propiedades para huéspedes';
COMMENT ON TABLE guide_sections IS 'Secciones de contenido flexible para las guías';
COMMENT ON TABLE guide_places IS 'Lugares de interés (playas, restaurantes, actividades)';
COMMENT ON TABLE house_rules IS 'Normas de la casa';
COMMENT ON TABLE house_guide_items IS 'Elementos de la guía de la casa (electrodomésticos, etc.)';
COMMENT ON TABLE guide_contact_info IS 'Información de contacto del anfitrión';
COMMENT ON TABLE practical_info IS 'Información práctica (transporte, compras, etc.)';
