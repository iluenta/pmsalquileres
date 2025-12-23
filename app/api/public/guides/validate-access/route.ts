import { NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
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

    // Validar acceso directamente en la ruta API
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json(
        { success: false, message: 'No se pudo conectar con la base de datos' },
        { status: 500 }
      )
    }

    // 1. Buscar reservas para esta propiedad y este huésped
    // Usamos ilike para que sea case-insensitive
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        persons!inner (
          first_name,
          last_name
        )
      `)
      .eq('property_id', propertyId)
      .ilike('persons.first_name', `${firstName}%`)
      .ilike('persons.last_name', `${lastName}%`)
      .order('check_in_date', { ascending: false })

    if (error) {
      console.error('[api/public/guides/validate-access] Error:', error)
      return NextResponse.json(
        { success: false, message: 'Ocurrió un error al validar tu acceso.' },
        { status: 500 }
      )
    }

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({
        success: false,
        status: 'not_found',
        message: 'No se ha encontrado ninguna reserva con esos datos para esta propiedad.'
      }, { status: 403 })
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

    // 2. Verificar si alguna reserva está dentro de la ventana activa (10 días antes a 1 día después)
    for (const booking of bookings) {
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

