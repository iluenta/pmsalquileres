-- Script para insertar datos de ejemplo de guías de propiedades
-- Solo ejecutar después de crear las tablas con 010_create_guides_tables.sql

-- Insertar una guía de ejemplo para la primera propiedad
INSERT INTO property_guides (
  tenant_id,
  property_id,
  title,
  welcome_message,
  host_names,
  host_signature,
  is_active
)
SELECT 
  t.id as tenant_id,
  p.id as property_id,
  'Guía del Huésped - ' || p.name as title,
  '¡Bienvenido a ' || p.name || '! Esperamos que disfrutes de tu estancia en nuestro hermoso alojamiento. Hemos preparado esta guía para que tengas toda la información que necesitas durante tu visita.',
  'María y Juan',
  '¡Esperamos verte pronto y que tengas una estancia inolvidable!',
  true
FROM tenants t
CROSS JOIN properties p
WHERE p.id = (
  SELECT id FROM properties 
  ORDER BY created_at 
  LIMIT 1
)
LIMIT 1;

-- Insertar algunas secciones de ejemplo
INSERT INTO guide_sections (
  tenant_id,
  guide_id,
  section_type,
  title,
  content,
  icon,
  order_index,
  is_active
)
SELECT 
  pg.tenant_id,
  pg.id as guide_id,
  'apartment' as section_type,
  'Información del Apartamento' as title,
  'Este apartamento cuenta con todas las comodidades necesarias para una estancia confortable. Incluye cocina completamente equipada, wifi gratuito, y una terraza privada con vistas al mar.',
  'fas fa-home' as icon,
  1 as order_index,
  true as is_active
FROM property_guides pg
WHERE pg.id = (
  SELECT id FROM property_guides 
  ORDER BY created_at 
  LIMIT 1
);

INSERT INTO guide_sections (
  tenant_id,
  guide_id,
  section_type,
  title,
  content,
  icon,
  order_index,
  is_active
)
SELECT 
  pg.tenant_id,
  pg.id as guide_id,
  'rules' as section_type,
  'Normas de la Casa' as title,
  'Para mantener un ambiente agradable para todos, te pedimos que respetes las siguientes normas durante tu estancia.',
  'fas fa-clipboard-list' as icon,
  2 as order_index,
  true as is_active
FROM property_guides pg
WHERE pg.id = (
  SELECT id FROM property_guides 
  ORDER BY created_at 
  LIMIT 1
);

-- Insertar algunos lugares de ejemplo
INSERT INTO guide_places (
  tenant_id,
  guide_id,
  name,
  description,
  distance,
  rating,
  badge,
  place_type,
  order_index
)
SELECT 
  pg.tenant_id,
  pg.id as guide_id,
  'Playa de la Concha' as name,
  'Una de las playas más famosas de la ciudad, perfecta para relajarse y disfrutar del sol.' as description,
  '5 minutos a pie' as distance,
  4.8 as rating,
  'Recomendada' as badge,
  'beach' as place_type,
  1 as order_index
FROM property_guides pg
WHERE pg.id = (
  SELECT id FROM property_guides 
  ORDER BY created_at 
  LIMIT 1
);

INSERT INTO guide_places (
  tenant_id,
  guide_id,
  name,
  description,
  distance,
  rating,
  badge,
  place_type,
  order_index
)
SELECT 
  pg.tenant_id,
  pg.id as guide_id,
  'Restaurante El Puerto' as name,
  'Excelente restaurante de mariscos frescos con terraza junto al puerto.' as description,
  '3 minutos a pie' as distance,
  4.6 as rating,
  'Marisco' as badge,
  'restaurant' as place_type,
  2 as order_index
FROM property_guides pg
WHERE pg.id = (
  SELECT id FROM property_guides 
  ORDER BY created_at 
  LIMIT 1
);

-- Insertar algunas normas de la casa
INSERT INTO house_rules (
  tenant_id,
  guide_id,
  title,
  description,
  icon,
  order_index
)
SELECT 
  pg.tenant_id,
  pg.id as guide_id,
  'No fumar en el interior' as title,
  'Está prohibido fumar dentro del apartamento. Puedes fumar en la terraza.' as description,
  'fas fa-smoking-ban' as icon,
  1 as order_index
FROM property_guides pg
WHERE pg.id = (
  SELECT id FROM property_guides 
  ORDER BY created_at 
  LIMIT 1
);

INSERT INTO house_rules (
  tenant_id,
  guide_id,
  title,
  description,
  icon,
  order_index
)
SELECT 
  pg.tenant_id,
  pg.id as guide_id,
  'Respetar el horario de descanso' as title,
  'Por favor, mantén el volumen bajo después de las 22:00 horas.' as description,
  'fas fa-volume-mute' as icon,
  2 as order_index
