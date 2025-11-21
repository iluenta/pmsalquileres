import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import type { CreateExpenseItemData } from "@/types/movements"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
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
    const movementId = params.id

    // Verificar que el movimiento pertenece al tenant
    const { data: movement, error: movementError } = await supabase
      .from("movements")
      .select("id, tenant_id")
      .eq("id", movementId)
      .eq("tenant_id", tenantId)
      .single()

    if (movementError || !movement) {
      return NextResponse.json(
        { error: "Movimiento no encontrado" },
        { status: 404 }
      )
    }

    // Obtener los expense items
    const { data: items, error } = await supabase
      .from("movement_expense_items")
      .select(`
        *,
        service_provider_service:service_provider_services(
          id,
          service_type:configuration_values!service_provider_services_service_type_id_fkey(id, label)
        ),
        tax_type:configuration_values!movement_expense_items_tax_type_id_fkey(id, label, value, description)
      `)
      .eq("movement_id", movementId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching expense items:", error)
      return NextResponse.json(
        { error: "Error al obtener los items del gasto" },
        { status: 500 }
      )
    }

    return NextResponse.json(items || [])
  } catch (error: any) {
    console.error("Error in GET /api/movements/[id]/expense-items:", error)
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
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
    const movementId = params.id

    // Verificar que el movimiento pertenece al tenant y es de tipo gasto
    const { data: movement, error: movementError } = await supabase
      .from("movements")
      .select("id, tenant_id, movement_type_id, service_provider_id")
      .eq("id", movementId)
      .eq("tenant_id", tenantId)
      .single()

    if (movementError || !movement) {
      return NextResponse.json(
        { error: "Movimiento no encontrado" },
        { status: 404 }
      )
    }

    // Verificar que es un gasto
    const { data: movementType } = await supabase
      .from("configuration_values")
      .select("value, label")
      .eq("id", movement.movement_type_id)
      .single()

    if (movementType?.value !== "expense" && movementType?.label !== "Gasto") {
      return NextResponse.json(
        { error: "Solo se pueden añadir items a movimientos de tipo Gasto" },
        { status: 400 }
      )
    }

    const body: CreateExpenseItemData = await request.json()

    // Validaciones
    if (!body.service_name || body.service_name.trim() === "") {
      return NextResponse.json(
        { error: "El nombre del servicio es obligatorio" },
        { status: 400 }
      )
    }

    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { error: "El importe debe ser mayor que 0" },
        { status: 400 }
      )
    }

    // Si hay service_provider_service_id, verificar que pertenece al proveedor del movimiento
    if (body.service_provider_service_id && movement.service_provider_id) {
      const { data: service, error: serviceError } = await supabase
        .from("service_provider_services")
        .select("id, service_provider_id")
        .eq("id", body.service_provider_service_id)
        .eq("service_provider_id", movement.service_provider_id)
        .single()

      if (serviceError || !service) {
        return NextResponse.json(
          { error: "El servicio no pertenece al proveedor del movimiento" },
          { status: 400 }
        )
      }
    }

    // Calcular total_amount si no se proporciona
    const taxAmount = body.tax_amount ?? 0
    const totalAmount = body.total_amount ?? (body.amount + taxAmount)

    // Crear el item
    const { data: item, error } = await supabase
      .from("movement_expense_items")
      .insert({
        movement_id: movementId,
        service_provider_service_id: body.service_provider_service_id || null,
        service_name: body.service_name.trim(),
        amount: body.amount,
        tax_type_id: body.tax_type_id || null,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        notes: body.notes?.trim() || null,
      })
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
      console.error("Error creating expense item:", error)
      return NextResponse.json(
        { error: "Error al crear el item del gasto" },
        { status: 500 }
      )
    }

    // Recalcular el total del movimiento
    await recalculateMovementTotal(supabase, movementId)

    return NextResponse.json(item, { status: 201 })
  } catch (error: any) {
    console.error("Error in POST /api/movements/[id]/expense-items:", error)
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

