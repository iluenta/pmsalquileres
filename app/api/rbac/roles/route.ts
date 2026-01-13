import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { getRoles, createRole } from "@/lib/api/rbac"

export async function GET() {
    try {
        const roles = await getRoles()
        return NextResponse.json(roles)
    } catch (error: any) {
        console.error("Error in GET /api/rbac/roles:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await getSupabaseServerClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        // Obtener tenant_id del usuario
        const { data: userInfo } = await supabase.rpc("get_user_info", { p_user_id: user.id })
        if (!userInfo || userInfo.length === 0) return NextResponse.json({ error: "User info not found" }, { status: 404 })

        const tenantId = userInfo[0].tenant_id
        const body = await request.json()

        if (!body.name || !body.code) {
            return NextResponse.json({ error: "Name and code are required" }, { status: 400 })
        }

        const role = await createRole(body, tenantId)
        return NextResponse.json(role)
    } catch (error: any) {
        console.error("Error in POST /api/rbac/roles:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
