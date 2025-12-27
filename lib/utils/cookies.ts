/**
 * Utilidades para manejar cookies en el cliente
 * Usa document.cookie directamente para compatibilidad con Next.js
 */

/**
 * Obtiene el valor de una cookie por su nombre
 * @param name Nombre de la cookie
 * @returns Valor de la cookie o null si no existe
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null
  }

  const nameEQ = name + '='
  const cookies = document.cookie.split(';')
  
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i]
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1, cookie.length)
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length))
    }
  }
  
  return null
}

/**
 * Establece una cookie con una caducidad específica
 * @param name Nombre de la cookie
 * @param value Valor de la cookie
 * @param days Número de días hasta que expire (por defecto 15)
 */
export function setCookie(name: string, value: string, days: number = 15): void {
  if (typeof document === 'undefined') {
    return
  }

  const expires = new Date()
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
  
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`
}

/**
 * Elimina una cookie estableciendo su fecha de expiración en el pasado
 * @param name Nombre de la cookie a eliminar
 */
export function deleteCookie(name: string): void {
  if (typeof document === 'undefined') {
    return
  }

  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax`
}

/**
 * Elimina las cookies de credenciales de guía para una propiedad específica
 * @param propertyId ID de la propiedad
 */
export function deleteGuideCookies(propertyId: string): void {
  deleteCookie(`guide_guest_${propertyId}_firstName`)
  deleteCookie(`guide_guest_${propertyId}_lastName`)
}

