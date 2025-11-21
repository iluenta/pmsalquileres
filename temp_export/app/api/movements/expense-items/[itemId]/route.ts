import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { UpdateExpenseItemData } from "@/types/movements"

export async function PUT(
  request: Request,
  { params }: { params: { itemId: string } }
) {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "Error de conexión" }, { status: 500 })
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { data: userInfo } = await supabase.rpc("get_user_info", {
      p_user_id: user.id,
    })

    if (!userInfo || userInfo.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const tenantId = userInfo[0].tenant_id
    const itemId = params.itemId

    // Verificar que el item pertenece a un movimiento del tenant
    const { data: item, error: itemError } = await supabase
      .from("movement_expense_items")
      .select(`
        *,
        movement:movements!inner(id, tenant_id, service_provider_id)
      `)
      .eq("id", itemId)
      .single()

    if (itemError || !item || item.movement.tenant_id !== tenantId) {
      return NextResponse.json(
        { error: "Item no encontrado" },
        { status: 404 }
      )
    }

    const body: UpdateExpenseItemData = await request.json()

    // Validaciones
    if (body.service_name !== undefined && body.service_name.trim() === "") {
      return NextResponse.json(
        { error: "El nombre del servicio no puede estar vacío" },
        { status: 400 }
      )
    }

    if (body.amount !== undefined && body.amount <= 0) {
      return NextResponse.json(
        { error: "El importe debe ser mayor que 0" },
        { status: 400 }
      )
    }

    // Si hay service_provider_service_id, verificar que pertenece al proveedor del movimiento
    if (body.service_provider_service_id && item.movement.service_provider_id) {
      const { data: service, error: serviceError } = await supabase
        .from("service_provider_services")
        .select("id, service_provider_id")
        .eq("id", body.service_provider_service_id)
        .eq("service_provider_id", item.movement.service_provider_id)
        .single()

      if (serviceError || !service) {
        return NextResponse.json(
          { error: "El servicio no pertenece al proveedor del movimiento" },
          { status: 400 }
        )
      }
    }

    // Preparar datos de actualización
    const updateData: any = {}
    if (body.service_provider_service_id !== undefined) {
      updateData.service_provider_service_id = body.service_provider_service_id || null
    }
    if (body.service_name !== undefined) {
      updateData.service_name = body.service_name.trim()
    }
    if (body.amount !== undefined) {
      updateData.amount = body.amount
    }
    if (body.tax_type_id !== undefined) {
      updateData.tax_type_id = body.tax_type_id || null
    }
    if (body.tax_amount !== undefined) {
      updateData.tax_amount = body.tax_amount
    }
    if (body.total_amount !== undefined) {
      updateData.total_amount = body.total_amount
    }
    if (body.notes !== undefined) {
      updateData.notes = body.notes?.trim() || null
    }

    // Actualizar el item
    const { data: updatedItem, error } = await supabase
      .from("movement_expense_items")
      .update(updateData)
      .eq("id", itemId)
      .select(`
        *,
        service_provider_service:service_provider_services(
          id,
          service_type:configuration_values!service_provider_services_service_type_id_fkey(id, label)
        ),
        tax_type:configuration_values!movement_expense_items_tax_type_id_fkey(id, label, value, description)
      `)
      .single()

    if (error) {
      console.error("Error updating expense item:", error)
      return NextResponse.json(
        { error: "Error al actualizar el item del gasto" },
        { status: 500 }
      )
    }

    // Recalcular el total del movimiento
    await recalculateMovementTotal(supabase, item.movement.id)

    return NextResponse.json(updatedItem)
  } catch (error: any) {
    console.error("Error in PUT /api/movements/expense-items/[itemId]:", error)
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { itemId: string } }
) {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "Error de conexión" }, { status: 500 })
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { data: userInfo } = await supabase.rpc("get_user_info", {
      p_user_id: user.id,
    })

    if (!userInfo || userInfo.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const tenantId = userInfo[0].tenant_id
    const itemId = params.itemId

    // Verificar que el item pertenece a un movimiento del tenant
    const { data: item, error: itemError } = await supabase
      .from("movement_expense_items")
      .select(`
        movement_id,
        movement:movements!inner(id, tenant_id)
      `)
      .eq("id", itemId)
      .single()

    if (itemError || !item || item.movement.tenant_id !== tenantId) {
      return NextResponse.json(
        { error: "Item no encontrado" },
        { status: 404 }
      )
    }

    // Verificar que no es el último item
    const { data: items, error: itemsError } = await supabase
      .from("movement_expense_items")
      .select("id")
      .eq("movement_id", item.movement_id)

    if (itemsError) {
      return NextResponse.json(
        { error: "Error al verificar items del movimiento" },
        { status: 500 }
      )
    }

    if (items && items.length <= 1) {
      return NextResponse.json(
        { error: "No se puede eliminar el último item del gasto. Un gasto debe tener al menos un servicio." },
        { status: 400 }
      )
    }

    // Eliminar el item
    const { error: deleteError } = await supabase
      .from("movement_expense_items")
      .delete()
      .eq("id", itemId)

    if (deleteError) {
      console.error("Error deleting expense item:", deleteError)
      return NextResponse.json(
        { error: "Error al eliminar el item del gasto" },
        { status: 500 }
      )
    }

    // Recalcular el total del movimiento
    await recalculateMovementTotal(supabase, item.movement_id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in DELETE /api/movements/expense-items/[itemId]:", error)
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    )
  }
}

// Función helper para recalcular el total del movimiento
async function recalculateMovementTotal(supabase: any, movementId: string) {
  const { data: items } = await supabase
    .from("movement_expense_items")
    .select("total_amount")
    .eq("movement_id", movementId)

  if (items && items.length > 0) {
    const total = items.reduce((sum: number, item: { total_amount: number }) => {
      return sum + Number(item.total_amount || 0)
    }, 0)

    await supabase
      .from("movements")
      .update({ amount: total })
      .eq("id", movementId)
  }
}

