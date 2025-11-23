import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { getPropertyTenantId } from '@/lib/api/properties-public'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')

    if (!propertyId) {
      return NextResponse.json({ error: 'propertyId es requerido' }, { status: 400 })
    }

    // Obtener tenant_id desde property_id
    const tenantId = await getPropertyTenantId(propertyId)
    if (!tenantId) {
      return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 })
    }

    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: 'Error de servidor' }, { status: 500 })
    }

    // Obtener todas las configuraciones necesarias en paralelo
    const [
      personTypeResult,
      bookingStatusResult,
      bookingTypeResult
    ] = await Promise.all([
      // Obtener tipo de persona "guest"
      supabase
        .from('configuration_types')
        .select('id')
        .eq('tenant_id', tenantId)
        .or('name.eq.person_type,name.eq.Tipo de Persona,name.eq.Tipos de Persona')
        .eq('is_active', true)
        .maybeSingle()
        .then(async (result: { data: { id: string } | null; error: any }) => {
          if (!result.data) return null
          const guestValue = await supabase
            .from('configuration_values')
            .select('id')
            .eq('configuration_type_id', result.data.id)
            .eq('is_active', true)
            .or('value.eq.guest,label.ilike.huésped,label.ilike.guest')
            .maybeSingle()
          return guestValue.data?.id || null
        }),
      
      // Obtener estado de reserva "Pendiente"
      supabase
        .from('configuration_types')
        .select('id')
        .eq('tenant_id', tenantId)
        .or('name.eq.Estado de Reserva,name.eq.Booking Status,name.eq.Estados de Reserva')
        .eq('is_active', true)
        .maybeSingle()
        .then(async (result: { data: { id: string } | null; error: any }) => {
          if (!result.data) return null
          const pendingValue = await supabase
            .from('configuration_values')
            .select('id')
            .eq('configuration_type_id', result.data.id)
            .eq('is_active', true)
            .or('value.eq.pending,label.ilike.pendiente')
            .maybeSingle()
          return pendingValue.data?.id || null
        }),
      
      // Obtener tipo de reserva "commercial"
      supabase
        .from('configuration_types')
        .select('id')
        .eq('tenant_id', tenantId)
        .or('name.eq.Tipo de Reserva,name.eq.Booking Type,name.eq.Tipos de Reserva')
        .eq('is_active', true)
        .maybeSingle()
        .then(async (result: { data: { id: string } | null; error: any }) => {
          if (!result.data) return null
          const commercialValue = await supabase
            .from('configuration_values')
            .select('id')
            .eq('configuration_type_id', result.data.id)
            .eq('is_active', true)
            .or('value.eq.commercial,label.ilike.comercial')
            .maybeSingle()
          return commercialValue.data?.id || null
        })
    ])

    return NextResponse.json({
      guestPersonTypeId: personTypeResult,
      pendingBookingStatusId: bookingStatusResult,
      commercialBookingTypeId: bookingTypeResult,
    })
  } catch (error: any) {
    console.error('[api/public/configuration] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener configuraciones' },
      { status: 500 }
    )
  }
}

