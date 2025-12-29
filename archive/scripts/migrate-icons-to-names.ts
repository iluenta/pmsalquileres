/**
 * Script de migración: Convertir códigos Font Awesome a nombres de iconos
 * 
 * Este script actualiza todos los registros en las tablas que usan iconos,
 * convirtiendo códigos Font Awesome (ej: "fas fa-thermometer-half") a nombres
 * de iconos (ej: "Thermometer").
 * 
 * Tablas afectadas:
 * - house_guide_items
 * - guide_sections (tips)
 * - house_rules
 * - apartment_sections
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import { FA_TO_NAME_MAP } from '../lib/utils/icon-registry'

// Cargar variables de entorno desde .env.local
config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables')
    console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
    console.error('\nMake sure these are defined in your .env.local file')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface MigrationResult {
    table: string
    total: number
    updated: number
    skipped: number
    errors: number
}

async function migrateTable(
    tableName: string,
    iconField: string = 'icon'
): Promise<MigrationResult> {
    console.log(`\n📋 Migrando tabla: ${tableName}`)

    const result: MigrationResult = {
        table: tableName,
        total: 0,
        updated: 0,
        skipped: 0,
        errors: 0,
    }

    try {
        // Obtener todos los registros con iconos
        const { data: records, error: fetchError } = await supabase
            .from(tableName)
            .select('id, ' + iconField)

        if (fetchError) {
            console.error(`❌ Error fetching from ${tableName}:`, fetchError)
            return result
        }

        if (!records || records.length === 0) {
            console.log(`ℹ️  No hay registros en ${tableName}`)
            return result
        }

        result.total = records.length
        console.log(`📊 Total de registros: ${result.total}`)

        // Procesar cada registro
        for (const record of (records as any[])) {
            const currentIcon = record[iconField] as string | null

            // Si ya es un nombre de icono (no empieza con "fas fa-"), saltar
            if (!currentIcon || !currentIcon.startsWith('fas fa-')) {
                result.skipped++
                continue
            }

            // Convertir código FA a nombre
            const newIconName = FA_TO_NAME_MAP[currentIcon]

            if (!newIconName) {
                console.warn(`⚠️  No se encontró mapeo para: ${currentIcon} (ID: ${record.id})`)
                result.skipped++
                continue
            }

            // Actualizar el registro
            const { error: updateError } = await supabase
                .from(tableName)
                .update({ [iconField]: newIconName })
                .eq('id', record.id)

            if (updateError) {
                console.error(`❌ Error updating record ${record.id}:`, updateError)
                result.errors++
            } else {
                console.log(`✅ ${currentIcon} → ${newIconName} (ID: ${record.id})`)
                result.updated++
            }
        }

        console.log(`\n✨ Resumen de ${tableName}:`)
        console.log(`   Total: ${result.total}`)
        console.log(`   Actualizados: ${result.updated}`)
        console.log(`   Omitidos: ${result.skipped}`)
        console.log(`   Errores: ${result.errors}`)

        return result

    } catch (error) {
        console.error(`❌ Error en migración de ${tableName}:`, error)
        return result
    }
}

async function runMigration() {
    console.log('🚀 Iniciando migración de iconos...\n')
    console.log('📝 Este script convertirá códigos Font Awesome a nombres de iconos')
    console.log('   Ejemplo: "fas fa-thermometer-half" → "Thermometer"\n')

    const results: MigrationResult[] = []

    // Migrar cada tabla
    results.push(await migrateTable('house_guide_items', 'icon'))
    results.push(await migrateTable('guide_sections', 'icon'))
    results.push(await migrateTable('house_rules', 'icon'))
    results.push(await migrateTable('apartment_sections', 'icon'))

    // Resumen final
    console.log('\n' + '='.repeat(60))
    console.log('📊 RESUMEN FINAL DE MIGRACIÓN')
    console.log('='.repeat(60))

    const totals = results.reduce(
        (acc, r) => ({
            total: acc.total + r.total,
            updated: acc.updated + r.updated,
            skipped: acc.skipped + r.skipped,
            errors: acc.errors + r.errors,
        }),
        { total: 0, updated: 0, skipped: 0, errors: 0 }
    )

    console.log(`\nTotal de registros procesados: ${totals.total}`)
    console.log(`✅ Actualizados: ${totals.updated}`)
    console.log(`⏭️  Omitidos: ${totals.skipped}`)
    console.log(`❌ Errores: ${totals.errors}`)

    if (totals.errors > 0) {
        console.log('\n⚠️  Hubo errores durante la migración. Revisa los logs arriba.')
        process.exit(1)
    } else {
        console.log('\n✨ Migración completada exitosamente!')
    }
}

// Ejecutar migración
runMigration().catch((error) => {
    console.error('❌ Error fatal:', error)
    process.exit(1)
})
