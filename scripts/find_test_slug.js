const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function findSlug() {
    const { data, error } = await supabase
        .from('properties')
        .select('slug, name')
        .eq('is_active', true)
        .limit(5);

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('Slugs found:', data);
}

findSlug();
