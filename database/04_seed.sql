-- Consolidated Seed Data
-- Idempotent version: Can be run multiple times without errors

-- 1. Default Demo Tenant
INSERT INTO public.tenants (id, name, slug, is_active)
VALUES ('00000000-0000-0000-0000-000000000000', 'Demo Tenant', 'demo', true)
ON CONFLICT (slug) DO NOTHING;

-- 2. Core Configuration Types and Values
DO $$
DECLARE
    v_tenant_id UUID := '00000000-0000-0000-0000-000000000000';
    v_type_id UUID;
BEGIN
    -- HELPER: Function-like logic to handle configuration types and values
    -- PROPERTY_TYPE
    INSERT INTO public.configuration_types (tenant_id, name, code, description, sort_order)
    VALUES (v_tenant_id, 'Tipo de Propiedad', 'PROPERTY_TYPE', 'Tipos de alojamientos (Apartamento, Villa, etc.)', 10)
    ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
    RETURNING id INTO v_type_id;

    INSERT INTO public.configuration_values (configuration_type_id, value, label, is_default, sort_order)
    VALUES 
        (v_type_id, 'apartamento', 'Apartamento', true, 1),
        (v_type_id, 'villa', 'Villa', false, 2),
        (v_type_id, 'estudio', 'Estudio', false, 3)
    ON CONFLICT (configuration_type_id, value) DO UPDATE SET label = EXCLUDED.label, is_default = EXCLUDED.is_default, sort_order = EXCLUDED.sort_order;

    -- BOOKING_STATUS
    INSERT INTO public.configuration_types (tenant_id, name, code, description, sort_order)
    VALUES (v_tenant_id, 'Estado de Reserva', 'BOOKING_STATUS', 'Estados posibles de una reserva', 20)
    ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
    RETURNING id INTO v_type_id;

    INSERT INTO public.configuration_values (configuration_type_id, value, label, color, is_default, sort_order)
    VALUES 
        (v_type_id, 'confirmada', 'Confirmada', '#10b981', true, 1),
        (v_type_id, 'pendiente', 'Pendiente', '#f59e0b', false, 2),
        (v_type_id, 'cancelada', 'Cancelada', '#ef4444', false, 3)
    ON CONFLICT (configuration_type_id, value) DO UPDATE SET label = EXCLUDED.label, color = EXCLUDED.color, is_default = EXCLUDED.is_default, sort_order = EXCLUDED.sort_order;

    -- TAX_TYPE
    INSERT INTO public.configuration_types (tenant_id, name, code, description, sort_order)
    VALUES (v_tenant_id, 'Tipo de Impuesto', 'TAX_TYPE', 'Tipos de impuestos aplicables', 30)
    ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
    RETURNING id INTO v_type_id;

    INSERT INTO public.configuration_values (configuration_type_id, value, label, description, sort_order)
    VALUES
        (v_type_id, 'iva_general', 'IVA General', '21', 1),
        (v_type_id, 'iva_reducido', 'IVA Reducido', '10', 2)
    ON CONFLICT (configuration_type_id, value) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order;

    -- PERSON_TYPE
    INSERT INTO public.configuration_types (tenant_id, name, code, description, sort_order)
    VALUES (v_tenant_id, 'Tipo de Persona', 'PERSON_TYPE', 'Categorías de personas (Huésped, Propietario, etc.)', 40)
    ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
    RETURNING id INTO v_type_id;

    INSERT INTO public.configuration_values (configuration_type_id, value, label, sort_order)
    VALUES
        (v_type_id, 'guest', 'Huésped', 1),
        (v_type_id, 'owner', 'Propietario', 2),
        (v_type_id, 'service_provider', 'Proveedor de Servicios', 3),
        (v_type_id, 'sales_channel', 'Canal de Venta', 4)
    ON CONFLICT (configuration_type_id, value) DO UPDATE SET label = EXCLUDED.label, sort_order = EXCLUDED.sort_order;

    -- MOVEMENT_TYPE
    INSERT INTO public.configuration_types (tenant_id, name, code, description, sort_order)
    VALUES (v_tenant_id, 'Tipo de Movimiento', 'MOVEMENT_TYPE', 'Tipos de movimientos financieros', 50)
    ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
    RETURNING id INTO v_type_id;

    INSERT INTO public.configuration_values (configuration_type_id, value, label, sort_order)
    VALUES
        (v_type_id, 'income', 'Ingreso', 1),
        (v_type_id, 'expense', 'Gasto', 2)
    ON CONFLICT (configuration_type_id, value) DO UPDATE SET label = EXCLUDED.label, sort_order = EXCLUDED.sort_order;

    -- BOOKING_TYPE
    INSERT INTO public.configuration_types (tenant_id, name, code, description, sort_order)
    VALUES (v_tenant_id, 'Tipo de Reserva', 'BOOKING_TYPE', 'Categorías de reserva', 60)
    ON CONFLICT (tenant_id, code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
    RETURNING id INTO v_type_id;

    INSERT INTO public.configuration_values (configuration_type_id, value, label, sort_order)
    VALUES
        (v_type_id, 'commercial', 'Reserva Comercial', 1),
        (v_type_id, 'closed_period', 'Periodo Cerrado', 2)
    ON CONFLICT (configuration_type_id, value) DO UPDATE SET label = EXCLUDED.label, sort_order = EXCLUDED.sort_order;
END $$;
