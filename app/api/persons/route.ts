import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { createPerson } from "@/lib/api/bookings"
import type { CreatePersonData } from "@/types/bookings"

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "No supabase client" }, { status: 500 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userInfo } = await supabase
      .from("users")
      .select("tenant_id")
      .eq("id", user.id)
      .single()

    if (!userInfo) {
      return NextResponse.json({ error: "User info not found" }, { status: 404 })
    }

    const body: CreatePersonData = await request.json()

    if (!body.first_name || !body.last_name) {
      return NextResponse.json(
        { error: "Nombre y apellidos son obligatorios" },
        { status: 400 }
      )
    }

    const person = await createPerson(body, userInfo.tenant_id)

    if (!person) {
      return NextResponse.json(
        { error: "Error creating person. Verifica que el tipo de configuración 'person_type' esté creado." },
        { status: 500 }
      )
    }

    return NextResponse.json(person)
  } catch (error: any) {
    console.error("Error creating person:", error)
    const errorMessage = error?.message || "Error al crear huésped. Verifica que el tipo de configuración 'person_type' esté creado."
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

