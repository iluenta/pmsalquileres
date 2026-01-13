import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  try {
    const { email, password, fullName, tenantName } = await request.json()

    // Validaciones
    if (!email || !password || !fullName || !tenantName) {
      return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 })
    }

    const supabaseAdmin = getSupabaseAdmin()

    // Verificar si el usuario ya existe en Auth
    const { data: existingAuthUser, error: listError } = await supabaseAdmin.auth.admin.listUsers()

    if (!listError && existingAuthUser?.users) {
      const userExists = existingAuthUser.users.some((u) => u.email === email)

      if (userExists) {
        return NextResponse.json(
          {
            error: "Ya existe un usuario con este correo electrónico. Si crees que esto es un error, contacta al administrador del sistema para limpiar los datos."
          },
          { status: 409 },
        )
      }
    }

    // 1. Crear el tenant (usando admin client que bypasea RLS)
    const tenantResult = await supabaseAdmin
      .from("tenants")
      .insert({
        name: tenantName,
        slug: tenantName.toLowerCase().replace(/\s+/g, "-"),
        is_active: true,
      } as any)
      .select()
      .single()

    if (tenantResult.error) {
      console.error("[v0] Error creating tenant:", tenantResult.error)
      return NextResponse.json({ error: "Error al crear la organización: " + tenantResult.error.message }, { status: 500 })
    }

    const tenantData = tenantResult.data as any

    // 2. Crear el usuario en Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmar el email para desarrollo
      user_metadata: {
        full_name: fullName,
        tenant_id: tenantData.id,
      },
    })

    if (authError) {
      console.error("[v0] Error creating auth user:", authError)
      // Rollback: eliminar el tenant si falla la creación del usuario
      await supabaseAdmin.from("tenants").delete().eq("id", tenantData.id)
      return NextResponse.json({ error: "Error al crear el usuario: " + authError.message }, { status: 500 })
    }

    // 3. Crear el registro en la tabla users (usando admin client)
    if (authData.user) {
      // Verificar si el usuario ya existe en public.users (por si acaso)
      const { data: existingUser } = await supabaseAdmin
        .from("users")
        .select("id")
        .eq("id", authData.user.id)
        .single()

      if (existingUser) {
        console.log("[v0] User already exists in public.users, skipping insert")
        return NextResponse.json({
          success: true,
          message: "Usuario ya existe, iniciando sesión...",
          tenantId: tenantData.id,
        })
      }

      const { error: userError } = await supabaseAdmin.from("users").insert({
        id: authData.user.id,
        tenant_id: tenantData.id,
        email: email,
        full_name: fullName,
        is_admin: true, // El primer usuario del tenant es siempre admin
        is_active: true,
      } as any)

      if (userError) {
        console.error("[v0] Error creating user record:", userError)

        // Si es error de clave duplicada, no hacer rollback completo
        if (userError.code === '23505') {
          console.log("[v0] Duplicate key error - user already exists, continuing...")
          return NextResponse.json({
            success: true,
            message: "Usuario creado exitosamente (ya existía)",
            tenantId: tenantData.id,
          })
        }

        // Para otros errores, hacer rollback completo
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        await supabaseAdmin.from("tenants").delete().eq("id", tenantData.id)
        return NextResponse.json(
          { error: "Error al crear el perfil de usuario: " + userError.message },
          { status: 500 },
        )
      }

      // 4. Asignar rol ADMIN inicial
      const roleResponse: any = await supabaseAdmin
        .from("roles")
        .select("id")
        .eq("code", "admin")
        .is("tenant_id", null)
        .single()

      const roleData = roleResponse?.data

      if (roleData) {
        await (supabaseAdmin.from("user_roles") as any).insert({
          user_id: authData.user.id,
          role_id: roleData.id
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Usuario creado exitosamente",
      tenantId: tenantData.id,
    })
  } catch (error) {
    console.error("[v0] Unexpected error in register:", error)
    return NextResponse.json({ error: "Error inesperado al crear la cuenta" }, { status: 500 })
  }
}
