"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// Paleta de colores compatible con tema claro y oscuro
const colorPalette = [
  // Azules
  { name: "Azul", value: "#3b82f6", light: "#3b82f6", dark: "#60a5fa" },
  { name: "Azul Oscuro", value: "#1e40af", light: "#1e40af", dark: "#3b82f6" },
  { name: "Cian", value: "#06b6d4", light: "#06b6d4", dark: "#22d3ee" },
  
  // Verdes
  { name: "Verde", value: "#10b981", light: "#10b981", dark: "#34d399" },
  { name: "Verde Oscuro", value: "#059669", light: "#059669", dark: "#10b981" },
  { name: "Esmeralda", value: "#047857", light: "#047857", dark: "#059669" },
  
  // Rojos
  { name: "Rojo", value: "#ef4444", light: "#ef4444", dark: "#f87171" },
  { name: "Rojo Oscuro", value: "#dc2626", light: "#dc2626", dark: "#ef4444" },
  { name: "Rosa", value: "#ec4899", light: "#ec4899", dark: "#f472b6" },
  
  // Amarillos/Naranjas
  { name: "Amarillo", value: "#eab308", light: "#eab308", dark: "#facc15" },
  { name: "Naranja", value: "#f97316", light: "#f97316", dark: "#fb923c" },
  { name: "Ámbar", value: "#f59e0b", light: "#f59e0b", dark: "#fbbf24" },
  
  // Púrpuras
  { name: "Púrpura", value: "#8b5cf6", light: "#8b5cf6", dark: "#a78bfa" },
  { name: "Violeta", value: "#7c3aed", light: "#7c3aed", dark: "#8b5cf6" },
  { name: "Fucsia", value: "#d946ef", light: "#d946ef", dark: "#e879f9" },
  
  // Grises
  { name: "Gris", value: "#6b7280", light: "#6b7280", dark: "#9ca3af" },
  { name: "Gris Oscuro", value: "#374151", light: "#374151", dark: "#6b7280" },
  { name: "Slate", value: "#64748b", light: "#64748b", dark: "#94a3b8" },
  
  // Neutrales
  { name: "Stone", value: "#78716c", light: "#78716c", dark: "#a8a29e" },
  { name: "Zinc", value: "#71717a", light: "#71717a", dark: "#a1a1aa" },
  { name: "Neutral", value: "#737373", light: "#737373", dark: "#a3a3a3" },
]

interface ColorPickerProps {
  value: string
  onChange: (color: string) => void
  disabled?: boolean
}

export function ColorPicker({ value, onChange, disabled }: ColorPickerProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-6 gap-2">
        {colorPalette.map((color) => (
          <Button
            key={color.value}
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => onChange(color.value)}
            className={cn(
              "h-8 w-8 p-0 border-2 hover:scale-110 transition-transform",
              value === color.value 
                ? "border-primary ring-2 ring-primary/20" 
                : "border-border hover:border-primary/50"
            )}
            style={{
              backgroundColor: color.value,
            }}
            title={color.name}
          >
            <span className="sr-only">{color.name}</span>
          </Button>
        ))}
      </div>
      
      {/* Campo de texto para mostrar el código hexadecimal */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Código:</span>
        <code className="px-2 py-1 bg-muted rounded text-sm font-mono">
          {value}
        </code>
      </div>
    </div>
  )
}
