"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, X, ImageIcon } from "lucide-react"
import type { PropertyImage } from "@/types/property-images"

interface ImageSelectorProps {
  value: string // URL actual
  onChange: (url: string) => void
  propertyId?: string // Para cargar galería
}

export function ImageSelector({ value, onChange, propertyId }: ImageSelectorProps) {
  const [images, setImages] = useState<PropertyImage[]>([])
  const [loading, setLoading] = useState(false)
  const [manualUrl, setManualUrl] = useState(value || "")
  const [activeTab, setActiveTab] = useState<"gallery" | "manual">(
    propertyId ? "gallery" : "manual"
  )

  // Cargar imágenes de la galería cuando hay propertyId
  useEffect(() => {
    if (propertyId && activeTab === "gallery") {
      loadImages()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propertyId, activeTab])

  // Sincronizar manualUrl con value cuando cambia externamente
  useEffect(() => {
    if (value) {
      setManualUrl(value)
    } else {
      setManualUrl("")
    }
  }, [value])

  const loadImages = async () => {
    if (!propertyId) return

    setLoading(true)
    try {
      const response = await fetch(`/api/properties/${propertyId}/images`)
      if (response.ok) {
        const data = await response.json()
        setImages(data || [])
        
        // Si hay una imagen seleccionada y está en la galería, cambiar a tab de galería
        if (value && data.some((img: PropertyImage) => img.image_url === value)) {
          setActiveTab("gallery")
        }
      } else {
        console.error("Error loading images:", response.statusText)
      }
    } catch (error) {
      console.error("Error loading images:", error)
    } finally {
      setLoading(false)
    }
  }

  // Detectar si la imagen actual viene de la galería al cargar
  useEffect(() => {
    if (value && propertyId && images.length > 0) {
      const isFromGallery = images.some((img) => img.image_url === value)
      if (isFromGallery && activeTab !== "gallery") {
        setActiveTab("gallery")
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images, value, propertyId])

  const handleGallerySelect = (imageUrl: string) => {
    onChange(imageUrl)
    setManualUrl(imageUrl)
  }

  const handleManualUrlChange = (url: string) => {
    setManualUrl(url)
    onChange(url)
  }

  const handleClear = () => {
    setManualUrl("")
    onChange("")
  }

  const isValidUrl = (url: string): boolean => {
    if (!url) return false
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const isImageFromGallery = (url: string): boolean => {
    if (!url || !propertyId) return false
    return images.some((img) => img.image_url === url)
  }

  return (
    <div className="space-y-4">
      <Label>Imagen de la Sección</Label>

      {propertyId ? (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "gallery" | "manual")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="gallery">Galería de la Propiedad</TabsTrigger>
            <TabsTrigger value="manual">URL Manual</TabsTrigger>
          </TabsList>

          <TabsContent value="gallery" className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Cargando imágenes...
                </span>
              </div>
            ) : images.length === 0 ? (
              <div className="rounded-lg border border-dashed p-8 text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No hay imágenes en la galería.
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Sube imágenes desde la gestión de la propiedad.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto p-2">
                {images.map((image) => {
                  const isSelected = value === image.image_url
                  return (
                    <div
                      key={image.id}
                      className={`relative aspect-square cursor-pointer rounded-lg border-2 overflow-hidden transition-all ${
                        isSelected
                          ? "border-primary ring-2 ring-primary ring-offset-2"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => handleGallerySelect(image.image_url)}
                    >
                      <img
                        src={image.image_url}
                        alt={image.title || "Imagen"}
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                          <div className="bg-primary text-primary-foreground rounded-full p-1">
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        </div>
                      )}
                      {image.title && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs p-1 truncate">
                          {image.title}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="space-y-2">
              <Input
                value={manualUrl}
                onChange={(e) => handleManualUrlChange(e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
                type="url"
              />
              {manualUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpiar selección
                </Button>
              )}
            </div>

            {manualUrl && isValidUrl(manualUrl) && (
              <div className="relative h-32 rounded-lg border overflow-hidden bg-muted">
                <img
                  src={manualUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='16' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EImagen no disponible%3C/text%3E%3C/svg%3E"
                  }}
                />
              </div>
            )}

            {manualUrl && !isValidUrl(manualUrl) && (
              <p className="text-sm text-destructive">
                Por favor, ingresa una URL válida
              </p>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Input
              value={manualUrl}
              onChange={(e) => handleManualUrlChange(e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
              type="url"
            />
            {manualUrl && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Limpiar selección
              </Button>
            )}
          </div>

          {manualUrl && isValidUrl(manualUrl) && (
            <div className="relative aspect-video rounded-lg border overflow-hidden bg-muted">
              <Image
                src={manualUrl}
                alt="Preview"
                fill
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg"
                }}
              />
            </div>
          )}

          {manualUrl && !isValidUrl(manualUrl) && (
            <p className="text-sm text-destructive">
              Por favor, ingresa una URL válida
            </p>
          )}
        </div>
      )}

      {/* Preview de imagen seleccionada */}
      {value && (
        <div className="space-y-2">
          <Label className="text-sm">Vista previa:</Label>
          <div className="relative h-32 rounded-lg border overflow-hidden bg-muted">
            <img
              src={value}
              alt="Imagen seleccionada"
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23e5e7eb' width='400' height='300'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='16' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EImagen no disponible%3C/text%3E%3C/svg%3E"
              }}
            />
            {isImageFromGallery(value) && (
              <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded">
                De galería
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

