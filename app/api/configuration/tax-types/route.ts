import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getConfigurationTypes, getConfigurationValues } from "@/lib/api/configuration"

export async function GET() {
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

    const types = await getConfigurationTypes(userInfo.tenant_id)
    const taxTypeConfig = types.find(t => t.name === 'tax_type' || t.name === 'Tipo de Impuesto')
    
    if (!taxTypeConfig) {
      return NextResponse.json([])
    }

    const values = await getConfigurationValues(taxTypeConfig.id)
    const activeValues = values.filter(v => v.is_active)

    return NextResponse.json(activeValues)
  } catch (error) {
    console.error("Error in tax-types GET:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

