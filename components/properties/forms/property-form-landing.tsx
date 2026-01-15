"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Wifi, Tv, Wind, Utensils, Coffee, Shield, Info, Plus, Trash2 } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"

const ICON_OPTIONS = [
    { value: "Wifi", icon: Wifi, label: "WiFi" },
    { value: "Tv", icon: Tv, label: "TV" },
    { value: "Wind", icon: Wind, label: "Aire Acondicionado" },
    { value: "Utensils", icon: Utensils, label: "Cocina" },
    { value: "Coffee", icon: Coffee, label: "Relax" },
    { value: "Shield", icon: Shield, label: "Seguridad" },
    { value: "Info", icon: Info, label: "Información" },
]

interface PropertyFormLandingProps {
    formData: any
    onFieldChange: (field: string, value: any) => void
}

export function PropertyFormLanding({ formData, onFieldChange }: PropertyFormLandingProps) {
    const config = formData.landing_config || {
        hero_subtitle: "",
        highlights: [],
        space_descriptions: {
            rooms: "",
            bathrooms: "",
            kitchen: ""
        }
    }

    const updateConfig = (updates: any) => {
        onFieldChange("landing_config", { ...config, ...updates })
    }

    const updateSpaceDescription = (key: string, value: string) => {
        updateConfig({
            space_descriptions: {
                ...config.space_descriptions,
                [key]: value
            }
        })
    }

    const addHighlight = () => {
        const newHighlight = { icon: "Info", title: "Nuevo Highlight", description: "Descripción del highlight" }
        updateConfig({
            highlights: [...(config.highlights || []), newHighlight]
        })
    }

    const removeHighlight = (index: number) => {
        updateConfig({
            highlights: config.highlights.filter((_: any, i: number) => i !== index)
        })
    }

    const updateHighlight = (index: number, field: string, value: string) => {
        const newHighlights = [...config.highlights]
        newHighlights[index] = { ...newHighlights[index], [field]: value }
        updateConfig({ highlights: newHighlights })
    }

    return (
        <div className="space-y-8">
            {/* Hero Section */}
            <Card className="p-6 border-2 border-neutral-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Info className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Sección Hero</h3>
                        <p className="text-sm text-muted-foreground">Define el mensaje de bienvenida de tu landing</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="hero_subtitle">Mensaje de Slogan (Subtítulo)</Label>
                        <Textarea
                            id="hero_subtitle"
                            placeholder="Ej: Lujo, comodidad y atención al detalle..."
                            value={config.hero_subtitle || ""}
                            onChange={(e) => updateConfig({ hero_subtitle: e.target.value })}
                            className="min-h-[100px] resize-none border-neutral-200 focus:border-primary transition-all duration-300"
                        />
                    </div>
                </div>
            </Card>

            {/* Highlights Section */}
            <Card className="p-6 border-2 border-neutral-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Plus className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Puntos Destacados (Highlights)</h3>
                            <p className="text-sm text-muted-foreground">Gestiona las características principales que verá el usuario</p>
                        </div>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addHighlight} className="gap-2">
                        <Plus className="w-4 h-4" />
                        Añadir
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {config.highlights?.map((highlight: any, idx: number) => (
                        <Card key={idx} className="p-4 bg-muted/30 border-neutral-200 relative group">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeHighlight(idx)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                            <div className="space-y-3">
                                <div className="grid gap-2">
                                    <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Icono</Label>
                                    <Select
                                        value={highlight.icon}
                                        onValueChange={(val) => updateHighlight(idx, "icon", val)}
                                    >
                                        <SelectTrigger className="bg-background">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ICON_OPTIONS.map((opt) => (
                                                <SelectItem key={opt.value} value={opt.value}>
                                                    <div className="flex items-center gap-2">
                                                        <opt.icon className="w-4 h-4" />
                                                        <span>{opt.label}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Título</Label>
                                    <Input
                                        value={highlight.title}
                                        onChange={(e) => updateHighlight(idx, "title", e.target.value)}
                                        className="bg-background"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Descripción</Label>
                                    <Textarea
                                        value={highlight.description}
                                        onChange={(e) => updateHighlight(idx, "description", e.target.value)}
                                        className="bg-background resize-none h-20"
                                    />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </Card>

            {/* Space Descriptions */}
            <Card className="p-6 border-2 border-neutral-100 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Utensils className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Descripciones de Espacios</h3>
                        <p className="text-sm text-muted-foreground">Textos descriptivos para las áreas de la propiedad</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="grid gap-2">
                        <Label htmlFor="desc_rooms">Habitaciones</Label>
                        <Textarea
                            id="desc_rooms"
                            placeholder="Ej: Espacios amplios y confortables..."
                            value={config.space_descriptions?.rooms || ""}
                            onChange={(e) => updateSpaceDescription("rooms", e.target.value)}
                            className="resize-none border-neutral-200"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="desc_bathrooms">Baños</Label>
                        <Textarea
                            id="desc_bathrooms"
                            placeholder="Ej: Baños modernos y equipados..."
                            value={config.space_descriptions?.bathrooms || ""}
                            onChange={(e) => updateSpaceDescription("bathrooms", e.target.value)}
                            className="resize-none border-neutral-200"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="desc_kitchen">Cocina</Label>
                        <Textarea
                            id="desc_kitchen"
                            placeholder="Ej: Cocina totalmente equipada..."
                            value={config.space_descriptions?.kitchen || ""}
                            onChange={(e) => updateSpaceDescription("kitchen", e.target.value)}
                            className="resize-none border-neutral-200"
                        />
                    </div>
                </div>
            </Card>
        </div>
    )
}
