import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import { uploadImageServer } from "@/lib/api/storage"
import { compressImage, validateImageFile } from "@/lib/utils/image-compression"

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

    // Validar archivo (tipo y tamaño máximo 10MB antes de compresión)
    const validation = validateImageFile(file, 10 * 1024 * 1024)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    try {
      // Comprimir imagen antes de subir
      const { buffer, metadata } = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 85,
        format: 'webp',
      })

      // Crear un Blob desde el buffer comprimido (convertir Buffer a Uint8Array)
      const uint8Array = new Uint8Array(buffer)
      const compressedBlob = new Blob([uint8Array], { type: 'image/webp' })
      
      // Generar nombre de archivo con extensión .webp
      const originalName = file.name.replace(/\.[^/.]+$/, '')
      const compressedFile = new File([compressedBlob], `${originalName}.webp`, {
        type: 'image/webp',
      })

      // Subir imagen comprimida
      const imageUrl = await uploadImageServer(compressedFile, 'property-images')

      if (!imageUrl) {
        return NextResponse.json(
          { error: "Error al subir la imagen. Verifica que el bucket 'property-images' exista en Supabase Storage." },
          { status: 500 }
        )
      }

      return NextResponse.json({ 
        url: imageUrl,
        metadata: {
          width: metadata.width,
          height: metadata.height,
          size: buffer.length,
        }
      })
    } catch (uploadError: any) {
      console.error("Error in upload:", uploadError)
      return NextResponse.json(
        { error: uploadError.message || "Error al subir la imagen. Verifica que el bucket 'property-images' exista en Supabase Storage." },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("Error in upload property image:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

