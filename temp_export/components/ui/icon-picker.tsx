"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

// Categorías de iconos organizados por tipo
const iconCategories = {
  "Propiedades": ["🏠", "🏡", "🏢", "🏬", "🏪", "🏨", "🏰", "⛺", "🚪", "🪟"],
  "Finanzas": ["💰", "💵", "💴", "💶", "💷", "💳", "🏦", "📊", "📈", "💸"],
  "Estados": ["✅", "❌", "⏳", "🔄", "⚠️", "ℹ️", "🔒", "🔓", "⭐", "🌟"],
  "Actividades": ["🏖️", "🏔️", "🌊", "🌴", "🎯", "🎪", "🎨", "🎭", "🎪", "🎉"],
  "Servicios": ["🚗", "✈️", "🚇", "🚌", "🚕", "🛵", "🚲", "🚁", "🛫", "🛬"],
  "Comodidades": ["🛏️", "🚿", "🛁", "🪑", "🪞", "📺", "📱", "💻", "🌐", "🔌"],
  "Ubicación": ["📍", "🗺️", "🌍", "🏙️", "🌆", "🌃", "🌅", "🌇", "🌉", "🏞️"],
  "Personas": ["👥", "👤", "👨‍💼", "👩‍💼", "👨‍🔧", "👩‍🔧", "👨‍🍳", "👩‍🍳", "👨‍⚕️", "👩‍⚕️"],
  "Tiempo": ["📅", "⏰", "🕐", "🕑", "🕒", "🕓", "🕔", "🕕", "🕖", "🕗"],
  "Comunicación": ["📞", "📧", "💬", "📱", "📠", "📨", "📩", "📤", "📥", "📦"],
}

interface IconPickerProps {
  value: string
  onChange: (icon: string) => void
  disabled?: boolean
}

export function IconPicker({ value, onChange, disabled }: IconPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("Propiedades")

  const handleEmojiClick = (emoji: string) => {
    onChange(emoji)
  }

  const handleInputChange = (inputValue: string) => {
    // Permitir solo emojis y caracteres especiales
    onChange(inputValue)
  }

  return (
    <div className="space-y-3">
      {/* Selector de categoría */}
      <div className="space-y-2">
        <Label>Seleccionar categoría:</Label>
        <div className="grid grid-cols-2 gap-1">
          {Object.keys(iconCategories).map((category) => (
            <Button
              key={category}
              type="button"
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              disabled={disabled}
              onClick={() => setSelectedCategory(category)}
              className="text-xs"
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Grid de iconos */}
      <div className="space-y-2">
        <Label>Iconos disponibles:</Label>
        <div className="grid grid-cols-5 gap-1 p-3 border rounded-lg bg-muted/30">
          {iconCategories[selectedCategory as keyof typeof iconCategories].map((emoji, index) => (
            <Button
              key={`${selectedCategory}-${index}`}
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => handleEmojiClick(emoji)}
              className={cn(
                "h-8 w-8 p-0 text-lg hover:bg-primary/10 transition-colors",
                value === emoji && "bg-primary/20 ring-2 ring-primary/30"
              )}
              title={`Seleccionar ${emoji}`}
            >
              {emoji}
            </Button>
          ))}
        </div>
      </div>

      {/* Campo de entrada manual */}
      <div className="space-y-2">
        <Label htmlFor="icon-input">O escribe tu propio emoji:</Label>
        <Input
          id="icon-input"
          value={value}
          onChange={(e) => handleInputChange(e.target.value)}
          placeholder="ej: 🏠 💰 ✅"
          disabled={disabled}
          className="text-center text-lg"
          maxLength={4} // Limitar a pocos emojis
        />
        <p className="text-xs text-muted-foreground">
          Puedes pegar emojis directamente o escribir caracteres especiales
        </p>
      </div>

      {/* Vista previa */}
      {value && (
        <div className="flex items-center gap-2 p-2 border rounded-lg bg-muted/30">
          <span className="text-sm text-muted-foreground">Vista previa:</span>
          <span className="text-2xl">{value}</span>
          <span className="text-sm text-muted-foreground">
            ({value.length} caracteres)
          </span>
        </div>
      )}
    </div>
  )
}
