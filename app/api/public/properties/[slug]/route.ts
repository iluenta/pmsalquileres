import { NextResponse } from 'next/server'
import { getPropertyBySlugPublic } from '@/lib/api/properties-public'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    if (!slug) {
      return NextResponse.json({ error: 'Slug es requerido' }, { status: 400 })
    }

    const property = await getPropertyBySlugPublic(slug)

    if (!property) {
      return NextResponse.json({ error: 'Propiedad no encontrada' }, { status: 404 })
    }

    return NextResponse.json(property)
  } catch (error: any) {
    console.error('[api/public/properties] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Error al obtener la propiedad' },
      { status: 500 }
    )
  }
}

