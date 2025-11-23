import { NextResponse } from 'next/server'
import { createPublicBooking } from '@/lib/api/bookings-public'
import { z } from 'zod'

const bookingSchema = z.object({
  property_id: z.string().uuid(),
  check_in_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  check_out_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  number_of_guests: z.number().int().min(1).max(20),
  total_amount: z.number().min(0),
  guest: z.object({
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    email: z.string().email().optional().nullable(),
    phone: z.string().min(1),
    notes: z.string().optional().nullable(),
  }),
  notes: z.string().optional().nullable(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validar datos con Zod
    const validationResult = bookingSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const bookingData = validationResult.data

    // Validar fechas
    const checkIn = new Date(bookingData.check_in_date)
    const checkOut = new Date(bookingData.check_out_date)

    if (checkOut <= checkIn) {
      return NextResponse.json(
        { error: 'La fecha de salida debe ser posterior a la fecha de entrada' },
        { status: 400 }
      )
    }

    // Normalizar null a undefined para compatibilidad con tipos
    const normalizedBookingData = {
      ...bookingData,
      notes: bookingData.notes ?? undefined,
      guest: {
        ...bookingData.guest,
        email: bookingData.guest.email ?? undefined,
        notes: bookingData.guest.notes ?? undefined,
      },
    }

    // Crear la reserva
    const booking = await createPublicBooking(normalizedBookingData)

    return NextResponse.json(booking, { status: 201 })
  } catch (error: any) {
    console.error('[api/public/bookings] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Error al crear la reserva' },
      { status: 500 }
    )
  }
}

