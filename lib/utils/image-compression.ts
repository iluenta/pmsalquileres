// Funciones de compresión de imágenes usando Sharp
import sharp from 'sharp'

export interface CompressionOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png'
}

/**
 * Comprime y redimensiona una imagen usando Sharp
 * @param file - Archivo de imagen a comprimir
 * @param options - Opciones de compresión
 * @returns Buffer comprimido y metadata
 */
export async function compressImage(
  file: File | Buffer,
  options: CompressionOptions = {}
): Promise<{ buffer: Buffer; metadata: sharp.Metadata }> {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 85,
    format = 'webp',
  } = options

  // Convertir File a Buffer si es necesario
  const inputBuffer = file instanceof File
    ? Buffer.from(await file.arrayBuffer())
    : file

  // Procesar imagen con Sharp
  const image = sharp(inputBuffer)
  const metadata = await image.metadata()

  // Calcular dimensiones manteniendo aspect ratio
  let width = metadata.width || maxWidth
  let height = metadata.height || maxHeight

  if (width > maxWidth || height > maxHeight) {
    if (width / height > maxWidth / maxHeight) {
      width = maxWidth
      height = Math.round((maxWidth / metadata.width!) * metadata.height!)
    } else {
      height = maxHeight
      width = Math.round((maxHeight / metadata.height!) * metadata.width!)
    }
  }

  // Comprimir según el formato
  let processedImage = image.resize(width, height, {
    fit: 'inside',
    withoutEnlargement: true,
  })

  switch (format) {
    case 'webp':
      processedImage = processedImage.webp({ quality })
      break
    case 'jpeg':
      processedImage = processedImage.jpeg({ quality, mozjpeg: true })
      break
    case 'png':
      processedImage = processedImage.png({ quality, compressionLevel: 9 })
      break
  }

  const buffer = await processedImage.toBuffer()
  const finalMetadata = await sharp(buffer).metadata()

  return { buffer, metadata: finalMetadata }
}

/**
 * Genera un thumbnail de una imagen
 * @param file - Archivo de imagen
 * @param size - Tamaño del thumbnail (ancho)
 * @returns Buffer del thumbnail
 */
export async function generateThumbnail(
  file: File | Buffer,
  size: number = 400
): Promise<Buffer> {
  const inputBuffer = file instanceof File
    ? Buffer.from(await file.arrayBuffer())
    : file

  const buffer = await sharp(inputBuffer)
    .resize(size, size, {
      fit: 'cover',
      position: 'center',
    })
    .webp({ quality: 80 })
    .toBuffer()

  return buffer
}

/**
 * Valida que un archivo sea una imagen válida
 * @param file - Archivo a validar
 * @param maxSize - Tamaño máximo en bytes (default: 10MB)
 * @returns true si es válido, false en caso contrario
 */
export function validateImageFile(
  file: File,
  maxSize: number = 10 * 1024 * 1024 // 10MB
): { valid: boolean; error?: string } {
  // Validar tipo
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Tipo de archivo no permitido. Solo se permiten imágenes (JPEG, PNG, WebP)',
    }
  }

  // Validar tamaño
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `El archivo es demasiado grande. El tamaño máximo es ${maxSize / 1024 / 1024}MB`,
    }
  }

  return { valid: true }
}

