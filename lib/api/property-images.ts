// Funciones para gestionar la galería de imágenes de propiedades

import { getSupabaseServerClient } from "@/lib/supabase/server"
import { createClient } from '@supabase/supabase-js'
import type {
  PropertyImage,
  CreatePropertyImageData,
  UpdatePropertyImageData,
} from "@/types/property-images"

// Cliente público para acceso sin autenticación
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabasePublic = createClient(supabaseUrl, supabaseAnonKey)

/**
 * Obtiene todas las imágenes de una propiedad
 */
export async function getPropertyImages(
  propertyId: string,
  tenantId: string
): Promise<PropertyImage[]> {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from("property_images")
    .select("*")
    .eq("property_id", propertyId)
    .eq("tenant_id", tenantId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })

  if (error) {
    console.error("[getPropertyImages] Error:", error)
    throw new Error(`Error al obtener imágenes: ${error.message}`)
  }

  return (data || []) as PropertyImage[]
}

/**
 * Obtiene la imagen de portada de una propiedad
 */
export async function getCoverImage(
  propertyId: string,
  tenantId: string
): Promise<PropertyImage | null> {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from("property_images")
    .select("*")
    .eq("property_id", propertyId)
    .eq("tenant_id", tenantId)
    .eq("is_cover", true)
    .maybeSingle()

  if (error) {
    console.error("[getCoverImage] Error:", error)
    return null
  }

  return (data as PropertyImage) || null
}

/**
 * Obtiene todas las imágenes de una propiedad (acceso público)
 * Para uso en landing pública
 */
export async function getPropertyImagesPublic(
  propertyId: string
): Promise<PropertyImage[]> {
  const { data, error } = await supabasePublic
    .from("property_images")
    .select("*")
    .eq("property_id", propertyId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })

  if (error) {
    console.error("[getPropertyImagesPublic] Error:", error)
    return []
  }

  return (data || []) as PropertyImage[]
}

/**
 * Crea una nueva imagen en la galería
 */
export async function createPropertyImage(
  data: CreatePropertyImageData,
  userId?: string
): Promise<PropertyImage> {
  const supabase = await getSupabaseServerClient()

  // Verificar que no haya más de 20 imágenes
  const existingImages = await getPropertyImages(data.property_id, data.tenant_id)
  if (existingImages.length >= 20) {
    throw new Error("Se ha alcanzado el límite máximo de 20 imágenes por propiedad")
  }

  // Si se marca como portada, asegurar que no haya otra portada
  const insertData: any = {
    ...data,
    is_cover: data.is_cover || false,
    sort_order: data.sort_order ?? existingImages.length,
    created_by: userId || null,
  }

  const { data: image, error } = await supabase
    .from("property_images")
    .insert(insertData)
    .select()
    .single()

  if (error) {
    console.error("[createPropertyImage] Error:", error)
    throw new Error(`Error al crear imagen: ${error.message}`)
  }

  return image as PropertyImage
}

/**
 * Actualiza una imagen existente
 */
export async function updatePropertyImage(
  id: string,
  data: UpdatePropertyImageData,
  tenantId: string
): Promise<PropertyImage> {
  const supabase = await getSupabaseServerClient()

  // Verificar que la imagen pertenece al tenant
  const { data: existing } = await supabase
    .from("property_images")
    .select("tenant_id")
    .eq("id", id)
    .single()

  if (!existing || existing.tenant_id !== tenantId) {
    throw new Error("No se encontró la imagen o no tienes permisos para actualizarla")
  }

  const { data: image, error } = await supabase
    .from("property_images")
    .update(data)
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("[updatePropertyImage] Error:", error)
    throw new Error(`Error al actualizar imagen: ${error.message}`)
  }

  return image as PropertyImage
}

/**
 * Elimina una imagen
 */
