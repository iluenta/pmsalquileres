"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, Loader2, Info, MapPin, Home, DollarSign, ShoppingCart, ToggleLeft } from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
    description: property?.description || "",
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

      // Limpiar campos UUID vacíos (convertir "" a null)
      const dataToSave = {
        ...formData,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild type="button">
          <Link href="/dashboard/properties">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="location" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Ubicación
          </TabsTrigger>
          <TabsTrigger value="characteristics" className="flex items-center gap-2">
            <Home className="h-4 w-4" />
            Características
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Precios
          </TabsTrigger>
          <TabsTrigger value="channels" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Canales
          </TabsTrigger>
        </TabsList>

        {/* Pestaña: Información General */}
        <TabsContent value="general" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>Datos principales de la propiedad</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="property_code">Código de Propiedad *</Label>
              <Input
                id="property_code"
                value={formData.property_code}
                onChange={(e) => setFormData({ ...formData, property_code: e.target.value })}
                placeholder="ej: PROP-001"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ej: Apartamento Centro Madrid"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción detallada de la propiedad..."
              disabled={loading}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="property_type_id">Tipo de Propiedad</Label>
            <Select
              value={formData.property_type_id}
              onValueChange={(value) => setFormData({ ...formData, property_type_id: value })}
            >
              <SelectTrigger id="property_type_id">
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
        </CardContent>
      </Card>

          {/* Estado */}
          <Card>
            <CardHeader>
              <CardTitle>Estado</CardTitle>
              <CardDescription>Activar o desactivar la propiedad</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  disabled={loading}
                />
                <Label htmlFor="is_active">Propiedad activa</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña: Ubicación */}
        <TabsContent value="location" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Ubicación</CardTitle>
              <CardDescription>Dirección de la propiedad</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="street">Calle</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                placeholder="Calle Principal"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="number">Número</Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                placeholder="123"
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="Madrid"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="province">Provincia</Label>
              <Input
                id="province"
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                placeholder="Madrid"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postal_code">Código Postal</Label>
              <Input
                id="postal_code"
                value={formData.postal_code}
                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                placeholder="28001"
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">País</Label>
            <Input
              id="country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              placeholder="España"
              disabled={loading}
            />
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        {/* Pestaña: Características */}
        <TabsContent value="characteristics" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Características</CardTitle>
              <CardDescription>Detalles de la propiedad</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Habitaciones</Label>
              <Input
                id="bedrooms"
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: Number.parseInt(e.target.value) || 0 })}
                disabled={loading}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bathrooms">Baños</Label>
              <Input
                id="bathrooms"
                type="number"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: Number.parseInt(e.target.value) || 0 })}
                disabled={loading}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_guests">Huéspedes Máx.</Label>
              <Input
                id="max_guests"
                type="number"
                value={formData.max_guests}
                onChange={(e) => setFormData({ ...formData, max_guests: Number.parseInt(e.target.value) || 0 })}
                disabled={loading}
                min="0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="square_meters">Metros²</Label>
              <Input
                id="square_meters"
                type="number"
                value={formData.square_meters}
                onChange={(e) => setFormData({ ...formData, square_meters: Number.parseFloat(e.target.value) || 0 })}
                disabled={loading}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="min_nights">Noches Mínimas *</Label>
              <Input
                id="min_nights"
                type="number"
                value={formData.min_nights}
                onChange={(e) => setFormData({ ...formData, min_nights: Number.parseInt(e.target.value) || 1 })}
                disabled={loading}
                min="1"
                required
              />
              <p className="text-xs text-muted-foreground">
                Número mínimo de noches requeridas para reservas comerciales
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        {/* Pestaña: Precios */}
        <TabsContent value="pricing" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Precios</CardTitle>
              <CardDescription>Configuración de precios y tarifas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="base_price_per_night">Precio Base/Noche (€)</Label>
              <Input
                id="base_price_per_night"
                type="number"
                value={formData.base_price_per_night}
                onChange={(e) =>
                  setFormData({ ...formData, base_price_per_night: Number.parseFloat(e.target.value) || 0 })
                }
                disabled={loading}
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cleaning_fee">Tarifa de Limpieza (€)</Label>
              <Input
                id="cleaning_fee"
                type="number"
                value={formData.cleaning_fee}
                onChange={(e) => setFormData({ ...formData, cleaning_fee: Number.parseFloat(e.target.value) || 0 })}
                disabled={loading}
                min="0"
                step="0.01"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="security_deposit">Depósito de Seguridad (€)</Label>
              <Input
                id="security_deposit"
                type="number"
                value={formData.security_deposit}
                onChange={(e) => setFormData({ ...formData, security_deposit: Number.parseFloat(e.target.value) || 0 })}
                disabled={loading}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="check_in_time">Hora de Check-in</Label>
              <Input
                id="check_in_time"
                type="time"
                value={formData.check_in_time}
                onChange={(e) => setFormData({ ...formData, check_in_time: e.target.value })}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="check_out_time">Hora de Check-out</Label>
              <Input
                id="check_out_time"
                type="time"
                value={formData.check_out_time}
                onChange={(e) => setFormData({ ...formData, check_out_time: e.target.value })}
                disabled={loading}
              />
            </div>
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        {/* Pestaña: Canales de Venta */}
        <TabsContent value="channels" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Canales de Venta Activos</CardTitle>
              <CardDescription>
                Selecciona los canales de venta activos para esta propiedad. 
                Solo estos canales estarán disponibles al crear reservas para esta propiedad.
              </CardDescription>
            </CardHeader>
            <CardContent>
          {loadingChannels ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : allChannels.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay canales de venta disponibles. Crea canales desde la sección "Canales de Venta".
            </p>
          ) : (
            <div className="space-y-3">
              {allChannels.map((channel) => (
                <div key={channel.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-accent/50">
                  <Checkbox
                    id={`channel-${channel.id}`}
                    checked={selectedChannels.includes(channel.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedChannels([...selectedChannels, channel.id])
                      } else {
                        setSelectedChannels(selectedChannels.filter(id => id !== channel.id))
                      }
                    }}
                    disabled={loading}
                  />
                  <Label
                    htmlFor={`channel-${channel.id}`}
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                  >
                    {channel.logo_url && (
                      <div className="relative h-8 w-8">
                        <Image
                          src={channel.logo_url}
                          alt={channel.name}
                          fill
                          className="object-contain rounded"
                        />
                      </div>
                    )}
                    <span className="font-medium">{channel.name}</span>
                  </Label>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
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
        <Button type="button" variant="outline" asChild disabled={loading}>
          <Link href="/dashboard/properties">Cancelar</Link>
        </Button>
      </div>
    </form>
  )
}
