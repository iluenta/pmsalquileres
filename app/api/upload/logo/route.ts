import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { uploadImageServer } from "@/lib/api/storage"

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient()
    if (!supabase) {
      return NextResponse.json({ error: "No supabase client" }, { status: 500 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      )
    }

    // Validar tipo de archivo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, WebP, GIF)" },
        { status: 400 }
      )
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "El archivo es demasiado grande. El tamaño máximo es 5MB" },
        { status: 400 }
      )
    }

    // Subir imagen usando la función del servidor
    try {
      const imageUrl = await uploadImageServer(file, 'sales-channels-logos')

      if (!imageUrl) {
        return NextResponse.json(
          { error: "Error al subir la imagen. Verifica que el bucket 'sales-channels-logos' exista en Supabase Storage." },
          { status: 500 }
        )
      }

      return NextResponse.json({ url: imageUrl })
    } catch (uploadError: any) {
      console.error("Error in upload:", uploadError)
      return NextResponse.json(
        { error: uploadError.message || "Error al subir la imagen. Verifica que el bucket 'sales-channels-logos' exista en Supabase Storage." },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("Error in upload logo:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

