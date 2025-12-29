-- Script para agregar políticas públicas de solo lectura para guías
-- Esto permite que los huéspedes accedan a las guías sin autenticación

-- Política pública para property_guides (solo lectura)
CREATE POLICY public_read_property_guides ON property_guides
  FOR SELECT USING (true);

-- Política pública para guide_sections (solo lectura)
CREATE POLICY public_read_guide_sections ON guide_sections
  FOR SELECT USING (true);

-- Política pública para guide_places (solo lectura)
CREATE POLICY public_read_guide_places ON guide_places
  FOR SELECT USING (true);

-- Política pública para house_rules (solo lectura)
CREATE POLICY public_read_house_rules ON house_rules
  FOR SELECT USING (true);

-- Política pública para house_guide_items (solo lectura)
CREATE POLICY public_read_house_guide_items ON house_guide_items
  FOR SELECT USING (true);

-- Política pública para guide_contact_info (solo lectura)
CREATE POLICY public_read_guide_contact_info ON guide_contact_info
  FOR SELECT USING (true);

-- Política pública para practical_info (solo lectura)
CREATE POLICY public_read_practical_info ON practical_info
  FOR SELECT USING (true);

-- Comentarios para documentación
COMMENT ON POLICY public_read_property_guides ON property_guides IS 'Permite acceso público de solo lectura a las guías de propiedades';
COMMENT ON POLICY public_read_guide_sections ON guide_sections IS 'Permite acceso público de solo lectura a las secciones de guías';
COMMENT ON POLICY public_read_guide_places ON guide_places IS 'Permite acceso público de solo lectura a los lugares de interés';
COMMENT ON POLICY public_read_house_rules ON house_rules IS 'Permite acceso público de solo lectura a las normas de la casa';
COMMENT ON POLICY public_read_house_guide_items ON house_guide_items IS 'Permite acceso público de solo lectura a los elementos de la guía de la casa';
COMMENT ON POLICY public_read_guide_contact_info ON guide_contact_info IS 'Permite acceso público de solo lectura a la información de contacto';
COMMENT ON POLICY public_read_practical_info ON practical_info IS 'Permite acceso público de solo lectura a la información práctica';
