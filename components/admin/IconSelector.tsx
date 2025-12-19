"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ICON_REGISTRY } from "@/lib/utils/icon-registry"

interface IconSelectorProps {
  value: string // Nombre del icono (ej: "Home")
  onChange: (iconName: string) => void
  disabled?: boolean
}

export function IconSelector({ value, onChange, disabled }: IconSelectorProps) {
  const categories = Object.keys(ICON_REGISTRY)
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0] || "Hogar")

  return (
    <div className="space-y-3">
      <Label>Icono</Label>

      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="flex flex-wrap w-full gap-1 h-auto p-1">
          {categories.map((category) => (
            <TabsTrigger
              key={category}
              value={category}
              className="text-xs flex-1 min-w-[100px] whitespace-nowrap py-2"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(ICON_REGISTRY).map(([category, icons]) => (
          <TabsContent key={category} value={category} className="space-y-2">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 p-3 border rounded-lg bg-muted/30 max-h-64 overflow-y-auto">
              {icons.map((iconItem) => {
                const IconComponent = iconItem.component
                const isSelected = value === iconItem.name

                return (
                  <Button
                    key={iconItem.name}
                    type="button"
                    variant={isSelected ? "default" : "ghost"}
                    size="sm"
                    disabled={disabled}
                    onClick={() => onChange(iconItem.name)}
                    className={cn(
                      "h-auto min-h-[70px] flex flex-col items-center justify-center gap-1.5 p-2 transition-colors",
                      isSelected && "ring-2 ring-primary ring-offset-2"
                    )}
                    title={iconItem.label}
                  >
                    <IconComponent className="h-5 w-5 flex-shrink-0" />
                    <span className="text-[10px] text-center leading-tight px-1 line-clamp-2 uppercase font-medium">
                      {iconItem.label}
                    </span>
                  </Button>
                )
              })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}


