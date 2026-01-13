import { getSupabaseServerClient } from "@/lib/supabase/server"

export interface Role {
    id: string
    tenant_id: string | null
    code: string
    name: string
    description: string | null
    is_system_role: boolean
    created_at: string
}

export interface Permission {
    id: string
    code: string
    description: string | null
    module: string | null
}

export async function getRoles(): Promise<Role[]> {
    const supabase = await getSupabaseServerClient()
    const { data, error } = await supabase
        .from("roles")
        .select("*")
        .order("is_system_role", { ascending: false })
        .order("name", { ascending: true })

    if (error) {
        console.error("[RBAC] Error fetching roles:", error)
        return []
    }
    return data || []
}

export async function createRole(data: { name: string; description?: string; code: string }, tenantId: string): Promise<Role | null> {
    const supabase = await getSupabaseServerClient()
    const { data: role, error } = await supabase
        .from("roles")
        .insert({
            ...data,
            tenant_id: tenantId,
            is_system_role: false
        })
        .select()
        .single()

    if (error) {
        console.error("[RBAC] Error creating role:", error)
        throw error
    }
    return role
}

export async function updateRole(roleId: string, data: { name?: string; description?: string }, tenantId: string): Promise<Role | null> {
    const supabase = await getSupabaseServerClient()
    const { data: role, error } = await supabase
        .from("roles")
        .update(data)
        .eq("id", roleId)
        .eq("tenant_id", tenantId)
        .eq("is_system_role", false) // No permitir editar roles de sistema via normal update
        .select()
        .single()

    if (error) {
        console.error("[RBAC] Error updating role:", error)
        throw error
    }
    return role
}

export async function deleteRole(roleId: string, tenantId: string): Promise<void> {
    const supabase = await getSupabaseServerClient()
    const { error } = await supabase
        .from("roles")
        .delete()
        .eq("id", roleId)
        .eq("tenant_id", tenantId)
        .eq("is_system_role", false)

    if (error) {
        console.error("[RBAC] Error deleting role:", error)
        throw error
    }
}

export async function getPermissions(): Promise<Permission[]> {
    const supabase = await getSupabaseServerClient()
    const { data, error } = await supabase
        .from("permissions")
        .select("*")
        .order("module", { ascending: true })
        .order("code", { ascending: true })

    if (error) {
        console.error("[RBAC] Error fetching permissions:", error)
        return []
    }
    return data || []
}

export async function getRolePermissions(roleId: string): Promise<string[]> {
    const supabase = await getSupabaseServerClient()
    const { data, error } = await supabase
        .from("role_permissions")
        .select("permissions(code)")
        .eq("role_id", roleId)

    if (error) {
        console.error("[RBAC] Error fetching role permissions:", error)
        return []
    }
    return (data as any[]).map(rp => rp.permissions.code)
}

export async function updateRolePermissions(roleId: string, permissionCodes: string[]): Promise<void> {
    const supabase = await getSupabaseServerClient()

    // 1. Obtener IDs de los permisos
    const { data: perms } = await supabase
        .from("permissions")
        .select("id, code")
        .in("code", permissionCodes)

    if (!perms) return

    // 2. Eliminar permisos actuales
    await supabase.from("role_permissions").delete().eq("role_id", roleId)

    // 3. Insertar nuevos permisos
    const mappings = perms.map((p: { id: string }) => ({
        role_id: roleId,
        permission_id: p.id
    }))

    const { error } = await supabase.from("role_permissions").insert(mappings)

    if (error) {
        console.error("[RBAC] Error updating role permissions mapping:", error)
        throw error
    }
}

export async function getUserRoles(userId: string): Promise<Role[]> {
    const supabase = await getSupabaseServerClient()
    const { data, error } = await supabase
        .from("user_roles")
        .select("roles(*)")
        .eq("user_id", userId)

    if (error) {
        console.error("[RBAC] Error fetching user roles:", error)
        return []
    }
    return (data as any[]).map(ur => ur.roles)
}

export async function updateUserRoles(userId: string, roleIds: string[]): Promise<void> {
    const supabase = await getSupabaseServerClient()

    // 1. Eliminar roles actuales
    await supabase.from("user_roles").delete().eq("user_id", userId)

    // 2. Insertar nuevos
    const mappings = roleIds.map(rid => ({
        user_id: userId,
        role_id: rid
    }))

    const { error } = await supabase.from("user_roles").insert(mappings)
    if (error) {
        console.error("[RBAC] Error updating user roles mapping:", error)
        throw error
    }
}
