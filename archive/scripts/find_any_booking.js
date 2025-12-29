const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function findAnyBooking() {
    const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
      id,
      check_in_date,
      check_out_date,
      property_id,
      properties ( slug ),
      persons (
        first_name,
        last_name
      )
    `)
        .limit(10);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Bookings found:', JSON.stringify(bookings, null, 2));
}

findAnyBooking();
