-- DEMO DATA GENERATION SCRIPT
-- Tenant: 1e351393-feb7-4d52-9d9d-3e6951937975

DO $$
DECLARE
    v_tenant_id UUID := '1e351393-feb7-4d52-9d9d-3e6951937975';
    v_user_id UUID := '2c745eb7-b7df-4144-a0f6-ba7355e89e14'; -- Antonio Gomez Sanchez
    
    -- Config IDs
    v_prop_type_apt UUID;
    v_booking_status_conf UUID;
    v_booking_status_pend UUID;
    v_booking_type_comm UUID;
    v_person_type_guest UUID;
    v_person_type_owner UUID;
    v_person_type_provider UUID;
    v_person_type_channel UUID;
    v_move_type_income UUID;
    v_move_type_expense UUID;
    v_tax_type_iva21 UUID;
    
    -- New Data IDs
    v_prop_id UUID;
    v_owner_id UUID;
    v_guest_id UUID;
    v_provider_id UUID;
    v_provider_entry_id UUID;
    v_channel_id UUID;
    v_account_id UUID;
    v_booking_past_id UUID;
    v_booking_active_id UUID;
    v_booking_future_id UUID;
    
    -- Helper constants
    v_today DATE := CURRENT_DATE;

BEGIN
    -- ==========================================
    -- STEP 0: CLEANUP
    -- ==========================================
    RAISE NOTICE 'Cleaning up existing data for tenant %', v_tenant_id;
    
    DELETE FROM public.movement_expense_items WHERE movement_id IN (SELECT id FROM public.movements WHERE tenant_id = v_tenant_id);
    DELETE FROM public.movements WHERE tenant_id = v_tenant_id;
    DELETE FROM public.payments WHERE booking_id IN (SELECT id FROM public.bookings WHERE tenant_id = v_tenant_id);
    DELETE FROM public.bookings WHERE tenant_id = v_tenant_id;
    DELETE FROM public.property_images WHERE tenant_id = v_tenant_id;
    DELETE FROM public.property_amenities WHERE tenant_id = v_tenant_id;
    DELETE FROM public.property_sales_channels WHERE tenant_id = v_tenant_id;
    DELETE FROM public.property_reviews WHERE tenant_id = v_tenant_id;
    DELETE FROM public.property_highlights WHERE tenant_id = v_tenant_id;
    DELETE FROM public.property_pricing WHERE tenant_id = v_tenant_id;
    DELETE FROM public.property_pricing_plans WHERE tenant_id = v_tenant_id;
    DELETE FROM public.house_guide_items WHERE tenant_id = v_tenant_id;
    DELETE FROM public.guide_places WHERE tenant_id = v_tenant_id;
    DELETE FROM public.guide_contact_info WHERE tenant_id = v_tenant_id;
    DELETE FROM public.guide_sections WHERE tenant_id = v_tenant_id;
    DELETE FROM public.house_rules WHERE tenant_id = v_tenant_id;
    DELETE FROM public.tips WHERE tenant_id = v_tenant_id;
    DELETE FROM public.property_guides WHERE tenant_id = v_tenant_id;
    DELETE FROM public.apartment_sections WHERE tenant_id = v_tenant_id;
    DELETE FROM public.practical_info WHERE tenant_id = v_tenant_id;
    DELETE FROM public.properties WHERE tenant_id = v_tenant_id;
    DELETE FROM public.service_provider_services WHERE service_provider_id IN (SELECT id FROM public.service_providers WHERE tenant_id = v_tenant_id);
    DELETE FROM public.service_providers WHERE tenant_id = v_tenant_id;
    DELETE FROM public.treasury_accounts WHERE tenant_id = v_tenant_id;
    DELETE FROM public.sales_channels WHERE tenant_id = v_tenant_id;
    DELETE FROM public.person_contact_infos WHERE tenant_id = v_tenant_id;
    DELETE FROM public.person_fiscal_addresses WHERE tenant_id = v_tenant_id;
    DELETE FROM public.persons WHERE tenant_id = v_tenant_id;

    -- ==========================================
    -- STEP 1: RESOLVE CONFIGURATIONS
    -- ==========================================
    RAISE NOTICE 'Resolving configuration IDs...';
    
    -- Property Type
    SELECT id INTO v_prop_type_apt FROM public.configuration_values 
    WHERE configuration_type_id IN (SELECT id FROM public.configuration_types WHERE tenant_id = v_tenant_id AND code = 'PROPERTY_TYPE')
    AND value = 'apartamento' LIMIT 1;
    
    -- Booking Status
    SELECT id INTO v_booking_status_conf FROM public.configuration_values 
    WHERE configuration_type_id IN (SELECT id FROM public.configuration_types WHERE tenant_id = v_tenant_id AND code = 'BOOKING_STATUS')
    AND value = 'confirmada' LIMIT 1;
    
    SELECT id INTO v_booking_status_pend FROM public.configuration_values 
    WHERE configuration_type_id IN (SELECT id FROM public.configuration_types WHERE tenant_id = v_tenant_id AND code = 'BOOKING_STATUS')
    AND value = 'pendiente' LIMIT 1;
    
    -- Booking Type
    SELECT id INTO v_booking_type_comm FROM public.configuration_values 
    WHERE configuration_type_id IN (SELECT id FROM public.configuration_types WHERE tenant_id = v_tenant_id AND code = 'BOOKING_TYPE')
    AND value = 'commercial' LIMIT 1;
    
    -- Person Type
    SELECT id INTO v_person_type_guest FROM public.configuration_values 
    WHERE configuration_type_id IN (SELECT id FROM public.configuration_types WHERE tenant_id = v_tenant_id AND code = 'PERSON_TYPE')
    AND value = 'guest' LIMIT 1;
    
    SELECT id INTO v_person_type_owner FROM public.configuration_values 
    WHERE configuration_type_id IN (SELECT id FROM public.configuration_types WHERE tenant_id = v_tenant_id AND code = 'PERSON_TYPE')
    AND value = 'owner' LIMIT 1;
    
    SELECT id INTO v_person_type_provider FROM public.configuration_values 
    WHERE configuration_type_id IN (SELECT id FROM public.configuration_types WHERE tenant_id = v_tenant_id AND code = 'PERSON_TYPE')
    AND value = 'service_provider' LIMIT 1;
    
    SELECT id INTO v_person_type_channel FROM public.configuration_values 
    WHERE configuration_type_id IN (SELECT id FROM public.configuration_types WHERE tenant_id = v_tenant_id AND code = 'PERSON_TYPE')
    AND value = 'sales_channel' LIMIT 1;
    
    -- Movement Type
    SELECT id INTO v_move_type_income FROM public.configuration_values 
    WHERE configuration_type_id IN (SELECT id FROM public.configuration_types WHERE tenant_id = v_tenant_id AND code = 'MOVEMENT_TYPE')
    AND value = 'income' LIMIT 1;
    
    SELECT id INTO v_move_type_expense FROM public.configuration_values 
    WHERE configuration_type_id IN (SELECT id FROM public.configuration_types WHERE tenant_id = v_tenant_id AND code = 'MOVEMENT_TYPE')
    AND value = 'expense' LIMIT 1;
    
    -- Tax Type
    SELECT id INTO v_tax_type_iva21 FROM public.configuration_values 
    WHERE configuration_type_id IN (SELECT id FROM public.configuration_types WHERE tenant_id = v_tenant_id AND code = 'TAX_TYPE')
    AND value = 'iva_general' LIMIT 1;

    -- ==========================================
    -- STEP 2: CREATE MISSING CONFIG TYPES (IF ANY)
    -- ==========================================
    -- For this demo, let's assume they exist based on our previous checks.
    -- If not, we could create them here.

    -- ==========================================
    -- STEP 3: CREATE DEMO ENTITIES
    -- ==========================================
    RAISE NOTICE 'Creating demo entities...';
    
    -- 3.1 Persons
    -- Owner
    INSERT INTO public.persons (tenant_id, first_name, last_name, full_name, person_type)
    VALUES (v_tenant_id, 'Juan', 'Propietario', 'Juan Propietario', 'owner')
    RETURNING id INTO v_owner_id;
    
    -- Guest
    INSERT INTO public.persons (tenant_id, first_name, last_name, full_name, person_type)
    VALUES (v_tenant_id, 'Maria', 'Viajera', 'Maria Viajera', 'guest')
    RETURNING id INTO v_guest_id;
    
    -- Provider
    INSERT INTO public.persons (tenant_id, first_name, last_name, full_name, person_type)
    VALUES (v_tenant_id, 'Limpiezas', 'Brillantes SL', 'Limpiezas Brillantes SL', 'service_provider')
    RETURNING id INTO v_provider_id;
    
    -- Contacts
    INSERT INTO public.person_contact_infos (tenant_id, person_id, contact_type, contact_value, is_primary)
    VALUES 
        (v_tenant_id, v_guest_id, 'email', 'maria.viajera@example.com', true),
        (v_tenant_id, v_guest_id, 'phone', '+34600112233', true);

    -- 3.2 Property
    INSERT INTO public.properties (
        tenant_id, property_code, name, description, property_type_id, 
        street, number, city, province, postal_code, country,
        bedrooms, bathrooms, max_guests, base_price_per_night, 
        owner_person_id, is_active, slug, image_url, landing_config, created_by
    )
    VALUES (
        v_tenant_id, 'VILLA-001', 'Villa Vista Mar', 
        'Preciosa villa con vistas espectaculares al Mediterráneo. Reformada en 2024 con materiales de alta calidad.',
        v_prop_type_apt, 'Avenida del Mar', '12', 'Marbella', 'Málaga', '29600', 'España',
        3, 2, 6, 250.00,
        v_owner_id, true, 'villa-vista-mar', 
        'https://images.unsplash.com/photo-1542718610-a1d656d1884c?q=80&w=2070&auto=format&fit=crop',
        '{
          "hero_subtitle": "Disfruta de la mejor vista al mar en nuestra villa de lujo",
          "highlights": [
            { "icon": "Wifi", "title": "WiFi de alta velocidad", "description": "Conexión de fibra de 1Gbps" },
            { "icon": "Wind", "title": "Aire Acondicionado", "description": "Climatización total para tu confort" },
            { "icon": "Tv", "title": "Smart TV 4K", "description": "Acceso a Netflix y HBO" }
          ],
          "space_descriptions": {
            "rooms": "3 amplias habitaciones con camas queen size.",
            "bathrooms": "2 baños modernos con ducha de hidromasaje.",
            "kitchen": "Cocina totalmente equipada con electrodomésticos de alta gama."
          }
        }',
        v_user_id
    )
    RETURNING id INTO v_prop_id;

    -- Property Images
    INSERT INTO public.property_images (tenant_id, property_id, image_url, title, is_primary, is_cover)
    VALUES 
        (v_tenant_id, v_prop_id, 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop', 'Terraza', true, true),
        (v_tenant_id, v_prop_id, 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071&auto=format&fit=crop', 'Piscina', false, false);

    -- 3.3 Sales Channel
    INSERT INTO public.sales_channels (tenant_id, person_id, logo_url, sales_commission, is_active, is_own_channel, created_by)
    VALUES (v_tenant_id, null, 'https://upload.wikimedia.org/wikipedia/commons/6/69/Airbnb_Logo_Bélo.svg', 3.00, true, false, v_user_id)
    RETURNING id INTO v_channel_id;

    -- 3.4 Treasury Account
    INSERT INTO public.treasury_accounts (tenant_id, name, account_number, bank_name, is_active, created_by)
    VALUES (v_tenant_id, 'Cuenta BBVA Principal', 'ES91 0182 1234 5678 9012', 'BBVA', true, v_user_id)
    RETURNING id INTO v_account_id;

    -- 3.5 Service Provider Entry
    INSERT INTO public.service_providers (tenant_id, person_id, is_active, created_by)
    VALUES (v_tenant_id, v_provider_id, true, v_user_id)
    RETURNING id INTO v_provider_entry_id;

    -- ==========================================
    -- STEP 4: CREATE BOOKINGS & MOVEMENTS
    -- ==========================================
    RAISE NOTICE 'Creating bookings and movements...';
    
    -- 4.1 Past Booking (Fully Paid)
    INSERT INTO public.bookings (
        tenant_id, booking_code, property_id, person_id, channel_id, 
        check_in_date, check_out_date, total_amount, booking_status_id, booking_type_id, created_by
    )
    VALUES (
        v_tenant_id, 'BK-PAST-001', v_prop_id, v_guest_id, v_channel_id,
        v_today - INTERVAL '15 days', v_today - INTERVAL '10 days', 1250.00,
        v_booking_status_conf, v_booking_type_comm, v_user_id
    )
    RETURNING id INTO v_booking_past_id;
    
    INSERT INTO public.movements (
        tenant_id, movement_type_id, booking_id, treasury_account_id, amount, movement_date, created_by
    )
    VALUES (v_tenant_id, v_move_type_income, v_booking_past_id, v_account_id, 1250.00, v_today - INTERVAL '12 days', v_user_id);

    -- 4.2 Active Booking (Partial Payment)
    INSERT INTO public.bookings (
        tenant_id, booking_code, property_id, person_id, channel_id, 
        check_in_date, check_out_date, total_amount, booking_status_id, booking_type_id, created_by
    )
    VALUES (
        v_tenant_id, 'BK-ACT-002', v_prop_id, v_guest_id, v_channel_id,
        v_today - INTERVAL '2 days', v_today + INTERVAL '3 days', 1500.00,
        v_booking_status_conf, v_booking_type_comm, v_user_id
    )
    RETURNING id INTO v_booking_active_id;
    
    INSERT INTO public.movements (
        tenant_id, movement_type_id, booking_id, treasury_account_id, amount, movement_date, created_by
    )
    VALUES (v_tenant_id, v_move_type_income, v_booking_active_id, v_account_id, 750.00, v_today - INTERVAL '1 days', v_user_id);

    -- 4.3 Future Booking (Deposit Paid)
    INSERT INTO public.bookings (
        tenant_id, booking_code, property_id, person_id, channel_id, 
        check_in_date, check_out_date, total_amount, booking_status_id, booking_type_id, created_by
    )
    VALUES (
        v_tenant_id, 'BK-FUT-003', v_prop_id, v_guest_id, v_channel_id,
        v_today + INTERVAL '30 days', v_today + INTERVAL '35 days', 2000.00,
        v_booking_status_pend, v_booking_type_comm, v_user_id
    )
    RETURNING id INTO v_booking_future_id;
    
    INSERT INTO public.movements (
        tenant_id, movement_type_id, booking_id, treasury_account_id, amount, movement_date, created_by
    )
    VALUES (v_tenant_id, v_move_type_income, v_booking_future_id, v_account_id, 400.00, v_today, v_user_id);

    -- 4.4 Expense Movement
    INSERT INTO public.movements (
        tenant_id, movement_type_id, service_provider_id, treasury_account_id, amount, movement_date, created_by
    )
    VALUES (v_tenant_id, v_move_type_expense, v_provider_entry_id, v_account_id, 120.00, v_today - INTERVAL '5 days', v_user_id);

    -- ==========================================
    -- STEP 5: PROPERTY GUIDE
    -- ==========================================
    RAISE NOTICE 'Creating property guide...';
    
    INSERT INTO public.property_guides (
        tenant_id, property_id, title, welcome_message, host_names, host_signature, is_active
    )
    VALUES (
        v_tenant_id, v_prop_id, 'Guía de Villa Vista Mar',
        '¡Bienvenidos a vuestro hogar lejos de casa! Esperamos que disfrutéis de una estancia inolvidable.',
        'Antonio & Marta', 'Vuestros anfitriones, Antonio y Marta.', true
    );

    -- House Rules
    INSERT INTO public.house_rules (tenant_id, property_id, title, description, icon, order_index)
    VALUES 
        (v_tenant_id, v_prop_id, 'No Fumar', 'Está estrictamente prohibido fumar dentro de la villa.', 'Trash2', 1),
        (v_tenant_id, v_prop_id, 'No Fiestas', 'Respetar el descanso de los vecinos a partir de las 23:00.', 'Shield', 2);

    -- Practical Info
    INSERT INTO public.practical_info (tenant_id, property_id, title, content, icon, category)
    VALUES 
        (v_tenant_id, v_prop_id, 'WiFi', 'Red: VillaVistaMar_Guest / Pass: marbella2024', 'Wifi', 'internet'),
        (v_tenant_id, v_prop_id, 'Aire Acondicionado', 'El mando se encuentra en el cajón del salón.', 'Wind', 'climatizacion');

    RAISE NOTICE '✅ Demo data generation completed successfully!';

END $$;
