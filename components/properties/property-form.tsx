"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, Loader2, X } from "lucide-react"
import Link from "next/link"
import { generateSlug, checkSlugUniqueness, generateUniqueSlug } from "@/lib/utils/slug"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { PropertyFormGeneral } from "./forms/property-form-general"
import { PropertyFormLocation } from "./forms/property-form-location"
import { PropertyFormCharacteristics } from "./forms/property-form-characteristics"
import { PropertyFormPricing } from "./forms/property-form-pricing"
import { PropertyFormChannels } from "./forms/property-form-channels"

interface PropertyFormProps {
  propertyTypes: any[]
  tenantId: string
  property?: any
}

export function PropertyForm({ propertyTypes, tenantId, property }: PropertyFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  const [loading, setLoading] = useState(false)
  const [allChannels, setAllChannels] = useState<Array<{ id: string; name: string; logo_url: string | null }>>([])
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [loadingChannels, setLoadingChannels] = useState(false)
  
  const [formData, setFormData] = useState({
    property_code: property?.property_code || "",
    name: property?.name || "",
    slug: property?.slug || property?.id || "", // Usar id como fallback si slug no existe
    description: property?.description || "",
    image_url: property?.image_url || "",
    property_type_id: property?.property_type_id || "",
    street: property?.street || "",
    number: property?.number || "",
    city: property?.city || "",
    province: property?.province || "",
    postal_code: property?.postal_code || "",
    country: property?.country || "España",
    bedrooms: property?.bedrooms || 0,
    bathrooms: property?.bathrooms || 0,
    max_guests: property?.max_guests || 0,
    min_nights: property?.min_nights || 1,
    square_meters: property?.square_meters || 0,
    base_price_per_night: property?.base_price_per_night || 0,
    cleaning_fee: property?.cleaning_fee || 0,
    security_deposit: property?.security_deposit || 0,
    check_in_time: property?.check_in_time || "15:00",
    check_out_time: property?.check_out_time || "11:00",
    is_active: property?.is_active ?? true,
  })

  const [imagePreview, setImagePreview] = useState<string | null>(property?.image_url || null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const [slugError, setSlugError] = useState<string | null>(null)
  const [slugValidating, setSlugValidating] = useState(false)
  const [autoGeneratingSlug, setAutoGeneratingSlug] = useState(false)

  // Aplicar valor por defecto de property type cuando se cargan los tipos
  useEffect(() => {
    if (!property && propertyTypes.length > 0 && !formData.property_type_id) {
      const defaultType = propertyTypes.find((t: any) => t.is_default === true)
      if (defaultType) {
        setFormData(prev => ({ ...prev, property_type_id: defaultType.id }))
      }
    }
  }, [propertyTypes, property, formData.property_type_id])

  // Cargar canales disponibles
  useEffect(() => {
    const loadChannels = async () => {
      setLoadingChannels(true)
      try {
        const response = await fetch("/api/sales-channels")
        if (response.ok) {
          const data = await response.json()
          setAllChannels(data.map((c: any) => ({
            id: c.id,
            name: c.person.full_name,
            logo_url: c.logo_url,
          })))
        }
      } catch (error) {
        console.error("Error loading channels:", error)
      } finally {
        setLoadingChannels(false)
      }
    }
    loadChannels()
  }, [])

  // Cargar canales activos de la propiedad si está editando
  useEffect(() => {
    const loadPropertyChannels = async () => {
      if (!property?.id) {
        setSelectedChannels([])
        return
      }
      
      try {
        const response = await fetch(`/api/properties/${property.id}/sales-channels`)
        if (response.ok) {
          const data = await response.json()
          setSelectedChannels(data.channelIds || [])
        }
      } catch (error) {
        console.error("Error loading property channels:", error)
      }
    }
    loadPropertyChannels()
  }, [property?.id])

  // Generar slug automáticamente cuando cambia el nombre (con debounce)
  useEffect(() => {
    if (!property?.id && formData.name && !formData.slug) {
      // Solo generar automáticamente si es una nueva propiedad y no hay slug
      const timeoutId = setTimeout(async () => {
        setAutoGeneratingSlug(true)
        try {
          const generatedSlug = await generateUniqueSlug(formData.name)
          setFormData(prev => ({ ...prev, slug: generatedSlug }))
          setSlugError(null)
        } catch (error) {
          console.error("Error generating slug:", error)
        } finally {
          setAutoGeneratingSlug(false)
        }
      }, 500) // Debounce de 500ms

      return () => clearTimeout(timeoutId)
    }
  }, [formData.name, property?.id])

  // Validar unicidad del slug cuando cambia (con debounce)
  useEffect(() => {
    if (!formData.slug) {
      setSlugError(null)
      return
    }

    const timeoutId = setTimeout(async () => {
      setSlugValidating(true)
      try {
        const isUnique = await checkSlugUniqueness(formData.slug, property?.id)
        if (!isUnique) {
          setSlugError("Este slug ya está en uso por otra propiedad")
        } else {
          setSlugError(null)
        }
      } catch (error) {
        console.error("Error validating slug:", error)
        setSlugError("Error al validar el slug")
      } finally {
        setSlugValidating(false)
      }
    }, 500) // Debounce de 500ms

    return () => clearTimeout(timeoutId)
  }, [formData.slug, property?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validación básica
      if (!formData.name.trim()) {
        throw new Error("El nombre de la propiedad es obligatorio")
      }
      
      if (!formData.property_code.trim()) {
        throw new Error("El código de la propiedad es obligatorio")
      }

      // Validar slug
      if (!formData.slug.trim()) {
        throw new Error("El slug es obligatorio")
      }

      if (slugError) {
        throw new Error(slugError)
      }

      // Verificar unicidad del slug una última vez antes de guardar
      const isUnique = await checkSlugUniqueness(formData.slug, property?.id)
      if (!isUnique) {
        throw new Error("El slug ya está en uso por otra propiedad. Por favor, elige otro.")
      }

      // Normalizar slug antes de guardar
      const normalizedSlug = generateSlug(formData.slug.trim())

      // Limpiar campos UUID vacíos (convertir "" a null)
      const dataToSave = {
        ...formData,
        slug: normalizedSlug,
        property_type_id: formData.property_type_id || null,
        tenant_id: tenantId,
        updated_at: new Date().toISOString(),
      }

      let propertyId: string
      
      if (property) {
        // Update existing property
        const { error } = await supabase.from("properties").update(dataToSave).eq("id", property.id)

        if (error) throw error
        propertyId = property.id

        toast({
          title: "Propiedad actualizada",
          description: "La propiedad se ha actualizado correctamente.",
        })
      } else {
        // Create new property
        const { error, data: newProperty } = await supabase
          .from("properties")
          .insert(dataToSave)
          .select()
          .single()

        if (error) throw error
        propertyId = newProperty.id

        toast({
          title: "Propiedad creada",
          description: "La propiedad se ha creado correctamente.",
        })
      }

      // Guardar canales de venta activos
      if (propertyId) {
        try {
          const response = await fetch(`/api/properties/${propertyId}/sales-channels`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ channelIds: selectedChannels }),
          })

          if (!response.ok) {
            console.error("Error saving property channels")
            // No lanzar error, solo loguear
          }
        } catch (error) {
          console.error("Error saving property channels:", error)
          // No lanzar error, solo loguear
        }
      }

      router.push("/dashboard/properties")
      router.refresh()
    } catch (error: any) {
      console.error("[v0] Error saving property:", error)
      console.error("[v0] Error details:", JSON.stringify(error, null, 2))
      
      let errorMessage = "No se pudo guardar la propiedad."
      
      if (error?.message) {
        errorMessage = error.message
      } else if (error?.error?.message) {
        errorMessage = error.error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const [activeTab, setActiveTab] = useState("general")
  const [mobileTab, setMobileTab] = useState("general")

  const TABS = [
    { value: "general", label: "General" },
    { value: "location", label: "Ubicación" },
    { value: "characteristics", label: "Características" },
    { value: "pricing", label: "Precios" },
    { value: "channels", label: "Canales" },
  ]

  const handleFieldChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSlugChange = (slug: string) => {
    setFormData((prev) => ({ ...prev, slug }))
  }

  const handleChannelToggle = (channelId: string, checked: boolean) => {
    if (checked) {
      setSelectedChannels([...selectedChannels, channelId])
    } else {
      setSelectedChannels(selectedChannels.filter((id) => id !== channelId))
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Solo se permiten imágenes (JPEG, PNG, WebP, GIF)",
        variant: "destructive",
      })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "El archivo es demasiado grande. Máximo 5MB",
        variant: "destructive",
      })
      return
    }

    setUploadingImage(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append("file", file)

      const response = await fetch("/api/upload/property-image", {
        method: "POST",
        body: formDataUpload,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Error al subir la imagen")
      }

      const { url } = await response.json()
      setFormData((prev) => ({ ...prev, image_url: url }))
      setImagePreview(url)
      
      toast({
        title: "Imagen subida",
        description: "La imagen se ha subido correctamente",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al subir la imagen",
        variant: "destructive",
      })
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image_url: "" }))
    setImagePreview(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted/20 to-background p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/dashboard/properties">
            <Button variant="ghost" size="sm" className="gap-2 p-1.5 hover:bg-muted rounded-lg transition" type="button">
              <ArrowLeft className="w-5 h-5 text-foreground" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {property ? "Editar Propiedad" : "Nueva Propiedad"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {property
                ? "Actualiza la información de tu propiedad vacacional"
                : "Crea una nueva propiedad vacacional"}
            </p>
          </div>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden md:block">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 bg-muted p-1 rounded-lg h-auto">
              {TABS.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="text-xs sm:text-sm py-2"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Mobile Tab Selector */}
        <div className="md:hidden">
          <Select value={mobileTab} onValueChange={setMobileTab}>
            <SelectTrigger className="w-full bg-background">
              <SelectValue placeholder="Selecciona una sección" />
            </SelectTrigger>
            <SelectContent>
              {TABS.map((tab) => (
                <SelectItem key={tab.value} value={tab.value}>
                  {tab.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <form onSubmit={handleSubmit} className="space-y-6 md:space-y-0">
        <div className="hidden md:block">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsContent value="general" className="space-y-6 mt-0">
                <PropertyFormGeneral
                  formData={{
                    property_code: formData.property_code,
                    name: formData.name,
                    slug: formData.slug,
                    description: formData.description,
                    image_url: formData.image_url,
                    property_type_id: formData.property_type_id,
                    is_active: formData.is_active,
                  }}
                  propertyTypes={propertyTypes}
                  propertyId={property?.id}
                  slugError={slugError}
                  slugValidating={slugValidating}
                  autoGeneratingSlug={autoGeneratingSlug}
                  imagePreview={imagePreview}
                  uploadingImage={uploadingImage}
                  onFieldChange={handleFieldChange}
                  onSlugChange={handleSlugChange}
                  onImageUpload={handleImageUpload}
                  onRemoveImage={handleRemoveImage}
                />
              </TabsContent>

              <TabsContent value="location" className="space-y-6 mt-0">
                <PropertyFormLocation
                  formData={{
                    street: formData.street,
                    number: formData.number,
                    city: formData.city,
                    province: formData.province,
                    postal_code: formData.postal_code,
                    country: formData.country,
                  }}
                  onFieldChange={handleFieldChange}
                />
              </TabsContent>

              <TabsContent value="characteristics" className="space-y-6 mt-0">
                <PropertyFormCharacteristics
                  formData={{
                    bedrooms: formData.bedrooms,
                    bathrooms: formData.bathrooms,
                    max_guests: formData.max_guests,
                    square_meters: formData.square_meters,
                    min_nights: formData.min_nights,
                  }}
                  onFieldChange={handleFieldChange}
                />
              </TabsContent>

              <TabsContent value="pricing" className="space-y-6 mt-0">
                <PropertyFormPricing
                  formData={{
                    base_price_per_night: formData.base_price_per_night,
                    cleaning_fee: formData.cleaning_fee,
                    security_deposit: formData.security_deposit,
                    check_in_time: formData.check_in_time,
                    check_out_time: formData.check_out_time,
                  }}
                  onFieldChange={handleFieldChange}
                />
              </TabsContent>

              <TabsContent value="channels" className="space-y-6 mt-0">
                <PropertyFormChannels
                  allChannels={allChannels}
                  selectedChannels={selectedChannels}
                  loadingChannels={loadingChannels}
                  onChannelToggle={handleChannelToggle}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* Mobile Content */}
          <div className="md:hidden space-y-6">
            {mobileTab === "general" && (
              <PropertyFormGeneral
                formData={{
                  property_code: formData.property_code,
                  name: formData.name,
                  slug: formData.slug,
                  description: formData.description,
                  image_url: formData.image_url,
                  property_type_id: formData.property_type_id,
                  is_active: formData.is_active,
                }}
                propertyTypes={propertyTypes}
                propertyId={property?.id}
                slugError={slugError}
                slugValidating={slugValidating}
                autoGeneratingSlug={autoGeneratingSlug}
                imagePreview={imagePreview}
                uploadingImage={uploadingImage}
                onFieldChange={handleFieldChange}
                onSlugChange={handleSlugChange}
                onImageUpload={handleImageUpload}
                onRemoveImage={handleRemoveImage}
              />
            )}
            {mobileTab === "location" && (
              <PropertyFormLocation
                formData={{
                  street: formData.street,
                  number: formData.number,
                  city: formData.city,
                  province: formData.province,
                  postal_code: formData.postal_code,
                  country: formData.country,
                }}
                onFieldChange={handleFieldChange}
              />
            )}
            {mobileTab === "characteristics" && (
              <PropertyFormCharacteristics
                formData={{
                  bedrooms: formData.bedrooms,
                  bathrooms: formData.bathrooms,
                  max_guests: formData.max_guests,
                  square_meters: formData.square_meters,
                  min_nights: formData.min_nights,
                }}
                onFieldChange={handleFieldChange}
              />
            )}
            {mobileTab === "pricing" && (
              <PropertyFormPricing
                formData={{
                  base_price_per_night: formData.base_price_per_night,
                  cleaning_fee: formData.cleaning_fee,
                  security_deposit: formData.security_deposit,
                  check_in_time: formData.check_in_time,
                  check_out_time: formData.check_out_time,
                }}
                onFieldChange={handleFieldChange}
              />
            )}
            {mobileTab === "channels" && (
              <PropertyFormChannels
                allChannels={allChannels}
                selectedChannels={selectedChannels}
                loadingChannels={loadingChannels}
                onChannelToggle={handleChannelToggle}
              />
            )}
          </div>

        {/* Footer Actions */}
        <div className="border-t border-border bg-card sticky bottom-0 z-40 mt-8">
          <div className="py-4">
            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end">
              <Link href="/dashboard/properties">
                <Button variant="outline" className="w-full sm:w-auto" type="button" disabled={loading}>
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={loading} className="w-full sm:w-auto bg-primary hover:bg-primary/90">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {property ? "Actualizar Propiedad" : "Crear Propiedad"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
