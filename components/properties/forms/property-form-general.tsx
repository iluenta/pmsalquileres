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
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="text-lg">ℹ️</span> Información Básica
        </h3>
        <div className="bg-muted/30 p-4 md:p-6 rounded-lg border border-border space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="property_code" className="text-sm font-medium">
                Código de Propiedad <span className="text-destructive">*</span>
              </Label>
              <Input
                id="property_code"
                value={formData.property_code}
                onChange={(e) => onFieldChange("property_code", e.target.value)}
                placeholder="PROP-001"
                className="mt-2 bg-background"
                required
              />
            </div>
            <div>
              <Label htmlFor="name" className="text-sm font-medium">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => onFieldChange("name", e.target.value)}
                placeholder="Nombre de la propiedad"
                className="mt-2 bg-background"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="slug" className="text-sm font-medium">
              Slug para URL{" "}
              <span className="text-destructive">*</span>
              {autoGeneratingSlug && (
                <span className="text-xs text-muted-foreground ml-2">(Generando...)</span>
              )}
            </Label>
            <div className="relative mt-2">
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => {
                  const newSlug = generateSlug(e.target.value)
                  onSlugChange(newSlug)
                }}
                placeholder="apartamento-centro-madrid"
                className={`bg-background ${slugError ? "border-destructive" : ""}`}
                maxLength={50}
                disabled={autoGeneratingSlug}
                required
              />
              {slugValidating && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
            {slugError && (
              <p className="text-sm text-destructive mt-1">{slugError}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              URL única para la guía pública. Se genera automáticamente desde el nombre. Máximo 50 caracteres.
            </p>
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium">
              Descripción
            </Label>
            <Textarea
              id="description"
              placeholder="Describe las características principales de la propiedad..."
              value={formData.description}
              onChange={(e) => onFieldChange("description", e.target.value)}
              className="mt-2 min-h-[100px] md:min-h-[120px] bg-background"
            />
          </div>

          <div>
            <Label htmlFor="image" className="text-sm font-medium">
              Imagen de la Propiedad
            </Label>
            <div className="flex items-center gap-4 mt-2">
              {imagePreview && (
                <div className="relative h-32 w-32 border rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={imagePreview}
                    alt="Vista previa"
                    fill
                    className="object-cover"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    onClick={onRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="flex-1">
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={onImageUpload}
                  disabled={uploadingImage}
                  className="cursor-pointer bg-background"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Formatos: JPEG, PNG, WebP, GIF. Máximo 5MB
                </p>
                {uploadingImage && (
                  <p className="text-sm text-muted-foreground mt-1">Subiendo imagen...</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="property_type_id" className="text-sm font-medium">
              Tipo de Propiedad <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.property_type_id}
              onValueChange={(value) => onFieldChange("property_type_id", value)}
            >
              <SelectTrigger className="mt-2 bg-background">
                <SelectValue placeholder="Selecciona un tipo" />
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
      </div>

      {/* Status Section */}
      <div>
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="text-lg">⚙️</span> Estado
        </h3>
        <div className="bg-muted/30 p-4 md:p-6 rounded-lg border border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="font-medium text-foreground">Propiedad activa</p>
            <p className="text-sm text-muted-foreground">Activar o desactivar la propiedad</p>
          </div>
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) => onFieldChange("is_active", checked)}
          />
        </div>
      </div>
    </div>
  )
}

