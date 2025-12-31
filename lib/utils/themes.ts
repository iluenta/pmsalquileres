export interface ThemeConfig {
    primary: string
    secondary: string
}

export const GUIDE_THEMES = [
    { id: 'default', name: 'Estándar (Azul)', primary: '#2563eb', secondary: '#eff6ff' },
    { id: 'forest', name: 'Bosque (Verde)', primary: '#059669', secondary: '#ecfdf5' },
    { id: 'sunset', name: 'Atardecer (Naranja)', primary: '#ea580c', secondary: '#fff7ed' },
    { id: 'ocean', name: 'Océano (Cian)', primary: '#0891b2', secondary: '#ecfeff' },
    { id: 'luxury', name: 'Lujo (Dorado/Negro)', primary: '#854d0e', secondary: '#fefce8' },
    { id: 'berry', name: 'Arándano (Morado)', primary: '#7c3aed', secondary: '#f5f3ff' },
    { id: 'earth', name: 'Tierra (Marrón)', primary: '#92400e', secondary: '#fffbeb' },
    { id: 'minimalist', name: 'Minimalista (Gris)', primary: '#4b5563', secondary: '#f9fafb' },
    { id: 'vibrant', name: 'Vibrante (Rosa)', primary: '#db2777', secondary: '#fdf2f8' },
    { id: 'modern', name: 'Moderno (Índigo)', primary: '#4f46e5', secondary: '#eef2ff' },
];

export const themeConfigs: Record<string, ThemeConfig> = {
    default: { primary: "#2563eb", secondary: "#eff6ff" },
    forest: { primary: "#059669", secondary: "#ecfdf5" },
    sunset: { primary: "#ea580c", secondary: "#fff7ed" },
    ocean: { primary: "#0891b2", secondary: "#ecfeff" },
    luxury: { primary: "#854d0e", secondary: "#fefce8" },
    berry: { primary: "#7c3aed", secondary: "#f5f3ff" },
    earth: { primary: "#92400e", secondary: "#fffbeb" },
    minimalist: { primary: "#4b5563", secondary: "#f9fafb" },
    vibrant: { primary: "#db2777", secondary: "#fdf2f8" },
    modern: { primary: "#4f46e5", secondary: "#eef2ff" },
}

export function hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
        ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
        : "37, 99, 235"
}
