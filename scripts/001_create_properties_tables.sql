-- Tabla de propiedades (properties)
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  property_code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  property_type_id UUID REFERENCES public.configuration_values(id),
  
  -- Dirección
  street VARCHAR(255),
  number VARCHAR(20),
  floor VARCHAR(20),
  door VARCHAR(20),
  city VARCHAR(100),
  province VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100),
  
  -- Características
  bedrooms INTEGER,
  bathrooms INTEGER,
  max_guests INTEGER,
  square_meters DECIMAL(10,2),
  
  -- Propietario
  owner_person_id UUID REFERENCES public.persons(id),
  
  -- Estado y configuración
  is_active BOOLEAN DEFAULT true,
  check_in_time TIME DEFAULT '15:00:00',
  check_out_time TIME DEFAULT '11:00:00',
  
  -- Precios base
  base_price_per_night DECIMAL(10,2),
  cleaning_fee DECIMAL(10,2),
  security_deposit DECIMAL(10,2),
  
  -- Metadatos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(tenant_id, property_code)
);

-- Tabla de amenidades/servicios de propiedades
CREATE TABLE IF NOT EXISTS public.property_amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  amenity_type_id UUID REFERENCES public.configuration_values(id),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de imágenes de propiedades
CREATE TABLE IF NOT EXISTS public.property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  title VARCHAR(255),
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de reservas (bookings)
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  booking_code VARCHAR(50) NOT NULL,
  property_id UUID NOT NULL REFERENCES public.properties(id),
  guest_person_id UUID REFERENCES public.persons(id),
  
  -- Fechas
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  booking_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Huéspedes
  number_of_guests INTEGER NOT NULL,
  number_of_adults INTEGER,
  number_of_children INTEGER,
  
  -- Estado y tipo
  booking_status_id UUID REFERENCES public.configuration_values(id),
  booking_type_id UUID REFERENCES public.configuration_values(id),
  booking_source_id UUID REFERENCES public.configuration_values(id),
  
  -- Precios
  total_amount DECIMAL(10,2) NOT NULL,
  paid_amount DECIMAL(10,2) DEFAULT 0,
  pending_amount DECIMAL(10,2),
  
  -- Notas
  guest_notes TEXT,
  internal_notes TEXT,
  
  -- Metadatos
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(tenant_id, booking_code),
  CHECK (check_out_date > check_in_date)
);

-- Tabla de pagos
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  payment_code VARCHAR(50) NOT NULL,
  
  -- Detalles del pago
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  amount DECIMAL(10,2) NOT NULL,
  payment_method_id UUID REFERENCES public.configuration_values(id),
  payment_status_id UUID REFERENCES public.configuration_values(id),
  
  -- Información adicional
  transaction_reference VARCHAR(255),
  notes TEXT,
  
  -- Metadatos
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(tenant_id, payment_code)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_properties_tenant ON public.properties(tenant_id);
CREATE INDEX IF NOT EXISTS idx_properties_active ON public.properties(tenant_id, is_active);
CREATE INDEX IF NOT EXISTS idx_property_amenities_property ON public.property_amenities(property_id);
CREATE INDEX IF NOT EXISTS idx_property_images_property ON public.property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_tenant ON public.bookings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_bookings_property ON public.bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON public.bookings(check_in_date, check_out_date);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON public.payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_tenant ON public.payments(tenant_id);

-- Triggers para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_amenities_updated_at BEFORE UPDATE ON public.property_amenities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_property_images_updated_at BEFORE UPDATE ON public.property_images
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
