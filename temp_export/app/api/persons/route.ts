import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getPersons, createPerson } from "@/lib/api/persons"

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const includeInactive = searchParams.get("includeInactive") === "true"
    const personType = searchParams.get("personType") || undefined
    const search = searchParams.get("search") || undefined

    const persons = await getPersons(tenantId, {
      includeInactive,
      personType,
      search,
    })

    return NextResponse.json(persons)
  } catch (error: any) {
    console.error("Error in /api/persons GET:", error)
    return NextResponse.json(
      { error: error.message || "Error al obtener las personas" },
      { status: 500 }
    )
  }
}

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

    const { data: userInfo } = await supabase.rpc("get_user_info", {
      p_user_id: user.id,
    })

    if (!userInfo || userInfo.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const tenantId = userInfo[0].tenant_id

    const body = await request.json()
    const person = await createPerson(body, tenantId)

    if (!person) {
      return NextResponse.json(
        { error: "Error al crear la persona" },
        { status: 500 }
      )
    }

    return NextResponse.json(person, { status: 201 })
  } catch (error: any) {
    console.error("Error in /api/persons POST:", error)
    return NextResponse.json(
      { error: error.message || "Error al crear la persona" },
      { status: 500 }
    )
  }
}
