import { NextResponse } from 'next/server'
import { getPropertyTenantId } from '@/lib/api/properties-public'
import { getCalendarAvailability } from '@/lib/api/calendar'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get('propertyId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!propertyId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Faltan parámetros: propertyId, startDate, endDate son requeridos' },
        { status: 400 }
      )
    }

    // Obtener tenant_id desde property_id
    const tenantId = await getPropertyTenantId(propertyId)
    if (!tenantId) {
      return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 })
    }

    // Convertir strings a Date
    const start = new Date(startDate)
    const end = new Date(endDate)

    // Reutilizar la función existente que ya tiene toda la lógica
    // Esta función filtra reservas canceladas y maneja períodos cerrados
    const days = await getCalendarAvailability(propertyId, tenantId, start, end)

    return NextResponse.json(days)
  } catch (error: any) {
    console.error('[api/public/calendar] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener disponibilidad' },
      { status: 500 }
    )
  }
}

