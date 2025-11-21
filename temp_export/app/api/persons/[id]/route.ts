import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getPersonById, updatePerson, deletePerson } from "@/lib/api/persons"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "No supabase client" }, { status: 500 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userInfo } = await supabase.rpc("get_user_info", {
      p_user_id: user.id,
    })

    if (!userInfo || userInfo.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const tenantId = userInfo[0].tenant_id

    const { id } = await params
    const person = await getPersonById(id, tenantId)

    if (!person) {
      return NextResponse.json({ error: "Persona no encontrada" }, { status: 404 })
    }

    return NextResponse.json(person)
  } catch (error: any) {
    console.error("Error in /api/persons/[id] GET:", error)
    return NextResponse.json(
      { error: error.message || "Error al obtener la persona" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "No supabase client" }, { status: 500 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userInfo } = await supabase.rpc("get_user_info", {
      p_user_id: user.id,
    })

    if (!userInfo || userInfo.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const tenantId = userInfo[0].tenant_id

    const { id } = await params
    const body = await request.json()
    const person = await updatePerson(id, body, tenantId)

    if (!person) {
      return NextResponse.json(
        { error: "Error al actualizar la persona" },
        { status: 500 }
      )
    }

    return NextResponse.json(person)
  } catch (error: any) {
    console.error("Error in /api/persons/[id] PUT:", error)
    return NextResponse.json(
      { error: error.message || "Error al actualizar la persona" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "No supabase client" }, { status: 500 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userInfo } = await supabase.rpc("get_user_info", {
      p_user_id: user.id,
    })

    if (!userInfo || userInfo.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const tenantId = userInfo[0].tenant_id

    const { id } = await params
    const result = await deletePerson(id, tenantId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Error al eliminar la persona" },
        { status: 400 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in /api/persons/[id] DELETE:", error)
    
    // Detectar error de foreign key constraint - verificar tanto details como message
    if (error.code === '23503') {
      const errorText = `${error.details || ''} ${error.message || ''}`.toLowerCase()
      let errorMessage = "No se puede eliminar esta persona porque está siendo utilizada en el sistema."
      
      if (errorText.includes('bookings') || errorText.includes('reserva')) {
        errorMessage = "No se puede eliminar esta persona porque tiene reservas asociadas. Por favor, elimine primero las reservas o marque la persona como inactiva."
      } else if (errorText.includes('service_providers') || errorText.includes('proveedor')) {
        errorMessage = "No se puede eliminar esta persona porque está asociada a un proveedor de servicios. Elimine primero el proveedor de servicios."
      } else if (errorText.includes('sales_channels') || errorText.includes('canal')) {
        errorMessage = "No se puede eliminar esta persona porque está asociada a un canal de venta. Elimine primero el canal de venta."
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || "Error al eliminar la persona" },
      { status: 500 }
    )
  }
}

