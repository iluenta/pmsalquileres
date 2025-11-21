// Funciones para manejar almacenamiento en Supabase Storage

import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { getSupabaseServerClient } from "@/lib/supabase/server"

/**
 * Sube una imagen a Supabase Storage desde el servidor
 * @param file - Archivo de imagen a subir (File o Blob)
 * @param bucket - Nombre del bucket (por defecto 'sales-channels-logos')
 * @param path - Ruta donde guardar el archivo (opcional, se genera automáticamente si no se proporciona)
 * @returns URL pública de la imagen o null si hay error
 */
export async function uploadImageServer(
  file: File | Blob,
  bucket: string = 'sales-channels-logos',
  path?: string
): Promise<string | null> {
  try {
    // Intentar usar el cliente admin primero (tiene más permisos)
    let supabase = null
    try {
      const { getSupabaseAdmin } = await import('@/lib/supabase/admin')
      supabase = getSupabaseAdmin()
    } catch {
      // Si no hay admin client, usar el servidor normal
      supabase = await getSupabaseServerClient()
    }
    
    if (!supabase) {
      console.error('No supabase client available')
      return null
    }

    // Generar nombre único si no se proporciona path
    const fileName = path || `${Date.now()}-${Math.random().toString(36).substring(7)}-${file instanceof File ? file.name : 'image'}`
    const filePath = fileName.replace(/[^a-zA-Z0-9.-]/g, '_') // Sanitizar nombre

    // Convertir File/Blob a ArrayBuffer para el servidor
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Subir archivo
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, uint8Array, {
        cacheControl: '3600',
        upsert: false,
        contentType: file instanceof File ? file.type : 'image/jpeg',
      })

    if (error) {
      console.error('Error uploading image to storage:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      
      // Si el error es que el bucket no existe, intentar crearlo (solo con admin)
      if (error.message?.includes('not found') || error.message?.includes('Bucket') || error.statusCode === '404') {
        console.warn(`Bucket '${bucket}' no encontrado. Intentando crearlo...`)
        
        try {
          // Intentar crear el bucket usando el cliente admin
          const { getSupabaseAdmin } = await import('@/lib/supabase/admin')
          const adminClient = getSupabaseAdmin()
          
          const { data: bucketData, error: createError } = await adminClient.storage.createBucket(bucket, {
            public: true,
            fileSizeLimit: 5242880, // 5MB
            allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
          })
          
          if (createError) {
            console.error('Error creating bucket:', createError)
            throw new Error(`El bucket '${bucket}' no existe y no se pudo crear automáticamente. Por favor, créalo manualmente en Supabase Storage.`)
          }
          
          console.log('Bucket creado exitosamente, reintentando upload...')
          
          // Reintentar el upload después de crear el bucket
          const { data: retryData, error: retryError } = await supabase.storage
            .from(bucket)
            .upload(filePath, uint8Array, {
              cacheControl: '3600',
              upsert: false,
              contentType: file instanceof File ? file.type : 'image/jpeg',
            })
          
          if (retryError) {
            console.error('Error en reintento de upload:', retryError)
            throw retryError
          }
          
          // Obtener URL pública
          const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(retryData.path)
          
          return publicUrl
        } catch (createError: any) {
          console.error('No se pudo crear el bucket automáticamente:', createError)
          throw new Error(`El bucket '${bucket}' no existe. Por favor, créalo manualmente en Supabase Storage (Storage → New bucket → nombre: ${bucket}, público: sí).`)
        }
      }
      
      throw error
    }

    if (!data) {
      console.error('No data returned from upload')
      return null
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return publicUrl
  } catch (error: any) {
    console.error('Error in uploadImageServer:', error)
    console.error('Error stack:', error?.stack)
    return null
  }
}

/**
 * Sube una imagen a Supabase Storage
 * @param file - Archivo de imagen a subir
 * @param bucket - Nombre del bucket (por defecto 'sales-channels-logos')
 * @param path - Ruta donde guardar el archivo (opcional, se genera automáticamente si no se proporciona)
 * @returns URL pública de la imagen o null si hay error
 */
export async function uploadImage(
  file: File,
  bucket: string = 'sales-channels-logos',
  path?: string
): Promise<string | null> {
  try {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      console.error('No supabase client available')
      return null
    }

    // Generar nombre único si no se proporciona path
    const fileName = path || `${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`
    const filePath = fileName.replace(/[^a-zA-Z0-9.-]/g, '_') // Sanitizar nombre

    // Subir archivo
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('Error uploading image:', error)
      return null
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path)

    return publicUrl
  } catch (error) {
    console.error('Error in uploadImage:', error)
    return null
  }
}

/**
 * Elimina una imagen de Supabase Storage
 * @param path - Ruta del archivo a eliminar
 * @param bucket - Nombre del bucket (por defecto 'sales-channels-logos')
 * @returns true si se eliminó correctamente, false en caso contrario
 */
export async function deleteImage(
  path: string,
  bucket: string = 'sales-channels-logos'
): Promise<boolean> {
  try {
    const supabase = getSupabaseBrowserClient()
    if (!supabase) {
      console.error('No supabase client available')
      return false
    }

    // Extraer el path del URL completo si es necesario
    const filePath = path.includes('/storage/v1/object/public/') 
      ? path.split('/storage/v1/object/public/')[1]?.split('/').slice(1).join('/')
      : path

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath])

    if (error) {
      console.error('Error deleting image:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in deleteImage:', error)
    return false
  }
}

/**
 * Obtiene la URL pública de una imagen
 * @param path - Ruta del archivo
 * @param bucket - Nombre del bucket (por defecto 'sales-channels-logos')
 * @returns URL pública de la imagen
 */
export function getImagePublicUrl(
  path: string,
  bucket: string = 'sales-channels-logos'
): string {
  const supabase = getSupabaseBrowserClient()
  if (!supabase) {
    return path // Devolver el path original si no hay cliente
  }

  // Si ya es una URL completa, devolverla
  if (path.startsWith('http')) {
    return path
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)

  return publicUrl
}

