/**
 * Utilidades para generar y validar slugs para URLs de propiedades
 */

/**
 * Normaliza un texto a slug (minúsculas, sin acentos, espacios a guiones)
 * @param text Texto a normalizar
 * @param maxLength Longitud máxima del slug (por defecto 50)
 * @returns Slug normalizado
 */
export function generateSlug(text: string, maxLength: number = 50): string {
  if (!text) return ''

  // Convertir a minúsculas
  let slug = text.toLowerCase()

  // Normalizar acentos y caracteres especiales
  const accentMap: Record<string, string> = {
    á: 'a',
    é: 'e',
    í: 'i',
    ó: 'o',
    ú: 'u',
    ñ: 'n',
    ü: 'u',
    Á: 'a',
    É: 'e',
    Í: 'i',
    Ó: 'o',
    Ú: 'u',
    Ñ: 'n',
    Ü: 'u',
  }

  // Reemplazar acentos
  Object.entries(accentMap).forEach(([accent, replacement]) => {
    slug = slug.replace(new RegExp(accent, 'g'), replacement)
  })

  // Reemplazar espacios y caracteres especiales por guiones
  slug = slug.replace(/[^a-z0-9]+/g, '-')

  // Eliminar guiones al inicio y final
  slug = slug.replace(/^-+|-+$/g, '')

  // Eliminar guiones múltiples
  slug = slug.replace(/-+/g, '-')

  // Truncar a maxLength caracteres
  if (slug.length > maxLength) {
    slug = slug.substring(0, maxLength)
    // Asegurar que no termine en guión
    slug = slug.replace(/-+$/, '')
  }

  return slug
}

/**
 * Verifica si un slug es único en la base de datos
 * @param slug Slug a verificar
 * @param excludePropertyId ID de propiedad a excluir de la verificación (para actualizaciones)
 * @returns Promise que resuelve a true si el slug es único, false si ya existe
 */
export async function checkSlugUniqueness(
  slug: string,
  excludePropertyId?: string
): Promise<boolean> {
  try {
    const response = await fetch('/api/properties/check-slug', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        slug,
        excludePropertyId,
      }),
    })

    if (!response.ok) {
      console.error('Error checking slug uniqueness:', response.statusText)
      return false
    }

    const data = await response.json()
    return data.isUnique === true
  } catch (error) {
    console.error('Error checking slug uniqueness:', error)
    return false
  }
}

/**
 * Genera un slug único basado en un texto, añadiendo sufijo numérico si es necesario
 * @param baseText Texto base para generar el slug
 * @param excludePropertyId ID de propiedad a excluir de la verificación (para actualizaciones)
 * @returns Promise que resuelve a un slug único
 */
export async function generateUniqueSlug(
  baseText: string,
  excludePropertyId?: string
): Promise<string> {
  // Generar slug base
  let baseSlug = generateSlug(baseText)

  // Si el slug base está vacío, usar un valor por defecto
  if (!baseSlug) {
    baseSlug = 'propiedad'
  }

  let finalSlug = baseSlug
  let counter = 0

  // Verificar unicidad y añadir sufijo si es necesario
  while (!(await checkSlugUniqueness(finalSlug, excludePropertyId))) {
    counter++
    const suffix = `-${counter}`
    const maxBaseLength = 50 - suffix.length
    const truncatedBase = baseSlug.substring(0, maxBaseLength)
    finalSlug = `${truncatedBase}${suffix}`
  }

  return finalSlug
}

