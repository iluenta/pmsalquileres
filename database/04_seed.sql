-- Consolidated Seed Data

-- 1. Default Demo Tenant
INSERT INTO public.tenants (id, name, slug, is_active)
VALUES ('00000000-0000-0000-0000-000000000000', 'Demo Tenant', 'demo', true)
ON CONFLICT (slug) DO NOTHING;

-- 2. Core Configuration Types (Spanish)
DO $$
DECLARE
    v_tenant_id UUID := '00000000-0000-0000-0000-000000000000';
    v_type_id UUID;
BEGIN
    -- Tipo de Propiedad
    INSERT INTO public.configuration_types (tenant_id, name, description, sort_order)
    VALUES (v_tenant_id, 'Tipo de Propiedad', 'Tipos de alojamientos (Apartamento, Villa, etc.)', 10)
    RETURNING id INTO v_type_id;

    INSERT INTO public.configuration_values (configuration_type_id, value, label, is_default, sort_order)
    VALUES 
        (v_type_id, 'apartamento', 'Apartamento', true, 1),
        (v_type_id, 'villa', 'Villa', false, 2),
        (v_type_id, 'estudio', 'Estudio', false, 3);

    -- Estado de Reserva
    INSERT INTO public.configuration_types (tenant_id, name, description, sort_order)
    VALUES (v_tenant_id, 'Estado de Reserva', 'Estados posibles de una reserva', 20)
    RETURNING id INTO v_type_id;

    INSERT INTO public.configuration_values (configuration_type_id, value, label, color, is_default, sort_order)
    VALUES 
        (v_type_id, 'confirmada', 'Confirmada', '#10b981', true, 1),
        (v_type_id, 'pendiente', 'Pendiente', '#f59e0b', false, 2),
        (v_type_id, 'cancelada', 'Cancelada', '#ef4444', false, 3);

    -- Tipo de Impuesto
    INSERT INTO public.configuration_types (tenant_id, name, description, sort_order)
    VALUES (v_tenant_id, 'Tipo de Impuesto', 'Tipos de impuestos aplicables', 30)
    RETURNING id INTO v_type_id;

    INSERT INTO public.configuration_values (configuration_type_id, value, label, description, sort_order)
    VALUES
        (v_type_id, 'iva_general', 'IVA General', '21', 1),
        (v_type_id, 'iva_reducido', 'IVA Reducido', '10', 2);
END $$;
