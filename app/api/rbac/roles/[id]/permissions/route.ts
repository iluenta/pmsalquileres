import { NextResponse } from "next/server"
import { getRolePermissions, updateRolePermissions } from "@/lib/api/rbac"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        const permissions = await getRolePermissions(id)
        return NextResponse.json(permissions)
    } catch (error: any) {
        console.error(`Error in GET /api/rbac/roles/${id}/permissions:`, error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        const body = await request.json()
        if (!Array.isArray(body)) {
            return NextResponse.json({ error: "Expected an array of permission codes" }, { status: 400 })
        }

        await updateRolePermissions(id, body)
        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error(`Error in POST /api/rbac/roles/${id}/permissions:`, error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
