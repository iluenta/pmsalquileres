import { NextResponse } from "next/server"
import { getUserRoles, updateUserRoles } from "@/lib/api/rbac"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        const roles = await getUserRoles(id)
        return NextResponse.json(roles)
    } catch (error: any) {
        console.error(`Error in GET /api/rbac/users/${id}/roles:`, error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        const body = await request.json()
        if (!Array.isArray(body)) {
            return NextResponse.json({ error: "Expected an array of role IDs" }, { status: 400 })
        }

        await updateUserRoles(id, body)
        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error(`Error in POST /api/rbac/users/${id}/roles:`, error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
