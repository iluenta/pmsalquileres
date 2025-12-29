import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function verifyIsolation() {
    console.log('--- Inicia Prueba de Aislamiento de Tenant ---')

    try {
        // 1. Intentar leer datos sin sesión
        console.log('\n[1] Probando acceso anónimo...')
        const { data: anonData, error: anonError } = await supabase
            .from('bookings')
            .select('*')
            .limit(1)

        if (anonData && anonData.length > 0) {
            console.error('❌ ERROR: Se pudieron leer reservas sin estar autenticado.')
        } else {
            console.log('✅ ÉXITO: Las reservas están protegidas contra acceso anónimo.')
        }

        // 2. Verificar que las tablas públicas son accesibles
        console.log('\n[2] Probando acceso público a propiedades (Landing)...')
        const { data: publicProps, error: publicError } = await supabase
            .from('properties')
            .select('name, slug')
            .eq('is_active', true)
            .limit(1)

        if (publicProps && publicProps.length > 0) {
            console.log(`✅ ÉXITO: Acceso público a propiedades activo (Ej: ${publicProps[0].name})`)
        } else {
            console.warn('⚠️ AVISO: No se encontraron propiedades públicas o el acceso está bloqueado.')
        }

        // 3. Nota sobre pruebas autenticadas
        console.log('\n[3] Verificación de Multi-tenancy Autenticado')
        console.log('Para verificar el aislamiento total entre Tenant A y Tenant B:')
        console.log('a. Inicie sesión como Usuario A.')
        console.log('b. Intente consultar bookings filtrando por un tenant_id de B.')
        console.log('c. RLS debería devolver 0 resultados o error si el tenant_id no coincide con el del usuario.')

        console.log('\n--- Fin de la Verificación ---')
    } catch (err) {
        console.error('Error durante la verificación:', err)
    }
}

verifyIsolation()
