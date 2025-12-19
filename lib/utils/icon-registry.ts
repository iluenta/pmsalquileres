import * as LucideIcons from "lucide-react"
import type { LucideIcon } from "lucide-react"

// Definición de un icono en el registro
export interface IconDefinition {
    name: string
    label: string
    component: LucideIcon
}

// Iconos organizados por categoría
export const ICON_REGISTRY: Record<string, IconDefinition[]> = {
    Hogar: [
        { name: "Home", label: "Casa", component: LucideIcons.Home },
        { name: "UtensilsCrossed", label: "Cocina", component: LucideIcons.UtensilsCrossed },
        { name: "Bed", label: "Dormitorio", component: LucideIcons.Bed },
        { name: "Bath", label: "Baño", component: LucideIcons.Bath },
        { name: "Armchair", label: "Salón", component: LucideIcons.Armchair },
        { name: "DoorOpen", label: "Puerta", component: LucideIcons.DoorOpen },
        { name: "Square", label: "Ventana", component: LucideIcons.Square },
        { name: "Lightbulb", label: "Lámpara", component: LucideIcons.Lightbulb },
        { name: "Monitor", label: "TV", component: LucideIcons.Monitor },
        { name: "Wifi", label: "WiFi", component: LucideIcons.Wifi },
        { name: "Thermometer", label: "Termómetro", component: LucideIcons.Thermometer },
    ],
    "Viajes y Vacaciones": [
        { name: "Plane", label: "Avión", component: LucideIcons.Plane },
        { name: "Train", label: "Tren", component: LucideIcons.Train },
        { name: "Ship", label: "Barco", component: LucideIcons.Ship },
        { name: "MapPin", label: "Ubicación", component: LucideIcons.MapPin },
        { name: "Compass", label: "Brújula", component: LucideIcons.Compass },
        { name: "Camera", label: "Cámara", component: LucideIcons.Camera },
        { name: "Luggage", label: "Maleta", component: LucideIcons.Luggage },
        { name: "Sun", label: "Sol", component: LucideIcons.Sun },
        { name: "Umbrella", label: "Paraguas", component: LucideIcons.Umbrella },
    ],
    Transporte: [
        { name: "Bike", label: "Bicicleta", component: LucideIcons.Bike },
        { name: "Bus", label: "Autobús", component: LucideIcons.Bus },
        { name: "Car", label: "Coche", component: LucideIcons.Car },
        { name: "ParkingCircle", label: "Parking", component: LucideIcons.ParkingCircle },
        { name: "Navigation", label: "Navegación", component: LucideIcons.Navigation },
        { name: "Route", label: "Ruta", component: LucideIcons.Route },
    ],
    Comodidades: [
        { name: "Wind", label: "Ventilador", component: LucideIcons.Wind },
        { name: "Droplet", label: "Agua", component: LucideIcons.Droplet },
        { name: "Flame", label: "Calefacción", component: LucideIcons.Flame },
        { name: "Snowflake", label: "Aire Acondicionado", component: LucideIcons.Snowflake },
        { name: "Shield", label: "Seguridad", component: LucideIcons.Shield },
        { name: "Key", label: "Llave", component: LucideIcons.Key },
        { name: "Lock", label: "Candado", component: LucideIcons.Lock },
    ],
    Actividades: [
        { name: "Waves", label: "Playa", component: LucideIcons.Waves },
        { name: "LifeBuoy", label: "Piscina", component: LucideIcons.LifeBuoy },
        { name: "Trophy", label: "Padel / Tenis", component: LucideIcons.Trophy },
        { name: "Mountain", label: "Montaña", component: LucideIcons.Mountain },
        { name: "TreePine", label: "Naturaleza", component: LucideIcons.TreePine },
        { name: "Gamepad", label: "Juegos", component: LucideIcons.Gamepad },
        { name: "Music", label: "Música", component: LucideIcons.Music },
        { name: "BookOpen", label: "Libro", component: LucideIcons.BookOpen },
    ],
    Servicios: [
        { name: "ShoppingBag", label: "Compras", component: LucideIcons.ShoppingBag },
        { name: "Coffee", label: "Café", component: LucideIcons.Coffee },
        { name: "Utensils", label: "Restaurante", component: LucideIcons.Utensils },
        { name: "Candy", label: "Dulces", component: LucideIcons.Candy },
    ],
    Otros: [
        { name: "Star", label: "Estrella", component: LucideIcons.Star },
        { name: "Heart", label: "Corazón", component: LucideIcons.Heart },
        { name: "Sparkles", label: "Brillo", component: LucideIcons.Sparkles },
        { name: "Zap", label: "Rayo", component: LucideIcons.Zap },
        { name: "CheckCircle2", label: "Check", component: LucideIcons.CheckCircle2 },
        { name: "Info", label: "Información", component: LucideIcons.Info },
        { name: "AlertTriangle", label: "Advertencia", component: LucideIcons.AlertTriangle },
        { name: "HelpCircle", label: "Ayuda", component: LucideIcons.HelpCircle },
    ],
    Normas: [
        { name: "CigaretteOff", label: "No Fumar", component: LucideIcons.CigaretteOff },
        { name: "VolumeX", label: "Silencio", component: LucideIcons.VolumeX },
        { name: "Moon", label: "Noche", component: LucideIcons.Moon },
        { name: "Clock", label: "Horario", component: LucideIcons.Clock },
        { name: "ClipboardList", label: "Lista", component: LucideIcons.ClipboardList },
        { name: "Smartphone", label: "Teléfono", component: LucideIcons.Smartphone },
        { name: "Mail", label: "Email", component: LucideIcons.Mail },
    ],
}