export async function deletePropertyImage(
  id: string,
  tenantId: string
): Promise<void> {
  const supabase = await getSupabaseServerClient()

  // Obtener la imagen con su URL antes de eliminarla
  const { data: existing, error: fetchError } = await supabase
    .from("property_images")
    .select("tenant_id, image_url")
    .eq("id", id)
    .single()

  if (fetchError || !existing) {
    throw new Error("No se encontró la imagen o no tienes permisos para eliminarla")
  }

  if (existing.tenant_id !== tenantId) {
    throw new Error("No tienes permisos para eliminar esta imagen")
  }

  // Eliminar el archivo del bucket de Storage
  if (existing.image_url) {
    try {
      const url = existing.image_url
      console.log("[deletePropertyImage] URL completa:", url)
      
      // Función helper para extraer el path de diferentes formatos de URL
      const extractFilePath = (imageUrl: string): string | null => {
        // Formato 1: https://[project].supabase.co/storage/v1/object/public/property-images/[path]
        if (imageUrl.includes('/storage/v1/object/public/property-images/')) {
          const path = imageUrl.split('/storage/v1/object/public/property-images/')[1]
          return path?.split('?')[0] || null // Eliminar query params
        }
        
        // Formato 2: https://[project].supabase.co/storage/v1/object/public/property-images/[path]?...
        if (imageUrl.includes('/property-images/')) {
          const parts = imageUrl.split('/property-images/')
          if (parts.length > 1) {
            const path = parts[1]
            return path?.split('?')[0] || null // Eliminar query params
          }
        }
        
        // Formato 3: Path relativo directo
        if (imageUrl.startsWith('property-images/')) {
          return imageUrl.replace('property-images/', '')
        }
        
        // Formato 4: Solo el nombre del archivo (sin bucket)
        // Si no tiene barras ni http, asumimos que es solo el nombre
        if (!imageUrl.includes('/') && !imageUrl.startsWith('http')) {
          return imageUrl
        }
        
        return null
      }

      const filePath = extractFilePath(url)
      console.log("[deletePropertyImage] Path extraído:", filePath)

      if (filePath) {
        // Usar cliente admin para eliminar el archivo
        const { getSupabaseAdmin } = await import('@/lib/supabase/admin')
        const adminClient = getSupabaseAdmin()
        
        console.log("[deletePropertyImage] Intentando eliminar archivo del bucket 'property-images':", filePath)
        
        const { data, error: deleteError } = await adminClient.storage
          .from('property-images')
          .remove([filePath])

        if (deleteError) {
          console.error("[deletePropertyImage] Error eliminando archivo del storage:", deleteError)
          console.error("[deletePropertyImage] Detalles del error:", JSON.stringify(deleteError, null, 2))
          // Lanzar error para que el usuario sepa que falló
          throw new Error(`Error al eliminar archivo del storage: ${deleteError.message}`)
        } else {
          console.log("[deletePropertyImage] Archivo eliminado exitosamente del storage:", filePath)
        }
      } else {
        console.warn("[deletePropertyImage] No se pudo extraer el path del archivo de la URL:", url)
        throw new Error(`No se pudo extraer el path del archivo de la URL: ${url}`)
      }
    } catch (storageError: any) {
      console.error("[deletePropertyImage] Error al eliminar del storage:", storageError)
      console.error("[deletePropertyImage] Stack:", storageError?.stack)
      // Lanzar el error para que se propague y el usuario sepa que falló
      throw new Error(`Error al eliminar archivo del storage: ${storageError.message}`)
    }
  }

  // Eliminar el registro de la base de datos
  const { error } = await supabase
    .from("property_images")
    .delete()
    .eq("id", id)

  if (error) {
    console.error("[deletePropertyImage] Error:", error)
    throw new Error(`Error al eliminar imagen: ${error.message}`)
  }
}

/**
 * Marca una imagen como portada
 */
export async function setCoverImage(
  propertyId: string,
  imageId: string,
  tenantId: string
): Promise<PropertyImage> {
  const supabase = await getSupabaseServerClient()

  // Primero desmarcar todas las portadas de la propiedad
  await supabase
    .from("property_images")
    .update({ is_cover: false })
    .eq("property_id", propertyId)
    .eq("tenant_id", tenantId)
    .eq("is_cover", true)

  // Marcar la nueva portada
  const { data: image, error } = await supabase
    .from("property_images")
    .update({ is_cover: true })
    .eq("id", imageId)
    .eq("property_id", propertyId)
    .eq("tenant_id", tenantId)
    .select()
    .single()

  if (error) {
    console.error("[setCoverImage] Error:", error)
    throw new Error(`Error al establecer imagen de portada: ${error.message}`)
  }

  return image as PropertyImage
}

/**
 * Reordena las imágenes de una propiedad
 */
export async function reorderImages(
  propertyId: string,
  imageIds: string[],
  tenantId: string
): Promise<void> {
  const supabase = await getSupabaseServerClient()

  // Actualizar sort_order para cada imagen
  const updates = imageIds.map((id, index) =>
    supabase
      .from("property_images")
      .update({ sort_order: index })
      .eq("id", id)
      .eq("property_id", propertyId)
      .eq("tenant_id", tenantId)
  )

  await Promise.all(updates)
}

