import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { z } from 'zod'

const validateAccessSchema = z.object({
  propertyId: z.string().uuid(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validar datos con Zod
    const validationResult = validateAccessSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Datos inválidos', 
          details: validationResult.error.errors 
        },
        { status: 400 }
      )
    }

    const { propertyId, firstName, lastName } = validationResult.data

    console.log('[api/public/guides/validate-access] Validando acceso:', { propertyId, firstName, lastName })

    // Usar cliente de servicio (admin) para bypassar RLS en esta API pública
    // Esto es necesario porque necesitamos acceder a bookings y persons sin autenticación
    let supabase
    try {
      supabase = getSupabaseAdmin()
    } catch (error: any) {
      console.error('[api/public/guides/validate-access] Error obteniendo cliente admin:', error)
      return NextResponse.json(
        { success: false, message: 'No se pudo conectar con la base de datos' },
        { status: 500 }
      )
    }

    // 0. Obtener tenant_id de la propiedad para filtrar correctamente
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('id, tenant_id')
      .eq('id', propertyId)
      .single()

    if (propertyError || !property) {
      console.error('[api/public/guides/validate-access] Error obteniendo propiedad:', propertyError)
      return NextResponse.json(
        { success: false, message: 'Propiedad no encontrada.' },
        { status: 404 }
      )
    }

    const tenantId = (property as { id: string; tenant_id: string }).tenant_id
    console.log('[api/public/guides/validate-access] Tenant ID:', tenantId)

    // 1. Primero buscar personas que coincidan con el nombre y apellido
    // Usamos ilike para que sea case-insensitive y permitir coincidencias parciales
    console.log('[api/public/guides/validate-access] Buscando personas con:', { firstName, lastName, tenantId })
    const { data: persons, error: personsError } = await supabase
      .from('persons')
      .select('id, first_name, last_name')
      .eq('tenant_id', tenantId)
      .ilike('first_name', `${firstName}%`)
      .ilike('last_name', `${lastName}%`)
      .eq('is_active', true)
    
    console.log('[api/public/guides/validate-access] Personas encontradas:', persons?.length || 0, persons)

    if (personsError) {
      console.error('[api/public/guides/validate-access] Error buscando personas:', personsError)
      return NextResponse.json(
        { success: false, message: 'Ocurrió un error al validar tu acceso.' },
        { status: 500 }
      )
    }

    if (!persons || persons.length === 0) {
      console.log('[api/public/guides/validate-access] No se encontraron personas con:', { firstName, lastName })
      return NextResponse.json({
        success: false,
        status: 'not_found',
        message: 'No se ha encontrado ninguna reserva con esos datos para esta propiedad.'
      }, { status: 403 })
    }

    // 2. Buscar reservas para esta propiedad y estas personas
    const personIds = persons.map((p: { id: string; first_name: string; last_name: string }) => p.id)
    console.log('[api/public/guides/validate-access] Buscando reservas para:', { propertyId, personIds })
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .eq('property_id', propertyId)
      .in('person_id', personIds)
      .order('check_in_date', { ascending: false })
    
    console.log('[api/public/guides/validate-access] Reservas encontradas:', bookings?.length || 0)

    if (bookingsError) {
      console.error('[api/public/guides/validate-access] Error buscando reservas:', bookingsError)
      return NextResponse.json(
        { success: false, message: 'Ocurrió un error al validar tu acceso.' },
        { status: 500 }
      )
    }

    if (!bookings || bookings.length === 0) {
      console.log('[api/public/guides/validate-access] No se encontraron reservas para:', { propertyId, personIds })
      return NextResponse.json({
        success: false,
        status: 'not_found',
        message: 'No se ha encontrado ninguna reserva con esos datos para esta propiedad.'
      }, { status: 403 })
    }

    // 3. Enriquecer bookings con datos de personas
    const bookingsWithPersons = bookings.map((booking: any) => {
      const person = persons.find((p: { id: string; first_name: string; last_name: string }) => p.id === booking.person_id)
      return {
        ...booking,
        persons: person ? {
          first_name: person.first_name,
          last_name: person.last_name
        } : null
      }
    })

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // 4. Verificar si alguna reserva está dentro de la ventana activa (10 días antes a 1 día después)
    for (const booking of bookingsWithPersons) {
      const checkIn = new Date(booking.check_in_date)
      const checkOut = new Date(booking.check_out_date)

      const windowStart = new Date(checkIn)
      windowStart.setDate(windowStart.getDate() - 10)

      const windowEnd = new Date(checkOut)
      windowEnd.setDate(windowEnd.getDate() + 1)

      if (today >= windowStart && today <= windowEnd) {
        return NextResponse.json({
          success: true,
          status: 'active',
          booking: booking
        }, { status: 200 })
      }
    }

    return NextResponse.json({
      success: false,
      status: 'not_active',
      message: 'Tu reserva no está activa actualmente. El acceso a la guía se habilita 10 días antes de tu llegada y finaliza el día después de tu salida.'
    }, { status: 403 })

  } catch (error: any) {
    console.error('[api/public/guides/validate-access] Error:', error)
    return NextResponse.json(
      { 
        success: false,
        message: error.message || 'Ocurrió un error al validar tu acceso.' 
      },
      { status: 500 }
    )
  }
}

