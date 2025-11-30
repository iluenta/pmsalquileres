import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"
import {
  getPropertyImages,
  createPropertyImage,
} from "@/lib/api/property-images"
import { compressImage, validateImageFile } from "@/lib/utils/image-compression"
import { uploadImageServer } from "@/lib/api/storage"

// GET: Obtener todas las imágenes de una propiedad
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params
    const supabase = await getSupabaseServerClient()

    if (!supabase) {
      return NextResponse.json({ error: "No supabase client" }, { status: 500 })
    }

    // Obtener tenant_id del usuario o de la propiedad
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Obtener tenant_id del usuario
    const { data: userData } = await supabase
      .from("users")
      .select("tenant_id")
      .eq("id", user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const images = await getPropertyImages(propertyId, userData.tenant_id)
    return NextResponse.json(images)
  } catch (error: any) {
    console.error("[GET /api/properties/[id]/images] Error:", error)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

// POST: Subir nueva imagen a la galería
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: propertyId } = await params
    const supabase = await getSupabaseServerClient()

    if (!supabase) {
      return NextResponse.json({ error: "No supabase client" }, { status: 500 })
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Obtener tenant_id del usuario
    const { data: userData } = await supabase
      .from("users")
      .select("tenant_id")
      .eq("id", user.id)
      .single()

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const isCover = formData.get("is_cover") === "true"

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo" },
        { status: 400 }
      )
    }

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "El título es obligatorio" },
        { status: 400 }
      )
    }

    // Validar archivo
    const validation = validateImageFile(file, 10 * 1024 * 1024)
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Comprimir imagen
    let buffer: Buffer
    try {
      const compressed = await compressImage(file, {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 85,
        format: 'webp',
      })
      buffer = compressed.buffer
    } catch (compressError: any) {
      console.error("[POST /api/properties/[id]/images] Error comprimiendo:", compressError)
      return NextResponse.json(
        { error: `Error al comprimir la imagen: ${compressError.message}` },
        { status: 500 }
      )
    }

    // Subir imagen comprimida directamente desde el buffer usando cliente admin
    try {
      const originalName = file.name.replace(/\.[^/.]+$/, '')
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}-${originalName}.webp`
      
      // Convertir Buffer a Uint8Array para Supabase
      const uint8Array = new Uint8Array(buffer)
      
      // Usar cliente admin para evitar problemas de RLS
      const { getSupabaseAdmin } = await import('@/lib/supabase/admin')
      let adminClient
      
      try {
        adminClient = getSupabaseAdmin()
      } catch (adminError: any) {
        console.error("[POST /api/properties/[id]/images] Error obteniendo cliente admin:", adminError)
        return NextResponse.json(
          { error: `Error de configuración: ${adminError.message}. Verifica las variables de entorno de Supabase.` },
          { status: 500 }
        )
      }
      
      // Intentar subir directamente - si falla, intentaremos crear el bucket
      console.log("[POST /api/properties/[id]/images] Subiendo archivo:", fileName, "Tamaño:", uint8Array.length, "bytes")
      
      let uploadData, uploadError
      
      try {
        const result = await adminClient.storage
          .from('property-images')
          .upload(fileName, uint8Array, {
            cacheControl: '3600',
            upsert: false,
            contentType: 'image/webp',
          })
        
        uploadData = result.data
        uploadError = result.error
      } catch (uploadException: any) {
        console.error("[POST /api/properties/[id]/images] Excepción durante upload:", uploadException)
        // Si es un error de parsing JSON (HTML response), probablemente el bucket no existe
        if (uploadException.message?.includes('Unexpected token') || uploadException.message?.includes('<html>')) {
          console.warn("[POST /api/properties/[id]/images] Parece que el bucket no existe, intentando crearlo...")
          
          try {
            const { data: bucketData, error: createError } = await adminClient.storage.createBucket('property-images', {
              public: true,
              fileSizeLimit: 10485760, // 10MB
              allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
            })
            
            if (createError) {
              console.error("[POST /api/properties/[id]/images] Error creando bucket:", createError)
              return NextResponse.json(
                { error: `El bucket 'property-images' no existe. Por favor, créalo manualmente en Supabase Dashboard > Storage > New bucket (nombre: property-images, público: sí).` },
                { status: 500 }
              )
            }
            
            console.log("[POST /api/properties/[id]/images] Bucket creado exitosamente, reintentando upload...")
            
            // Reintentar el upload después de crear el bucket
            const retryResult = await adminClient.storage
              .from('property-images')
              .upload(fileName, uint8Array, {
                cacheControl: '3600',
                upsert: false,
                contentType: 'image/webp',
              })
            
            uploadData = retryResult.data
            uploadError = retryResult.error
          } catch (createException: any) {
            console.error("[POST /api/properties/[id]/images] Error al crear bucket:", createException)
            return NextResponse.json(
              { error: `No se pudo crear el bucket automáticamente. Por favor, créalo manualmente en Supabase Dashboard > Storage.` },
              { status: 500 }
            )
          }
        } else {
          throw uploadException
        }
      }

      if (uploadError) {
        console.error("[POST /api/properties/[id]/images] Error en upload:", uploadError)
        console.error("[POST /api/properties/[id]/images] Error details:", JSON.stringify(uploadError, null, 2))
        
        return NextResponse.json(
          { error: `Error al subir la imagen: ${uploadError.message || 'Error desconocido'}` },
          { status: 500 }
        )
      }

      if (!uploadData) {
        return NextResponse.json(
          { error: "Error al subir la imagen: No se recibieron datos" },
          { status: 500 }
        )
      }

      console.log("[POST /api/properties/[id]/images] Archivo subido exitosamente:", uploadData.path)

      // Obtener URL pública
      const { data: { publicUrl } } = adminClient.storage
        .from('property-images')
        .getPublicUrl(uploadData.path)

      const imageUrl = publicUrl
      if (!imageUrl) {
        return NextResponse.json(
          { error: "Error al subir la imagen a Supabase Storage" },
          { status: 500 }
        )
      }

      // Obtener número de imágenes existentes para el sort_order
      const existingImages = await getPropertyImages(propertyId, userData.tenant_id)

      // Crear registro en la base de datos
      const image = await createPropertyImage(
        {
          property_id: propertyId,
          tenant_id: userData.tenant_id,
          image_url: imageUrl,
          title: title.trim(),
          is_cover: isCover,
          sort_order: existingImages.length,
        },
        user.id
      )

      return NextResponse.json(image, { status: 201 })
    } catch (uploadError: any) {
      console.error("[POST /api/properties/[id]/images] Error en upload o creación:", uploadError)
      return NextResponse.json(
        { error: `Error al procesar la imagen: ${uploadError.message}` },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error("[POST /api/properties/[id]/images] Error general:", error)
    console.error("[POST /api/properties/[id]/images] Stack:", error.stack)
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    )
  }
}

