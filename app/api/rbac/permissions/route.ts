import { NextResponse } from "next/server"
import { getPermissions } from "@/lib/api/rbac"

export async function GET() {
    try {
        const permissions = await getPermissions()
        return NextResponse.json(permissions)
    } catch (error: any) {
        console.error("Error in GET /api/rbac/permissions:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
