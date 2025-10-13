-- =====================================================
-- SCRIPT INICIAL: Crear tablas base del sistema
-- =====================================================

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- TABLA: tenants (Inquilinos/Organizaciones)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para tenants
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON public.tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_is_active ON public.tenants(is_active);

-- =====================================================
-- TABLA: users (Usuarios del sistema)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    avatar_url TEXT,
    theme_color VARCHAR(50) DEFAULT 'blue',
    language VARCHAR(10) DEFAULT 'es',
    timezone VARCHAR(50) DEFAULT 'Europe/Madrid',
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    number_format VARCHAR(20) DEFAULT 'es-ES',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_tenant_id ON public.users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);

-- =====================================================
-- TABLA: user_settings (Configuración de usuarios)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, setting_key)
);

-- Índices para user_settings
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON public.user_settings(user_id);

-- =====================================================
-- TABLA: configuration_types (Tipos de configuración)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.configuration_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(tenant_id, name)
);

-- Índices para configuration_types
CREATE INDEX IF NOT EXISTS idx_config_types_tenant_id ON public.configuration_types(tenant_id);

-- =====================================================
-- TABLA: configuration_values (Valores de configuración)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.configuration_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    configuration_type_id UUID NOT NULL REFERENCES public.configuration_types(id) ON DELETE CASCADE,
    value VARCHAR(100) NOT NULL,
    label VARCHAR(255) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    color VARCHAR(50),
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(configuration_type_id, value)
);

-- Índices para configuration_values
CREATE INDEX IF NOT EXISTS idx_config_values_type_id ON public.configuration_values(configuration_type_id);

-- =====================================================
-- TABLA: persons (Personas - propietarios, huéspedes)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.persons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    person_type VARCHAR(50) NOT NULL, -- 'owner', 'guest', 'contact'
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    full_name VARCHAR(255),
    document_type VARCHAR(50),
    document_number VARCHAR(100),
    birth_date DATE,
    nationality VARCHAR(100),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para persons
CREATE INDEX IF NOT EXISTS idx_persons_tenant_id ON public.persons(tenant_id);
CREATE INDEX IF NOT EXISTS idx_persons_type ON public.persons(person_type);

-- =====================================================
-- TABLA: person_contact_infos (Información de contacto)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.person_contact_infos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
    contact_type VARCHAR(50) NOT NULL, -- 'email', 'phone', 'mobile'
    contact_value VARCHAR(255) NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para person_contact_infos
CREATE INDEX IF NOT EXISTS idx_person_contacts_tenant_id ON public.person_contact_infos(tenant_id);
CREATE INDEX IF NOT EXISTS idx_person_contacts_person_id ON public.person_contact_infos(person_id);

-- =====================================================
-- TABLA: person_fiscal_addresses (Direcciones fiscales)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.person_fiscal_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
    street VARCHAR(255),
    number VARCHAR(20),
    floor VARCHAR(20),
    door VARCHAR(20),
    city VARCHAR(100),
    province VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para person_fiscal_addresses
CREATE INDEX IF NOT EXISTS idx_person_addresses_tenant_id ON public.person_fiscal_addresses(tenant_id);
CREATE INDEX IF NOT EXISTS idx_person_addresses_person_id ON public.person_fiscal_addresses(person_id);

-- =====================================================
-- TRIGGERS: Actualizar updated_at automáticamente
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON public.tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_config_types_updated_at BEFORE UPDATE ON public.configuration_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_config_values_updated_at BEFORE UPDATE ON public.configuration_values
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_persons_updated_at BEFORE UPDATE ON public.persons
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_person_contacts_updated_at BEFORE UPDATE ON public.person_contact_infos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_person_addresses_updated_at BEFORE UPDATE ON public.person_fiscal_addresses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✓ Tablas base creadas exitosamente';
    RAISE NOTICE '✓ Para crear el primer usuario, accede a /register';
END $$;
