import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import {
  updatePropertyImage,
  deletePropertyImage,
  setCoverImage,
} from "@/lib/api/property-images"

// PUT: Actualizar imagen (título, orden)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { id: propertyId, imageId } = await params
    const supabase = await getSupabaseServerClient()

    if (!supabase) {
      return NextResponse.json({ error: "No supabase client" }, { status: 500 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Obtener tenant_id del usuario
    const { data: userData } = await supabase
      .from("users")
      .select("tenant_id")
      .eq("id", user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await request.json()
    const { title, sort_order } = body

    const updateData: any = {}
    if (title !== undefined) updateData.title = title.trim()
    if (sort_order !== undefined) updateData.sort_order = sort_order

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No hay datos para actualizar" },
        { status: 400 }
      )
    }

    const image = await updatePropertyImage(
      imageId,
      updateData,
      userData.tenant_id
    )

    return NextResponse.json(image)
  } catch (error: any) {
    console.error("[PUT /api/properties/[id]/images/[imageId]] Error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE: Eliminar imagen
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { id: propertyId, imageId } = await params
    const supabase = await getSupabaseServerClient()

    if (!supabase) {
      return NextResponse.json({ error: "No supabase client" }, { status: 500 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Obtener tenant_id del usuario
    const { data: userData } = await supabase
      .from("users")
      .select("tenant_id")
      .eq("id", user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    await deletePropertyImage(imageId, userData.tenant_id)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("[DELETE /api/properties/[id]/images/[imageId]] Error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

// PATCH: Marcar como portada
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const { id: propertyId, imageId } = await params
    const supabase = await getSupabaseServerClient()

    if (!supabase) {
      return NextResponse.json({ error: "No supabase client" }, { status: 500 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Obtener tenant_id del usuario
    const { data: userData } = await supabase
      .from("users")
      .select("tenant_id")
      .eq("id", user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const image = await setCoverImage(propertyId, imageId, userData.tenant_id)

    return NextResponse.json(image)
  } catch (error: any) {
    console.error("[PATCH /api/properties/[id]/images/[imageId]] Error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

