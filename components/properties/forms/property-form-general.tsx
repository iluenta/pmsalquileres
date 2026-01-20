"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Loader2, X } from "lucide-react"
import Image from "next/image"
import { generateSlug, checkSlugUniqueness, generateUniqueSlug } from "@/lib/utils/slug"

interface PropertyFormGeneralProps {
  formData: {
    property_code: string
    name: string
    slug: string
    description: string
    image_url: string
    property_type_id: string
    is_active: boolean
  }
  propertyTypes: any[]
  propertyId?: string
  slugError: string | null
  slugValidating: boolean
  autoGeneratingSlug: boolean
  imagePreview: string | null
  uploadingImage: boolean
  onFieldChange: (field: string, value: any) => void
  onSlugChange: (slug: string) => void
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  onRemoveImage: () => void
}

export function PropertyFormGeneral({
  formData,
  propertyTypes,
  propertyId,
  slugError,
  slugValidating,
  autoGeneratingSlug,
  imagePreview,
  uploadingImage,
  onFieldChange,
  onSlugChange,
  onImageUpload,
  onRemoveImage,
}: PropertyFormGeneralProps) {
  return (
    <div className="space-y-6">
      {/* Basic Information Section */}
      <div>
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7">
              <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">
                Nombre de la Propiedad <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => onFieldChange("name", e.target.value)}
                placeholder="Ej: Villa Vista Mar"
                className="h-12 bg-slate-50 border-slate-100 rounded-xl font-medium focus:ring-indigo-500"
                required
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="property_code" className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">
                Código <span className="text-destructive">*</span>
              </Label>
              <Input
                id="property_code"
                value={formData.property_code}
                onChange={(e) => onFieldChange("property_code", e.target.value)}
                placeholder="VILLA-001"
                className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold text-indigo-600 focus:ring-indigo-500"
                required
              />
            </div>
            <div className="md:col-span-3">
              <Label htmlFor="property_type_id" className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">
                Tipo <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.property_type_id || undefined}
                onValueChange={(value) => onFieldChange("property_type_id", value)}
              >
                <SelectTrigger className="h-12 bg-slate-50 border-slate-100 rounded-xl font-medium focus:ring-indigo-500">
                  <SelectValue placeholder="Seleccionar..." />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="slug" className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">
                Slug para URL Identificativa
                {autoGeneratingSlug && (
                  <span className="text-[10px] text-indigo-500 ml-2 animate-pulse">(Auto-generando...)</span>
                )}
              </Label>
              <div className="relative">
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => {
                    const newSlug = generateSlug(e.target.value)
                    onSlugChange(newSlug)
                  }}
                  placeholder="ej-mi-escapada"
                  className={`h-12 bg-slate-50 border-slate-100 rounded-xl font-medium pl-10 ${slugError ? "border-destructive" : ""}`}
                  maxLength={50}
                  disabled={autoGeneratingSlug}
                  required
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <span className="text-xs font-bold">/</span>
                </div>
                {slugValidating && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-indigo-500" />
                )}
              </div>
              {slugError && (
                <p className="text-[10px] font-bold text-destructive mt-2 uppercase tracking-tight">{slugError}</p>
              )}
            </div>

            <div>
              <Label htmlFor="image" className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">
                Imagen Principal / Miniatura
              </Label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={onImageUpload}
                    disabled={uploadingImage}
                    className="h-12 bg-slate-50 border-slate-100 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:uppercase file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 transition-all cursor-pointer"
                  />
                </div>
                {imagePreview && (
                  <div className="relative h-12 w-12 rounded-xl border-2 border-slate-100 overflow-hidden shrink-0 group">
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={onRemoveImage}
                      className="absolute inset-0 bg-destructive/80 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">
              Descripción Corta
            </Label>
            <Textarea
              id="description"
              placeholder="Breve reseña que aparecerá en el listado..."
              value={formData.description}
              onChange={(e) => onFieldChange("description", e.target.value)}
              className="min-h-[80px] bg-slate-50 border-slate-100 rounded-xl font-medium focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

    </div>
  )
}

