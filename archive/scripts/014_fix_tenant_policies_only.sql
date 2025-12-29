-- Script simplificado para corregir solo las políticas de tenant conflictivas
-- Las políticas públicas ya existen, solo necesitamos cambiar las de tenant

-- Eliminar las políticas de tenant existentes que bloquean el acceso público
DROP POLICY IF EXISTS tenant_isolation_property_guides ON property_guides;
DROP POLICY IF EXISTS tenant_isolation_guide_sections ON guide_sections;
DROP POLICY IF EXISTS tenant_isolation_guide_places ON guide_places;
DROP POLICY IF EXISTS tenant_isolation_house_rules ON house_rules;
DROP POLICY IF EXISTS tenant_isolation_house_guide_items ON house_guide_items;
DROP POLICY IF EXISTS tenant_isolation_guide_contact_info ON guide_contact_info;
DROP POLICY IF EXISTS tenant_isolation_practical_info ON practical_info;

-- Crear nuevas políticas de tenant solo para operaciones de escritura
-- INSERT policies
CREATE POLICY tenant_isolation_property_guides_insert ON property_guides
  FOR INSERT WITH CHECK (tenant_id = public.user_tenant_id());

CREATE POLICY tenant_isolation_guide_sections_insert ON guide_sections
  FOR INSERT WITH CHECK (tenant_id = public.user_tenant_id());

CREATE POLICY tenant_isolation_guide_places_insert ON guide_places
  FOR INSERT WITH CHECK (tenant_id = public.user_tenant_id());

CREATE POLICY tenant_isolation_house_rules_insert ON house_rules
  FOR INSERT WITH CHECK (tenant_id = public.user_tenant_id());

CREATE POLICY tenant_isolation_house_guide_items_insert ON house_guide_items
  FOR INSERT WITH CHECK (tenant_id = public.user_tenant_id());

CREATE POLICY tenant_isolation_guide_contact_info_insert ON guide_contact_info
  FOR INSERT WITH CHECK (tenant_id = public.user_tenant_id());

CREATE POLICY tenant_isolation_practical_info_insert ON practical_info
  FOR INSERT WITH CHECK (tenant_id = public.user_tenant_id());

-- UPDATE policies
CREATE POLICY tenant_isolation_property_guides_update ON property_guides
  FOR UPDATE USING (tenant_id = public.user_tenant_id());

CREATE POLICY tenant_isolation_guide_sections_update ON guide_sections
  FOR UPDATE USING (tenant_id = public.user_tenant_id());

CREATE POLICY tenant_isolation_guide_places_update ON guide_places
  FOR UPDATE USING (tenant_id = public.user_tenant_id());

CREATE POLICY tenant_isolation_house_rules_update ON house_rules
  FOR UPDATE USING (tenant_id = public.user_tenant_id());

CREATE POLICY tenant_isolation_house_guide_items_update ON house_guide_items
  FOR UPDATE USING (tenant_id = public.user_tenant_id());

CREATE POLICY tenant_isolation_guide_contact_info_update ON guide_contact_info
  FOR UPDATE USING (tenant_id = public.user_tenant_id());

CREATE POLICY tenant_isolation_practical_info_update ON practical_info
  FOR UPDATE USING (tenant_id = public.user_tenant_id());

-- DELETE policies
CREATE POLICY tenant_isolation_property_guides_delete ON property_guides
  FOR DELETE USING (tenant_id = public.user_tenant_id());

CREATE POLICY tenant_isolation_guide_sections_delete ON guide_sections
  FOR DELETE USING (tenant_id = public.user_tenant_id());

CREATE POLICY tenant_isolation_guide_places_delete ON guide_places
  FOR DELETE USING (tenant_id = public.user_tenant_id());

CREATE POLICY tenant_isolation_house_rules_delete ON house_rules
  FOR DELETE USING (tenant_id = public.user_tenant_id());

CREATE POLICY tenant_isolation_house_guide_items_delete ON house_guide_items
  FOR DELETE USING (tenant_id = public.user_tenant_id());

CREATE POLICY tenant_isolation_guide_contact_info_delete ON guide_contact_info
  FOR DELETE USING (tenant_id = public.user_tenant_id());

CREATE POLICY tenant_isolation_practical_info_delete ON practical_info
  FOR DELETE USING (tenant_id = public.user_tenant_id());











