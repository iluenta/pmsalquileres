import { NextResponse } from 'next/server'
import { validateBookingAccess } from '@/lib/api/bookings-public'
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

    // Validar acceso usando la función existente
    const result = await validateBookingAccess(propertyId, firstName, lastName)

    if (result.success) {
      return NextResponse.json(result, { status: 200 })
    } else {
      return NextResponse.json(result, { status: 403 })
    }
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

