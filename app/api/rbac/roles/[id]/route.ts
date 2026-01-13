import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { updateRole, deleteRole } from "@/lib/api/rbac"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        const supabase = await getSupabaseServerClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { data: userInfo } = await supabase.rpc("get_user_info", { p_user_id: user.id })
        const tenantId = userInfo?.[0]?.tenant_id
        if (!tenantId) return NextResponse.json({ error: "Tenant not found" }, { status: 404 })

        const body = await request.json()
        const role = await updateRole(id, body, tenantId)
        return NextResponse.json(role)
    } catch (error: any) {
        console.error(`Error in PUT /api/rbac/roles/${id}:`, error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        const supabase = await getSupabaseServerClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const { data: userInfo } = await supabase.rpc("get_user_info", { p_user_id: user.id })
        const tenantId = userInfo?.[0]?.tenant_id
        if (!tenantId) return NextResponse.json({ error: "Tenant not found" }, { status: 404 })

        await deleteRole(id, tenantId)
        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error(`Error in DELETE /api/rbac/roles/${id}:`, error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
