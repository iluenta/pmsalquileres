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
        <div className="space-y-6">
            {/* Hero Section */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center rotate-3">
                        <Info className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tighter">Sección Hero</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Slogan y mensaje principal</p>
                    </div>
                </div>

                <div>
                    <Label htmlFor="hero_subtitle" className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">
                        Mensaje de Slogan (Subtítulo)
                    </Label>
                    <Textarea
                        id="hero_subtitle"
                        placeholder="Ej: Lujo, comodidad y atención al detalle..."
                        value={config.hero_subtitle || ""}
                        onChange={(e) => updateConfig({ hero_subtitle: e.target.value })}
                        className="min-h-[80px] bg-slate-50 border-slate-100 rounded-xl font-medium focus:ring-indigo-500"
                    />
                </div>
            </div>

            {/* Space Descriptions - Compact Grid */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center -rotate-3">
                        <Utensils className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tighter">Descripciones de Espacios</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Textos descriptivos rápidos</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <Label htmlFor="desc_rooms" className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">
                            Habitaciones
                        </Label>
                        <Textarea
                            id="desc_rooms"
                            placeholder="Ej: Espacios amplios..."
                            value={config.space_descriptions?.rooms || ""}
                            onChange={(e) => updateSpaceDescription("rooms", e.target.value)}
                            className="min-h-[70px] bg-slate-50 border-slate-100 rounded-xl text-sm font-medium focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <Label htmlFor="desc_bathrooms" className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">
                            Baños
                        </Label>
                        <Textarea
                            id="desc_bathrooms"
                            placeholder="Ej: Modernos y equipados..."
                            value={config.space_descriptions?.bathrooms || ""}
                            onChange={(e) => updateSpaceDescription("bathrooms", e.target.value)}
                            className="min-h-[70px] bg-slate-50 border-slate-100 rounded-xl text-sm font-medium focus:ring-indigo-500"
                        />
                    </div>
                    <div>
                        <Label htmlFor="desc_kitchen" className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">
                            Cocina
                        </Label>
                        <Textarea
                            id="desc_kitchen"
                            placeholder="Ej: Totalmente equipada..."
                            value={config.space_descriptions?.kitchen || ""}
                            onChange={(e) => updateSpaceDescription("kitchen", e.target.value)}
                            className="min-h-[70px] bg-slate-50 border-slate-100 rounded-xl text-sm font-medium focus:ring-indigo-500"
                        />
                    </div>
                </div>
            </div>

            {/* Highlights Section */}
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center rotate-6">
                            <Plus className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 tracking-tighter">Puntos Destacados</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Características principales</p>
                        </div>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addHighlight} className="gap-2 rounded-xl border-slate-200 hover:bg-slate-50 font-black uppercase text-[10px] tracking-widest">
                        <Plus className="w-4 h-4" />
                        Añadir Highlight
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {config.highlights?.map((highlight: any, idx: number) => (
                        <div key={idx} className="p-5 bg-slate-50 border border-slate-100 rounded-2xl relative group hover:border-indigo-200 transition-colors">
                            <button
                                type="button"
                                className="absolute top-4 right-4 text-slate-300 hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                                onClick={() => removeHighlight(idx)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="space-y-4">
                                <div>
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Icono</Label>
                                    <Select
                                        value={highlight.icon}
                                        onValueChange={(val) => updateHighlight(idx, "icon", val)}
                                    >
                                        <SelectTrigger className="h-10 bg-white border-slate-100 rounded-xl font-medium focus:ring-indigo-500">
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
                                <div>
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Título</Label>
                                    <Input
                                        value={highlight.title}
                                        onChange={(e) => updateHighlight(idx, "title", e.target.value)}
                                        className="h-10 bg-white border-slate-100 rounded-xl font-bold text-indigo-600"
                                    />
                                </div>
                                <div>
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block">Descripción</Label>
                                    <Textarea
                                        value={highlight.description}
                                        onChange={(e) => updateHighlight(idx, "description", e.target.value)}
                                        className="min-h-[60px] bg-white border-slate-100 rounded-xl text-xs font-medium focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