FROM property_guides pg
WHERE pg.id = (
  SELECT id FROM property_guides 
  ORDER BY created_at 
  LIMIT 1
);

-- Insertar algunos elementos de la guía de la casa
INSERT INTO house_guide_items (
  tenant_id,
  guide_id,
  title,
  description,
  details,
  icon,
  order_index
)
SELECT 
  pg.tenant_id,
  pg.id as guide_id,
  'Cocina' as title,
  'Cocina completamente equipada' as description,
  'Incluye: vitrocerámica, horno, microondas, nevera, lavavajillas, cafetera, tostadora y todos los utensilios necesarios.' as details,
  'fas fa-utensils' as icon,
  1 as order_index
FROM property_guides pg
WHERE pg.id = (
  SELECT id FROM property_guides 
  ORDER BY created_at 
  LIMIT 1
);

INSERT INTO house_guide_items (
  tenant_id,
  guide_id,
  title,
  description,
  details,
  icon,
  order_index
)
SELECT 
  pg.tenant_id,
  pg.id as guide_id,
  'WiFi' as title,
  'Internet de alta velocidad gratuito' as description,
  'Red: "Apartamento_Guest", Contraseña: "Bienvenido123"' as details,
  'fas fa-wifi' as icon,
  2 as order_index
FROM property_guides pg
WHERE pg.id = (
  SELECT id FROM property_guides 
  ORDER BY created_at 
  LIMIT 1
);

-- Insertar información de contacto
INSERT INTO guide_contact_info (
  tenant_id,
  guide_id,
  host_names,
  phone,
  email,
  whatsapp,
  emergency_numbers,
  service_issues
)
SELECT 
  pg.tenant_id,
  pg.id as guide_id,
  'María y Juan' as host_names,
  '+34 666 123 456' as phone,
  'maria.juan@example.com' as email,
  '+34 666 123 456' as whatsapp,
  '{
    "emergencias": "112",
    "policia_local": "092",
    "guardia_civil": "062",
    "bomberos": "080"
  }'::jsonb as emergency_numbers,
  ARRAY['Problemas con el WiFi', 'Averías en electrodomésticos', 'Problemas con la calefacción'] as service_issues
FROM property_guides pg
WHERE pg.id = (
  SELECT id FROM property_guides 
  ORDER BY created_at 
  LIMIT 1
);

-- Insertar información práctica
INSERT INTO practical_info (
  tenant_id,
  guide_id,
  category,
  title,
  description,
  details,
  icon,
  order_index
)
SELECT 
  pg.tenant_id,
  pg.id as guide_id,
  'transport' as category,
  'Cómo llegar' as title,
  'Información sobre transporte público y privado' as description,
  '{
    "autobus": "Líneas 5, 12 y 15 pasan cerca",
    "taxi": "Parada de taxis en la plaza principal",
    "parking": "Parking público disponible en la calle de al lado"
  }'::jsonb as details,
  'fas fa-bus' as icon,
  1 as order_index
FROM property_guides pg
WHERE pg.id = (
  SELECT id FROM property_guides 
  ORDER BY created_at 
  LIMIT 1
);

INSERT INTO practical_info (
  tenant_id,
  guide_id,
  category,
  title,
  description,
  details,
  icon,
  order_index
)
SELECT 
  pg.tenant_id,
  pg.id as guide_id,
  'shopping' as category,
  'Compras cercanas' as title,
  'Supermercados y tiendas en los alrededores' as description,
  '{
    "supermercado": "Mercadona - 2 minutos a pie",
    "farmacia": "Farmacia Central - 3 minutos a pie",
    "panaderia": "Panadería El Horno - 1 minuto a pie"
  }'::jsonb as details,
  'fas fa-shopping-cart' as icon,
  2 as order_index
FROM property_guides pg
WHERE pg.id = (
  SELECT id FROM property_guides 
  ORDER BY created_at 
  LIMIT 1
);

-- Mostrar resumen de los datos insertados
SELECT 
  'Guías creadas' as tipo,
  COUNT(*) as cantidad
FROM property_guides
UNION ALL
SELECT 
  'Secciones creadas' as tipo,
  COUNT(*) as cantidad
FROM guide_sections
UNION ALL
SELECT 
  'Lugares registrados' as tipo,
  COUNT(*) as cantidad
FROM guide_places
UNION ALL
SELECT 
  'Normas configuradas' as tipo,
  COUNT(*) as cantidad
FROM house_rules
UNION ALL
SELECT 
  'Elementos de casa' as tipo,
  COUNT(*) as cantidad
FROM house_guide_items
UNION ALL
SELECT 
  'Contactos configurados' as tipo,
  COUNT(*) as cantidad
FROM guide_contact_info
UNION ALL
SELECT 
  'Info práctica' as tipo,
  COUNT(*) as cantidad
FROM practical_info;
