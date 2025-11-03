import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { searchPersons } from "@/lib/api/bookings"

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

    const { data: userInfo } = await supabase
      .from("users")
      .select("tenant_id")
      .eq("id", user.id)
      .single()

    if (!userInfo) {
      return NextResponse.json({ error: "User info not found" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const searchTerm = searchParams.get("search") || ""
    const category = searchParams.get("category") || "guest"

    const persons = await searchPersons(userInfo.tenant_id, searchTerm, category)

    return NextResponse.json(persons)
  } catch (error) {
    console.error("Error in persons search:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

