const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function findBooking() {
    // Primero buscamos el ID de la propiedad 'veratespera'
    const { data: prop } = await supabase
        .from('properties')
        .select('id')
        .eq('slug', 'veratespera')
        .single();

    if (!prop) {
        console.error('Propiedad no encontrada');
        return;
    }

    // Ahora buscamos reservas para esa propiedad
    // Queremos una reserva que esté "activa" o cercana para poder entrar
    const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
      id,
      check_in_date,
      check_out_date,
      persons (
        first_name,
        last_name
      )
    `)
        .eq('property_id', prop.id)
        .limit(5);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Bookings found:', JSON.stringify(bookings, null, 2));
}

findBooking();
