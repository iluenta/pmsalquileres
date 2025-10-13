"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import { Separator } from "@/components/ui/separator"

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
    square_meters: property?.square_meters || 0,
    base_price_per_night: property?.base_price_per_night || 0,
    cleaning_fee: property?.cleaning_fee || 0,
    security_deposit: property?.security_deposit || 0,
    check_in_time: property?.check_in_time || "15:00",
    check_out_time: property?.check_out_time || "11:00",
    is_active: property?.is_active ?? true,
  })

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

      if (property) {
        // Update existing property
        const { error } = await supabase.from("properties").update(dataToSave).eq("id", property.id)

        if (error) throw error

        toast({
          title: "Propiedad actualizada",
          description: "La propiedad se ha actualizado correctamente.",
        })
      } else {
        // Create new property
        const { error } = await supabase.from("properties").insert(dataToSave)

        if (error) throw error

        toast({
          title: "Propiedad creada",
          description: "La propiedad se ha creado correctamente.",
        })
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

      {/* Basic Information */}
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

      {/* Location */}
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

      {/* Characteristics */}
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
        </CardContent>
      </Card>

      {/* Pricing */}
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

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle>Estado</CardTitle>
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
