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
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Save, Upload, X, User, Wrench, ArrowLeft, ShieldCheck, Mail, Phone, FileText, Globe } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { ServiceProviderWithDetails, CreateServiceProviderData, UpdateServiceProviderData } from "@/types/service-providers"
import { ServiceProviderServicesManager } from "./ServiceProviderServicesManager"

interface ServiceProviderFormProps {
  provider?: ServiceProviderWithDetails
  tenantId: string
  onSave?: (data: CreateServiceProviderData | UpdateServiceProviderData) => Promise<boolean>
  title: string
  subtitle: string
}

export function ServiceProviderForm({
  provider,
  tenantId,
  onSave,
  title,
  subtitle,
}: ServiceProviderFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
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

  const handleFieldChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setIsDirty(true)
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

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
            duration: 3000,
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
          duration: 3000,
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
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* FIXED HEADER */}
      <div className="px-12 pt-10 pb-8 shrink-0 bg-white border-b border-slate-100 shadow-sm z-50">
        <div className="flex items-center gap-8 max-w-[1600px] mx-auto">
          <Link href="/dashboard/service-providers">
            <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-slate-200 text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <ArrowLeft className="h-6 w-6" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
              {title}
            </h1>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">
              {subtitle}
            </p>
          </div>
          <div className="flex items-center gap-4 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100 shadow-inner">
            <span className={`text-[10px] font-black uppercase tracking-widest ${formData.is_active ? "text-emerald-600" : "text-slate-400"}`}>
              {formData.is_active ? "Proveedor Activo" : "Proveedor Inactivo"}
            </span>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(val) => handleFieldChange("is_active", val)}
            />
          </div>
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-[1600px] mx-auto pb-10">
          <Tabs defaultValue="provider" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="bg-slate-100 p-1.5 rounded-2xl h-14 w-full max-w-md shadow-inner border border-slate-200">
                <TabsTrigger value="provider" className="rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-indigo-600 transition-all flex-1 h-full">
                  <User className="h-4 w-4" />
                  Perfil
                </TabsTrigger>
                {provider && (
                  <TabsTrigger value="services" className="rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-indigo-600 transition-all flex-1 h-full">
                    <Wrench className="h-4 w-4" />
                    Servicios
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            <TabsContent value="provider" className="mt-0 outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Logo & Status Column */}
                <div className="lg:col-span-1 space-y-8">
                  <Card className="rounded-[2.5rem] border-none shadow-[0_8px_40px_rgb(0,0,0,0.03)] bg-white overflow-hidden">
                    <div className="bg-slate-50/30 px-8 py-5 border-b border-slate-100">
                      <h3 className="font-black text-slate-900 tracking-tighter uppercase text-xs">Imagen del Proveedor</h3>
                    </div>
                    <CardContent className="p-8">
                      <div className="flex flex-col items-center gap-6">
                        <div className="relative group">
                          {logoPreview ? (
                            <div className="relative h-40 w-40 rounded-[2rem] overflow-hidden border-2 border-slate-100 bg-white shadow-xl transition-all group-hover:shadow-indigo-100 group-hover:border-indigo-100">
                              <Image
                                src={logoPreview}
                                alt="Logo preview"
                                fill
                                className="object-contain p-4"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-10 w-10 rounded-full bg-white text-red-600 hover:bg-red-50"
                                  onClick={handleRemoveLogo}
                                >
                                  <X className="h-5 w-5" />
                                </Button>
                                <label className="h-10 w-10 rounded-full bg-white text-indigo-600 hover:bg-indigo-50 cursor-pointer flex items-center justify-center">
                                  <Upload className="h-5 w-5" />
                                  <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                                </label>
                              </div>
                            </div>
                          ) : (
                            <label className="relative h-40 w-40 rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50/50 flex flex-col items-center justify-center gap-3 cursor-pointer group hover:border-indigo-400 hover:bg-indigo-50/30 transition-all">
                              <div className="h-12 w-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-500 group-hover:scale-110 transition-all">
                                <Upload className="h-6 w-6" />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-indigo-500 transition-colors px-4 text-center">Subir Logo comercial</span>
                              <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
                            </label>
                          )}
                          {uploadingLogo && (
                            <div className="absolute inset-0 bg-white/80 rounded-[2rem] flex items-center justify-center z-10">
                              <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                            </div>
                          )}
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center px-4">
                          JPEG, PNG, WebP. Máx 5MB
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Info Column */}
                <div className="lg:col-span-2 space-y-8">
                  <Card className="rounded-[2.5rem] border-none shadow-[0_8px_40_rgb(0,0,0,0.03)] bg-white overflow-hidden">
                    <div className="bg-slate-50/30 px-10 py-6 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-indigo-50 rounded-2xl flex items-center justify-center">
                          <User className="w-5 h-5 text-indigo-500" />
                        </div>
                        <div>
                          <h3 className="font-black text-slate-900 tracking-tighter uppercase text-sm">Información Principal</h3>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Identificación del proveedor</p>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-10 space-y-10">
                      <div className="space-y-4">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre Comercial</Label>
                        <div className="relative">
                          <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                          <Input
                            value={formData.full_name ?? ""}
                            onChange={(e) => handleFieldChange("full_name", e.target.value)}
                            className="rounded-2xl h-14 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 transition-all font-bold text-lg pl-14"
                            placeholder="Ej: Mantenimientos Global"
                          />
                        </div>
                        {errors.full_name && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-1">{errors.full_name}</p>}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Principal</Label>
                          <div className="relative">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                            <Input
                              type="email"
                              value={formData.email ?? ""}
                              onChange={(e) => handleFieldChange("email", e.target.value)}
                              className="rounded-2xl h-14 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 transition-all font-bold pl-14"
                              placeholder="proveedor@empresa.com"
                            />
                          </div>
                          {errors.email && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-1">{errors.email}</p>}
                        </div>
                        <div className="space-y-4">
                          <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Teléfono Directo</Label>
                          <div className="relative">
                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                            <Input
                              type="tel"
                              value={formData.phone ?? ""}
                              onChange={(e) => handleFieldChange("phone", e.target.value)}
                              className="rounded-2xl h-14 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 transition-all font-bold pl-14"
                              placeholder="+34 600 000 000"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-50">
                        <div className="space-y-4">
                          <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Tipo de Doc.</Label>
                          <Input
                            value={formData.document_type ?? ""}
                            onChange={(e) => handleFieldChange("document_type", e.target.value)}
                            placeholder="CIF / NIF"
                            className="rounded-2xl h-14 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 transition-all font-bold px-6 uppercase"
                          />
                        </div>
                        <div className="space-y-4">
                          <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Nº Documento</Label>
                          <Input
                            value={formData.document_number ?? ""}
                            onChange={(e) => handleFieldChange("document_number", e.target.value)}
                            className="rounded-2xl h-14 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 transition-all font-bold px-6"
                          />
                        </div>
                      </div>

                      <div className="space-y-4 pt-6 border-t border-slate-50">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Observaciones / Notas Internas</Label>
                        <div className="relative">
                          <FileText className="absolute left-5 top-6 w-5 h-5 text-slate-300" />
                          <Textarea
                            value={formData.notes ?? ""}
                            onChange={(e) => handleFieldChange("notes", e.target.value)}
                            className="min-h-[140px] rounded-[1.5rem] border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 transition-all font-medium text-sm p-6 pl-14"
                            placeholder="Información adicional sobre contratos, horarios o condiciones..."
                            rows={4}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {provider && (
              <TabsContent value="services" className="mt-0 outline-none">
                <div className="rounded-[2.5rem] border-none shadow-[0_8px_40px_rgb(0,0,0,0.03)] bg-white overflow-hidden p-10">
                  <ServiceProviderServicesManager
                    serviceProviderId={provider.id}
                    tenantId={tenantId}
                  />
                </div>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </div>

      {/* FIXED FOOTER */}
      <div className="px-12 py-8 bg-white border-t border-slate-100 shrink-0 z-50">
        <div className="max-w-[1600px] mx-auto flex flex-col-reverse sm:flex-row gap-6 justify-between items-center">
          <div className="hidden sm:block">
            <p className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">
              {isDirty ? "Cambios no guardados" : "Datos actualizados"}
            </p>
          </div>
          <div className="flex gap-4 w-full sm:w-auto min-w-[320px]">
            <Button
              variant="outline"
              className="flex-1 sm:flex-initial sm:px-12 h-14 rounded-2xl font-black uppercase text-xs tracking-widest border-slate-200 text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
              type="button"
              disabled={loading}
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button
              onClick={() => handleSubmit()}
              disabled={loading}
              className="flex-1 sm:flex-initial sm:px-16 h-14 rounded-2xl font-black uppercase text-xs tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-100 transition-all active:scale-95 flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  <span>{provider ? "Actualizar" : "Crear"} Proveedor</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

