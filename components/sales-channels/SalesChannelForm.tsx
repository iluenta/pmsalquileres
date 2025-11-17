"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, Upload, X } from "lucide-react"
import Image from "next/image"
import type { SalesChannelWithDetails, CreateSalesChannelData, UpdateSalesChannelData } from "@/types/sales-channels"
import type { ConfigurationValue } from "@/lib/api/configuration"

interface SalesChannelFormProps {
  channel?: SalesChannelWithDetails
  tenantId: string
  onSave?: (data: CreateSalesChannelData | UpdateSalesChannelData) => Promise<boolean>
}

export function SalesChannelForm({
  channel,
  tenantId,
  onSave,
}: SalesChannelFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const [formData, setFormData] = useState({
    full_name: channel?.person.full_name ?? "",
    document_type: channel?.person.document_type ?? "",
    document_number: channel?.person.document_number ?? "",
    email: channel?.person.email ?? "",
    phone: channel?.person.phone ?? "",
    logo_url: channel?.logo_url ?? "",
    sales_commission: channel?.sales_commission ?? 0,
    collection_commission: channel?.collection_commission ?? 0,
    apply_tax: channel?.apply_tax ?? false,
    tax_type_id: channel?.tax_type_id ?? "",
    notes: channel?.person.notes ?? "",
    is_active: channel?.is_active ?? true,
  })

  const [taxTypes, setTaxTypes] = useState<ConfigurationValue[]>([])
  const [loadingTaxTypes, setLoadingTaxTypes] = useState(false)

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [logoPreview, setLogoPreview] = useState<string | null>(formData.logo_url || null)

  // Cargar tipos de impuesto
  useEffect(() => {
    const loadTaxTypes = async () => {
      setLoadingTaxTypes(true)
      try {
        const response = await fetch("/api/configuration/tax-types")
        if (response.ok) {
          const data = await response.json()
          setTaxTypes(data)
          
          // Aplicar valor por defecto si no hay channel y apply_tax está activo
          if (!channel && formData.apply_tax && !formData.tax_type_id && data.length > 0) {
            const defaultTaxType = data.find((t: ConfigurationValue) => t.is_default === true)
            if (defaultTaxType) {
              setFormData(prev => ({ ...prev, tax_type_id: defaultTaxType.id }))
            }
          }
        }
      } catch (error) {
        console.error("Error loading tax types:", error)
      } finally {
        setLoadingTaxTypes(false)
      }
    }
    loadTaxTypes()
  }, [channel])

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      console.log("[SalesChannelForm] handleLogoUpload: No file selected")
      return
    }

    console.log("[SalesChannelForm] handleLogoUpload: File selected", {
      name: file.name,
      type: file.type,
      size: file.size,
    })

    // Validar tipo
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      console.log("[SalesChannelForm] handleLogoUpload: Invalid file type", file.type)
      toast({
        title: "Error",
        description: "Solo se permiten imágenes (JPEG, PNG, WebP, GIF)",
        variant: "destructive",
      })
      return
    }

    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.log("[SalesChannelForm] handleLogoUpload: File too large", file.size)
      toast({
        title: "Error",
        description: "El archivo es demasiado grande. Máximo 5MB",
        variant: "destructive",
      })
      return
    }

    setUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      console.log("[SalesChannelForm] handleLogoUpload: Uploading file to /api/upload/logo")
      const response = await fetch("/api/upload/logo", {
        method: "POST",
        body: formData,
      })

      console.log("[SalesChannelForm] handleLogoUpload: Response status", response.status, response.ok)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[SalesChannelForm] handleLogoUpload: Upload failed", errorData)
        throw new Error(errorData.error || "Error al subir el logo")
      }

      const responseData = await response.json()
      console.log("[SalesChannelForm] handleLogoUpload: Upload success", responseData)
      
      const { url } = responseData
      if (!url) {
        console.error("[SalesChannelForm] handleLogoUpload: No URL in response", responseData)
        throw new Error("No se recibió la URL del logo")
      }

      console.log("[SalesChannelForm] handleLogoUpload: Setting logo_url to", url)
      setFormData((prev) => {
        const updated = { ...prev, logo_url: url }
        console.log("[SalesChannelForm] handleLogoUpload: Updated formData", updated)
        return updated
      })
      setLogoPreview(url)

      toast({
        title: "Logo subido",
        description: "El logo se ha subido correctamente",
      })
    } catch (error: any) {
      console.error("[SalesChannelForm] handleLogoUpload: Error", error)
      toast({
        title: "Error",
        description: error.message || "Error al subir el logo",
        variant: "destructive",
      })
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleRemoveLogo = () => {
    setFormData({ ...formData, logo_url: "" })
    setLogoPreview(null)
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.full_name?.trim()) {
      newErrors.full_name = "El nombre del canal es obligatorio"
    }

    if (formData.sales_commission < 0 || formData.sales_commission > 100) {
      newErrors.sales_commission = "La comisión de venta debe estar entre 0 y 100"
    }

    if (formData.collection_commission < 0 || formData.collection_commission > 100) {
      newErrors.collection_commission = "La comisión de cobro debe estar entre 0 y 100"
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El email no es válido"
    }

    if (formData.apply_tax && !formData.tax_type_id) {
      newErrors.tax_type_id = "Debe seleccionar un tipo de impuesto si aplica IVA"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("[SalesChannelForm] handleSubmit: Starting submit", {
      channel: channel?.id,
      formData,
    })

    if (!validateForm()) {
      console.log("[SalesChannelForm] handleSubmit: Validation failed")
      toast({
        title: "Error de validación",
        description: "Por favor, corrige los errores en el formulario",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const channelData = {
        full_name: formData.full_name?.trim() || "",
        document_type: formData.document_type?.trim() || null,
        document_number: formData.document_number?.trim() || null,
        email: formData.email?.trim() || null,
        phone: formData.phone?.trim() || null,
        logo_url: formData.logo_url?.trim() || null,
        sales_commission: formData.sales_commission ?? 0,
        collection_commission: formData.collection_commission ?? 0,
        apply_tax: formData.apply_tax ?? false,
        tax_type_id: formData.apply_tax && formData.tax_type_id ? formData.tax_type_id : null,
        notes: formData.notes?.trim() || null,
        is_active: formData.is_active ?? true,
      }

      console.log("[SalesChannelForm] handleSubmit: Prepared channelData", channelData)

      if (onSave) {
        const success = await onSave(channelData)
        if (success) {
          toast({
            title: channel ? "Canal actualizado" : "Canal creado",
            description: `El canal de venta ha sido ${channel ? "actualizado" : "creado"} correctamente`,
          })
          router.push("/dashboard/sales-channels")
          router.refresh()
        }
      } else {
        // Llamar a la API directamente
        const url = channel
          ? `/api/sales-channels/${channel.id}`
          : "/api/sales-channels"
        const method = channel ? "PUT" : "POST"

        console.log("[SalesChannelForm] handleSubmit: Calling API", {
          url,
          method,
          channelData,
        })

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(channelData),
        })

        console.log("[SalesChannelForm] handleSubmit: API response", {
          status: response.status,
          ok: response.ok,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error("[SalesChannelForm] handleSubmit: API error", errorData)
          throw new Error(errorData.error || "Error al guardar el canal")
        }

        const responseData = await response.json().catch(() => null)
        console.log("[SalesChannelForm] handleSubmit: API success", responseData)

        toast({
          title: channel ? "Canal actualizado" : "Canal creado",
          description: `El canal de venta ha sido ${channel ? "actualizado" : "creado"} correctamente`,
        })
        router.push("/dashboard/sales-channels")
        router.refresh()
      }
    } catch (error: any) {
      console.error("Error saving sales channel:", error)
      
      let errorMessage = "Error al guardar el canal"
      
      if (error?.message) {
        errorMessage = error.message
      } else if (error?.error?.message) {
        errorMessage = error.error.message
      } else if (error?.error) {
        errorMessage = typeof error.error === 'string' ? error.error : JSON.stringify(error.error)
      } else if (typeof error === 'string') {
        errorMessage = error
      } else if (error?.details) {
        errorMessage = error.details
      } else if (error?.hint) {
        errorMessage = error.hint
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
      <Card>
        <CardHeader>
          <CardTitle>Información del Canal</CardTitle>
          <CardDescription>Datos básicos del canal de venta</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">
              Nombre del Canal <span className="text-red-500">*</span>
            </Label>
            <Input
              id="full_name"
              value={formData.full_name ?? ""}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              placeholder="Ej: Booking.com, Airbnb, Propio"
            />
            {errors.full_name && (
              <p className="text-sm text-red-500">{errors.full_name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="document_type">Tipo de Documento</Label>
              <Input
                id="document_type"
                value={formData.document_type ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, document_type: e.target.value })
                }
                placeholder="CIF, NIF, etc."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="document_number">Número de Documento</Label>
              <Input
                id="document_number"
                value={formData.document_number ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, document_number: e.target.value })
                }
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="email@ejemplo.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+34 600 000 000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Logo del Canal</Label>
            <div className="flex items-center gap-4">
              {logoPreview && (
                <div className="relative h-20 w-20 border rounded">
                  <Image
                    src={logoPreview}
                    alt="Logo preview"
                    fill
                    className="object-contain p-2"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                    onClick={handleRemoveLogo}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <div className="flex-1">
                <Input
                  id="logo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploadingLogo}
                  className="cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formatos: JPEG, PNG, WebP, GIF. Máximo 5MB
                </p>
              </div>
            </div>
            {uploadingLogo && (
              <p className="text-sm text-gray-500">Subiendo logo...</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Comisiones e Impuestos</CardTitle>
          <CardDescription>Configuración de comisiones y tasas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sales_commission">
                Comisión de Venta (%) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sales_commission"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.sales_commission ?? 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    sales_commission: parseFloat(e.target.value) || 0,
                  })
                }
              />
              {errors.sales_commission && (
                <p className="text-sm text-red-500">{errors.sales_commission}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="collection_commission">
                Comisión de Cobro (%) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="collection_commission"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={formData.collection_commission ?? 0}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    collection_commission: parseFloat(e.target.value) || 0,
                  })
                }
              />
              {errors.collection_commission && (
                <p className="text-sm text-red-500">{errors.collection_commission}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-4 border-t">
            <Checkbox
              id="apply_tax"
              checked={formData.apply_tax}
              onCheckedChange={(checked) => {
                // Si se activa apply_tax y no hay tax_type_id, aplicar el valor por defecto
                let newTaxTypeId = checked ? formData.tax_type_id : ""
                if (checked && !formData.tax_type_id && taxTypes.length > 0) {
                  const defaultTaxType = taxTypes.find((t: ConfigurationValue) => t.is_default === true)
                  if (defaultTaxType) {
                    newTaxTypeId = defaultTaxType.id
                  }
                }
                setFormData({ 
                  ...formData, 
                  apply_tax: checked as boolean,
                  tax_type_id: newTaxTypeId
                })
              }}
            />
            <div className="space-y-1">
              <Label htmlFor="apply_tax" className="cursor-pointer">
                Aplicar IVA sobre las comisiones
              </Label>
              <p className="text-sm text-muted-foreground">
                Si está marcado, se aplicará el impuesto seleccionado sobre las comisiones de venta y cobro
              </p>
            </div>
          </div>

          {formData.apply_tax && (
            <div className="space-y-2">
              <Label htmlFor="tax_type_id">
                Tipo de Impuesto <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.tax_type_id || undefined}
                onValueChange={(value) =>
                  setFormData({ ...formData, tax_type_id: value })
                }
              >
                <SelectTrigger id="tax_type_id">
                  <SelectValue placeholder="Seleccione un tipo de impuesto" />
                </SelectTrigger>
                <SelectContent>
                  {loadingTaxTypes ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      Cargando tipos de impuesto...
                    </div>
                  ) : taxTypes.length === 0 ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No hay tipos de impuesto configurados. Configúralos en el módulo de configuración.
                    </div>
                  ) : (
                    taxTypes.map((taxType) => {
                      const percentage = taxType.description ? parseFloat(taxType.description) : 0
                      return (
                        <SelectItem key={taxType.id} value={taxType.id}>
                          {taxType.label} ({percentage}%)
                        </SelectItem>
                      )
                    })
                  )}
                </SelectContent>
              </Select>
              {errors.tax_type_id && (
                <p className="text-sm text-red-500">{errors.tax_type_id}</p>
              )}
            </div>
          )}

          <div className="flex items-center justify-between space-x-2 pt-4 border-t">
            <div className="space-y-0.5">
              <Label htmlFor="is_active">Estado del Canal</Label>
              <p className="text-sm text-muted-foreground">
                {formData.is_active 
                  ? "El canal está activo y disponible para usar en reservas" 
                  : "El canal está inactivo y no aparecerá en las opciones de reservas"}
              </p>
            </div>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, is_active: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notas</CardTitle>
          <CardDescription>Información adicional sobre el canal</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            id="notes"
            value={formData.notes ?? ""}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="Notas adicionales sobre el canal..."
            rows={4}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {channel ? "Actualizar" : "Crear"} Canal
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

