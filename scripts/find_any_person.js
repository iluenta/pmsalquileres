const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function findAnyPerson() {
    const { data: persons, error } = await supabase
        .from('persons')
        .select('first_name, last_name, id')
        .limit(10);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Persons found:', persons);
}

findAnyPerson();
