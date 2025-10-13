-- Insertar tenant de ejemplo (si no existe)
INSERT INTO public.tenants (id, name, slug, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Demo Vacation Rentals',
  'demo-vacation-rentals',
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Tipos de configuración para el PMS
INSERT INTO public.configuration_types (id, tenant_id, name, description, is_active, sort_order, created_at, updated_at)
VALUES
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Tipo de Propiedad', 'Tipos de propiedades vacacionales', true, 1, NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Tipo de Reserva', 'Tipos de reservas', true, 2, NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Estado de Reserva', 'Estados de las reservas', true, 3, NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Origen de Reserva', 'Canales de origen de reservas', true, 4, NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Método de Pago', 'Métodos de pago disponibles', true, 5, NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Estado de Pago', 'Estados de los pagos', true, 6, NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Tipo de Amenidad', 'Servicios y amenidades de propiedades', true, 7, NOW(), NOW()),
  (gen_random_uuid(), '00000000-0000-0000-0000-000000000001', 'Tipo de Persona', 'Tipos de personas (propietario, huésped, etc)', true, 8, NOW(), NOW())
ON CONFLICT DO NOTHING;

-- Valores de configuración: Tipos de Propiedad
INSERT INTO public.configuration_values (id, configuration_type_id, value, label, description, is_active, sort_order, color, icon, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  ct.id,
  'apartment',
  'Apartamento',
  'Apartamento o piso',
  true,
  1,
  '#3b82f6',
  'building',
  NOW(),
  NOW()
FROM public.configuration_types ct
WHERE ct.name = 'Tipo de Propiedad' AND ct.tenant_id = '00000000-0000-0000-0000-000000000001'
ON CONFLICT DO NOTHING;

INSERT INTO public.configuration_values (id, configuration_type_id, value, label, description, is_active, sort_order, color, icon, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  ct.id,
  'house',
  'Casa',
  'Casa completa',
  true,
  2,
  '#10b981',
  'home',
  NOW(),
  NOW()
FROM public.configuration_types ct
WHERE ct.name = 'Tipo de Propiedad' AND ct.tenant_id = '00000000-0000-0000-0000-000000000001'
ON CONFLICT DO NOTHING;

INSERT INTO public.configuration_values (id, configuration_type_id, value, label, description, is_active, sort_order, color, icon, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  ct.id,
  'villa',
  'Villa',
  'Villa de lujo',
  true,
  3,
  '#f59e0b',
  'castle',
  NOW(),
  NOW()
FROM public.configuration_types ct
WHERE ct.name = 'Tipo de Propiedad' AND ct.tenant_id = '00000000-0000-0000-0000-000000000001'
ON CONFLICT DO NOTHING;

-- Valores de configuración: Estados de Reserva
INSERT INTO public.configuration_values (id, configuration_type_id, value, label, description, is_active, sort_order, color, icon, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  ct.id,
  'pending',
  'Pendiente',
  'Reserva pendiente de confirmación',
  true,
  1,
  '#f59e0b',
  'clock',
  NOW(),
  NOW()
FROM public.configuration_types ct
WHERE ct.name = 'Estado de Reserva' AND ct.tenant_id = '00000000-0000-0000-0000-000000000001'
ON CONFLICT DO NOTHING;

INSERT INTO public.configuration_values (id, configuration_type_id, value, label, description, is_active, sort_order, color, icon, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  ct.id,
  'confirmed',
  'Confirmada',
  'Reserva confirmada',
  true,
  2,
  '#10b981',
  'check',
  NOW(),
  NOW()
FROM public.configuration_types ct
WHERE ct.name = 'Estado de Reserva' AND ct.tenant_id = '00000000-0000-0000-0000-000000000001'
ON CONFLICT DO NOTHING;

INSERT INTO public.configuration_values (id, configuration_type_id, value, label, description, is_active, sort_order, color, icon, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  ct.id,
  'cancelled',
  'Cancelada',
  'Reserva cancelada',
  true,
  3,
  '#ef4444',
  'x',
  NOW(),
  NOW()
FROM public.configuration_types ct
WHERE ct.name = 'Estado de Reserva' AND ct.tenant_id = '00000000-0000-0000-0000-000000000001'
ON CONFLICT DO NOTHING;

-- Valores de configuración: Métodos de Pago
INSERT INTO public.configuration_values (id, configuration_type_id, value, label, description, is_active, sort_order, color, icon, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  ct.id,
  'cash',
  'Efectivo',
  'Pago en efectivo',
  true,
  1,
  '#10b981',
  'banknote',
  NOW(),
  NOW()
FROM public.configuration_types ct
WHERE ct.name = 'Método de Pago' AND ct.tenant_id = '00000000-0000-0000-0000-000000000001'
ON CONFLICT DO NOTHING;

INSERT INTO public.configuration_values (id, configuration_type_id, value, label, description, is_active, sort_order, color, icon, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  ct.id,
  'card',
  'Tarjeta',
  'Pago con tarjeta',
  true,
  2,
  '#3b82f6',
  'credit-card',
  NOW(),
  NOW()
FROM public.configuration_types ct
WHERE ct.name = 'Método de Pago' AND ct.tenant_id = '00000000-0000-0000-0000-000000000001'
ON CONFLICT DO NOTHING;

INSERT INTO public.configuration_values (id, configuration_type_id, value, label, description, is_active, sort_order, color, icon, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  ct.id,
  'transfer',
  'Transferencia',
  'Transferencia bancaria',
  true,
  3,
  '#8b5cf6',
  'arrow-right-left',
  NOW(),
  NOW()
FROM public.configuration_types ct
WHERE ct.name = 'Método de Pago' AND ct.tenant_id = '00000000-0000-0000-0000-000000000001'
ON CONFLICT DO NOTHING;
