"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, Upload, X, User, Wrench } from "lucide-react"
import Image from "next/image"
import type { ServiceProviderWithDetails, CreateServiceProviderData, UpdateServiceProviderData } from "@/types/service-providers"
import { ServiceProviderServicesManager } from "./ServiceProviderServicesManager"

interface ServiceProviderFormProps {
  provider?: ServiceProviderWithDetails
  tenantId: string
  onSave?: (data: CreateServiceProviderData | UpdateServiceProviderData) => Promise<boolean>
}

export function ServiceProviderForm({
  provider,
  tenantId,
  onSave,
}: ServiceProviderFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const [formData, setFormData] = useState({
    full_name: provider?.person.full_name ?? "",
    document_type: provider?.person.document_type ?? "",
    document_number: provider?.person.document_number ?? "",
    email: provider?.person.email ?? "",
    phone: provider?.person.phone ?? "",
    logo_url: provider?.logo_url ?? "",
    notes: provider?.person.notes ?? "",
    is_active: provider?.is_active ?? true,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [logoPreview, setLogoPreview] = useState<string | null>(formData.logo_url || null)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.full_name || formData.full_name.trim() === "") {
      newErrors.full_name = "El nombre completo es obligatorio"
    }

    if (formData.email && formData.email.trim() !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El email no es válido"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploadingLogo(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append("file", file)

      const response = await fetch("/api/upload/logo", {
        method: "POST",
        body: formDataUpload,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Error al subir el logo")
      }

      const { url } = await response.json()
      setFormData((prev) => ({ ...prev, logo_url: url }))
      setLogoPreview(url)
      
      toast({
        title: "Logo subido",
        description: "El logo se ha subido correctamente",
      })
    } catch (error: any) {
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
    setFormData((prev) => ({ ...prev, logo_url: "" }))
    setLogoPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Error de validación",
        description: "Por favor, corrige los errores en el formulario",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const providerData = {
        full_name: formData.full_name?.trim() || "",
        document_type: formData.document_type?.trim() || null,
        document_number: formData.document_number?.trim() || null,
        email: formData.email?.trim() || null,
        phone: formData.phone?.trim() || null,
        logo_url: formData.logo_url?.trim() || null,
        notes: formData.notes?.trim() || null,
        is_active: formData.is_active ?? true,
      }

      if (onSave) {
        const success = await onSave(providerData)
        if (success) {
          toast({
            title: provider ? "Proveedor actualizado" : "Proveedor creado",
            description: `El proveedor de servicios ha sido ${provider ? "actualizado" : "creado"} correctamente`,
          })
          router.push("/dashboard/service-providers")
        }
      } else {
        const url = provider
          ? `/api/service-providers/${provider.id}`
          : "/api/service-providers"
        const method = provider ? "PUT" : "POST"

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(providerData),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || "Error al guardar el proveedor")
        }

        toast({
          title: provider ? "Proveedor actualizado" : "Proveedor creado",
          description: `El proveedor de servicios ha sido ${provider ? "actualizado" : "creado"} correctamente`,
        })
        router.push("/dashboard/service-providers")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al guardar el proveedor",
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
          <CardTitle>{provider ? "Editar Proveedor" : "Nuevo Proveedor"}</CardTitle>
          <CardDescription>Complete la información del proveedor en las siguientes pestañas</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="provider" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="provider" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Datos del Proveedor</span>
              </TabsTrigger>
              {provider && (
                <TabsTrigger value="services" className="flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  <span className="hidden sm:inline">Servicios</span>
                </TabsTrigger>
              )}
            </TabsList>

            {/* Pestaña: Datos del Proveedor */}
            <TabsContent value="provider" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Información del Proveedor</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Datos básicos del proveedor de servicios
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="full_name">
                    Nombre del Proveedor <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="full_name"
                    value={formData.full_name ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, full_name: e.target.value })
                    }
                    placeholder="Ej: Limpiezas ABC, Mantenimientos XYZ"
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
                  <Label htmlFor="logo">Logo del Proveedor</Label>
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
                      <p className="text-xs text-muted-foreground mt-1">
                        Formatos: JPEG, PNG, WebP, GIF. Máximo 5MB
                      </p>
                    </div>
                  </div>
                  {uploadingLogo && (
                    <p className="text-sm text-muted-foreground">Subiendo logo...</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Notas adicionales sobre el proveedor..."
                    rows={4}
                  />
                </div>

                <div className="flex items-center justify-between space-x-2 pt-4 border-t">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_active">Estado del Proveedor</Label>
                    <p className="text-sm text-muted-foreground">
                      {formData.is_active
                        ? "El proveedor está activo y disponible para usar"
                        : "El proveedor está inactivo y no aparecerá en las opciones"}
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
              </div>
            </TabsContent>

            {/* Pestaña: Servicios */}
            {provider && (
              <TabsContent value="services" className="space-y-4 mt-6">
                <ServiceProviderServicesManager
                  serviceProviderId={provider.id}
                  tenantId={tenantId}
                />
              </TabsContent>
            )}
          </Tabs>
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
              {provider ? "Actualizar" : "Crear"} Proveedor
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

