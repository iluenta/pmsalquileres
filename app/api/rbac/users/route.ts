import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

export async function GET() {
    try {
        const supabase = await getSupabaseServerClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        // Obtener tenant_id
        const { data: userInfo } = await supabase.rpc("get_user_info", { p_user_id: user.id })
        const tenantId = userInfo?.[0]?.tenant_id
        if (!tenantId) return NextResponse.json({ error: "Tenant not found" }, { status: 404 })

        // Listar usuarios del mismo tenant
        const { data: users, error } = await supabase
            .from("users")
            .select("id, email, full_name, is_admin")
            .eq("tenant_id", tenantId)
            .order("full_name", { ascending: true })

        if (error) throw error

        return NextResponse.json(users)
    } catch (error: any) {
        console.error("Error in GET /api/rbac/users:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