// Lista plana de todos los iconos disponibles
export const ALL_ICONS: IconDefinition[] = Object.values(ICON_REGISTRY).flat()

// Mapeo de códigos Font Awesome a nombres (para migración)
export const FA_TO_NAME_MAP: Record<string, string> = {
    "fas fa-home": "Home",
    "fas fa-utensils": "UtensilsCrossed",
    "fas fa-bed": "Bed",
    "fas fa-bath": "Bath",
    "fas fa-couch": "Armchair",
    "fas fa-door-open": "DoorOpen",
    "fas fa-window-maximize": "Square",
    "fas fa-lightbulb": "Lightbulb",
    "fas fa-tv": "Monitor",
    "fas fa-television": "Monitor",
    "fas fa-wifi": "Wifi",
    "fas fa-thermometer-half": "Thermometer",
    "fas fa-plane": "Plane",
    "fas fa-car": "Car",
    "fas fa-train": "Train",
    "fas fa-ship": "Ship",
    "fas fa-map-marker-alt": "MapPin",
    "fas fa-compass": "Compass",
    "fas fa-camera": "Camera",
    "fas fa-suitcase": "Luggage",
    "fas fa-sun": "Sun",
    "fas fa-umbrella": "Umbrella",
    "fas fa-bicycle": "Bike",
    "fas fa-bus": "Bus",
    "fas fa-map": "Navigation",
    "fas fa-route": "Route",
    "fas fa-wind": "Wind",
    "fas fa-tint": "Droplet",
    "fas fa-fire": "Flame",
    "fas fa-snowflake": "Snowflake",
    "fas fa-shield-alt": "Shield",
    "fas fa-key": "Key",
    "fas fa-lock": "Lock",
    "fas fa-water": "Waves",
    "fas fa-mountain": "Mountain",
    "fas fa-tree": "TreePine",
    "fas fa-gamepad": "Gamepad",
    "fas fa-music": "Music",
    "fas fa-book": "BookOpen",
    "fas fa-shopping-bag": "ShoppingBag",
    "fas fa-coffee": "Coffee",
    "fas fa-candy-cane": "Candy",
    "fas fa-star": "Star",
    "fas fa-heart": "Heart",
    "fas fa-sparkles": "Sparkles",
    "fas fa-bolt": "Zap",
    "fas fa-smoking-ban": "CigaretteOff",
    "fas fa-volume-mute": "VolumeX",
    "fas fa-moon": "Moon",
    "fas fa-clock": "Clock",
    "fas fa-clipboard-list": "ClipboardList",
    "fas fa-mobile-alt": "Smartphone",
    "fas fa-envelope": "Mail",
    "fas fa-info-circle": "Info",
    "fas fa-exclamation-triangle": "AlertTriangle",
    "fas fa-question-circle": "HelpCircle",
    "fas fa-parking": "ParkingCircle",
    "fas fa-swimming-pool": "Waves",
}

/**
 * Obtiene un componente de icono por su nombre
 * @param iconName Nombre del icono (ej: "Thermometer") o código FA (ej: "fas fa-thermometer-half")
 * @param fallback Icono por defecto si no se encuentra
 * @returns Componente de icono de Lucide
 */
export function getIconByName(
    iconName: string | undefined,
    fallback: LucideIcon = LucideIcons.Lightbulb
): LucideIcon {
    if (!iconName) return fallback

    // Si es un código Font Awesome, convertir a nombre
    const name = iconName.startsWith("fas fa-")
        ? FA_TO_NAME_MAP[iconName] || iconName
        : iconName

    // Buscar en el registro
    const icon = ALL_ICONS.find(i => i.name === name)
    return icon ? icon.component : fallback
}

/**
 * Convierte un código Font Awesome a nombre de icono
 * @param faCode Código Font Awesome (ej: "fas fa-thermometer-half")
 * @returns Nombre del icono (ej: "Thermometer") o null si no se encuentra
 */
export function convertFACodeToName(faCode: string): string | null {
    return FA_TO_NAME_MAP[faCode] || null
}

/**
 * Convierte un nombre de icono a código Font Awesome (para compatibilidad)
 * @param iconName Nombre del icono (ej: "Thermometer")
 * @returns Código Font Awesome o null si no se encuentra
 */
export function convertNameToFACode(iconName: string): string | null {
    const entry = Object.entries(FA_TO_NAME_MAP).find(([_, name]) => name === iconName)
    return entry ? entry[0] : null
}
