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
import { PropertyFormLanding } from "./forms/property-form-landing"
import { PropertyImageGallery } from "./PropertyImageGallery"

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
    check_in_instructions: property?.check_in_instructions || "",
    landing_config: property?.landing_config || null,
    is_active: property?.is_active ?? true,
    pricing_periods: [] as any[], // New state for pricing periods
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
    const loadPropertyData = async () => {
      if (!property?.id) {
        setSelectedChannels([])
        // Initial base period for new property
        setFormData(prev => ({
          ...prev,
          pricing_periods: [{
            is_base: true,
            season_name: "Precios básicos",
            price_night: 0,
            min_nights: 1
          }]
        }))
        return
      }

      try {
        // Load channels and pricing in parallel
        const [channelsRes, pricingRes] = await Promise.all([
          fetch(`/api/properties/${property.id}/sales-channels`),
          fetch(`/api/properties/${property.id}/pricing`)
        ])

        if (channelsRes.ok) {
          const channelsData = await channelsRes.json()
          setSelectedChannels(channelsData.channelIds || [])
        }

        if (pricingRes.ok) {
          const pricingData = await pricingRes.json()
          if (pricingData && pricingData.length > 0) {
            setFormData(prev => ({ ...prev, pricing_periods: pricingData }))
          } else {
            // Fallback if no pricing data but property exists
            setFormData(prev => ({
              ...prev,
              pricing_periods: [{
                is_base: true,
                season_name: "Precios básicos",
                price_night: property.base_price_per_night || 0,
                min_nights: property.min_nights || 1
              }]
            }))
          }
        }
      } catch (error) {
        console.error("Error loading property extra data:", error)
      }
    }
    loadPropertyData()
  }, [property?.id, property?.base_price_per_night, property?.min_nights])

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
      const { pricing_periods, ...restFormData } = formData
      const dataToSave = {
        ...restFormData,
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

      // Guardar canales de venta activos y precios
      if (propertyId) {
        const tenantIdValue = tenantId
        try {
          await Promise.all([
            fetch(`/api/properties/${propertyId}/sales-channels`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ channelIds: selectedChannels }),
            }),
            fetch(`/api/properties/${propertyId}/pricing`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                pricingPeriods: formData.pricing_periods,
                tenantId: tenantIdValue
              }),
            })
          ])
        } catch (error) {
          console.error("Error saving property pricing or channels:", error)
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
    { value: "landing", label: "Landing" },
    { value: "gallery", label: "Galería" },
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
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Fixed Header */}
      <div className="px-8 pt-8 pb-4 shrink-0 bg-white border-b border-slate-100 shadow-sm z-50">
        <div className="flex flex-col gap-6 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/properties">
              <Button variant="ghost" size="sm" className="gap-2 p-2 hover:bg-slate-100 rounded-xl transition" type="button">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </Button>
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
                {property ? "Editar Propiedad" : "Nueva Propiedad"}
              </h1>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
                {property ? property.name : "Nueva propiedad vacacional"}
              </p>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
              <span className={`text-[10px] font-black uppercase tracking-widest ${formData.is_active ? "text-emerald-600" : "text-slate-400"}`}>
                {formData.is_active ? "Activa" : "Inactiva"}
              </span>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => handleFieldChange("is_active", checked)}
              />
            </div>
          </div>

          {/* Tabs - Now inside the fixed header */}
          <div className="w-full">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="flex bg-slate-100/50 p-1.5 rounded-2xl h-auto border border-slate-200/50 w-fit">
                {TABS.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-8 pt-6 pb-20">
        <div className="max-w-[1600px] mx-auto">
          <form onSubmit={handleSubmit} id="property-form">
            <Tabs value={activeTab} className="w-full">
              <TabsContent value="general" className="mt-0">
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

              <TabsContent value="location" className="mt-0">
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

              <TabsContent value="characteristics" className="mt-0">
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

              <TabsContent value="pricing" className="mt-0">
                <PropertyFormPricing
                  formData={{
                    base_price_per_night: formData.base_price_per_night,
                    cleaning_fee: formData.cleaning_fee,
                    security_deposit: formData.security_deposit,
                    check_in_time: formData.check_in_time,
                    check_out_time: formData.check_out_time,
                    check_in_instructions: formData.check_in_instructions,
                    pricing_periods: formData.pricing_periods,
                  }}
                  onFieldChange={handleFieldChange}
                />
              </TabsContent>

              <TabsContent value="channels" className="mt-0">
                <PropertyFormChannels
                  allChannels={allChannels}
                  selectedChannels={selectedChannels}
                  loadingChannels={loadingChannels}
                  onChannelToggle={handleChannelToggle}
                  landingConfig={formData.landing_config}
                  onLandingConfigChange={(config) => handleFieldChange("landing_config", config)}
                />
              </TabsContent>

              <TabsContent value="landing" className="mt-0">
                <PropertyFormLanding
                  formData={formData}
                  onFieldChange={handleFieldChange}
                />
              </TabsContent>

              <TabsContent value="gallery" className="mt-0">
                {property?.id ? (
                  <PropertyImageGallery
                    propertyId={property.id}
                    tenantId={tenantId}
                  />
                ) : (
                  <div className="bg-white rounded-[2rem] p-20 text-center border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <p className="text-xl font-bold text-slate-400">Guarda la propiedad primero para gestionar la galería</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </form>
        </div>
      </div>

      {/* Fixed Footer Actions */}
      <div className="px-8 py-6 bg-white border-t border-slate-100 shrink-0 z-50">
        <div className="max-w-[1600px] mx-auto flex flex-col-reverse sm:flex-row gap-4 justify-between items-center">
          <div className="hidden sm:block">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cambios no guardados</p>
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <Link href="/dashboard/properties" className="flex-1 sm:flex-initial">
              <Button variant="outline" className="w-full sm:px-8 h-12 rounded-2xl font-bold border-slate-200 text-slate-600 hover:bg-slate-50 transition-all" type="button" disabled={loading}>
                Cancelar
              </Button>
            </Link>
            <Button form="property-form" type="submit" disabled={loading} className="flex-1 sm:flex-initial sm:px-12 h-12 rounded-2xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100 transition-all">
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
    </div>
  )
}
