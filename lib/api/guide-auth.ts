import { createHmac, timingSafeEqual } from 'crypto'

const JWT_SECRET = process.env.GUIDE_JWT_SECRET || 'fallback-secret-for-guides-12345'
const GUIDES_SESSION_COOKIE_MAX_AGE = 15 * 24 * 60 * 60 // 15 days

export interface GuideSession {
    bookingId: string
    propertyId: string
    firstName: string
    lastName: string
    iat: number
    exp: number
}

/**
 * Crea un token firmado para la sesión de la guía
 */
export function signGuideToken(payload: Omit<GuideSession, 'iat' | 'exp'>): string {
    const iat = Math.floor(Date.now() / 1000)
    const exp = iat + GUIDES_SESSION_COOKIE_MAX_AGE

    const fullPayload: GuideSession = { ...payload, iat, exp }
    const payloadStr = Buffer.from(JSON.stringify(fullPayload)).toString('base64url')

    const hmac = createHmac('sha256', JWT_SECRET)
    hmac.update(payloadStr)
    const signature = hmac.digest('base64url')

    return `${payloadStr}.${signature}`
}

/**
 * Verifica un token de sesión de la guía
 */
export function verifyGuideToken(token: string): GuideSession | null {
    try {
        const [payloadStr, signature] = token.split('.')
        if (!payloadStr || !signature) return null

        // Verificar firma
        const hmac = createHmac('sha256', JWT_SECRET)
        hmac.update(payloadStr)
        const expectedSignature = hmac.digest('base64url')

        // Comparación segura en tiempo para evitar ataques de timing
        const isValid = timingSafeEqual(
            Buffer.from(signature),
            Buffer.from(expectedSignature)
        )

        if (!isValid) return null

        // Decodificar y verificar expiración
        const payload: GuideSession = JSON.parse(Buffer.from(payloadStr, 'base64url').toString())
        const now = Math.floor(Date.now() / 1000)

        if (payload.exp < now) return null

        return payload
    } catch (error) {
        console.error('[GuideAuth] Error verificando token:', error)
        return null
    }
}
