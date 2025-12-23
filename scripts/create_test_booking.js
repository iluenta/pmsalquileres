const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestBooking() {
    const { data: prop } = await supabase
        .from('properties')
        .select('id, tenant_id')
        .eq('slug', 'veratespera')
        .single();

    if (!prop) {
        console.error('Propiedad no encontrada');
        return;
    }

    // Crear una persona de prueba
    // Necesitamos un tipo de persona "guest". Buscamos uno.
    const { data: personType } = await supabase
        .from('configuration_values')
        .select('id')
        .ilike('label', '%huésped%')
        .limit(1)
        .single();

    const { data: person, error: personError } = await supabase
        .from('persons')
        .insert({
            tenant_id: prop.tenant_id,
            first_name: 'PEDRO',
            last_name: 'RAMIREZ',
            person_type: personType?.id,
            is_active: true
        })
        .select()
        .single();

    if (personError) {
        console.error('Error creando persona:', personError);
        return;
    }

    // Crear la reserva
    const today = new Date();
    const checkIn = new Date(today);
    const checkOut = new Date(today);
    checkOut.setDate(checkOut.getDate() + 5);

    const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .insert({
            tenant_id: prop.tenant_id,
            property_id: prop.id,
            person_id: person.id,
            check_in_date: checkIn.toISOString().split('T')[0],
            check_out_date: checkOut.toISOString().split('T')[0],
            booking_code: 'TEST-LOGIN',
            total_amount: 100,
            is_active: true
        })
        .select()
        .single();

    if (bookingError) {
        console.error('Error creando reserva:', bookingError);
        return;
    }

    console.log('Test booking created successfully:', booking);
    console.log('Login should work with: RAMIREZPE');
}

createTestBooking();
