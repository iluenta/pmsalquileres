-- Migration: Fix missing tenant_id on property_guides
-- Description: Ensures all guides have a tenant_id by inheriting it from their property

UPDATE public.property_guides
SET tenant_id = p.tenant_id
FROM public.properties p
WHERE property_guides.property_id = p.id
  AND property_guides.tenant_id IS NULL;
