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
import { Loader2, Save, User, Phone, MapPin, ShieldCheck, Mail, Globe, ArrowLeft, Calendar, FileText, Activity } from "lucide-react"
import Link from "next/link"
import type { PersonWithDetails, CreatePersonData, UpdatePersonData } from "@/types/persons"
import type { ConfigurationValue } from "@/lib/api/configuration"
import { PersonContactsManager } from "./PersonContactsManager"
import { PersonAddressesManager } from "./PersonAddressesManager"

interface PersonFormProps {
  person?: PersonWithDetails
  tenantId: string
  onSave?: (data: CreatePersonData | UpdatePersonData) => Promise<boolean>
  title: string
  subtitle: string
}

export function PersonForm({
  person,
  tenantId,
  onSave,
  title,
  subtitle,
}: PersonFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [personTypes, setPersonTypes] = useState<ConfigurationValue[]>([])
  const [loadingTypes, setLoadingTypes] = useState(false)

  const [formData, setFormData] = useState({
    person_type: person?.person_type || "",
    first_name: person?.first_name || "",
    last_name: person?.last_name || "",
    full_name: person?.full_name || "",
    document_type: person?.document_type || "",
    document_number: person?.document_number || "",
    birth_date: person?.birth_date ? person.birth_date.split("T")[0] : "",
    nationality: person?.nationality || "",
    notes: person?.notes || "",
    is_active: person?.is_active ?? true,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const loadPersonTypes = async () => {
      setLoadingTypes(true)
      try {
        const response = await fetch("/api/configuration/person-types")
        if (response.ok) {
          const types = await response.json()
          setPersonTypes(types)

          // Aplicar valor por defecto si no hay person y no hay tipo seleccionado
          if (!person && !formData.person_type && types.length > 0) {
            const defaultType = types.find((t: ConfigurationValue) => t.is_default === true)
            if (defaultType) {
              setFormData(prev => ({ ...prev, person_type: defaultType.id }))
            }
          }
        }
      } catch (error) {
        console.error("Error loading person types:", error)
      } finally {
        setLoadingTypes(false)
      }
    }
    loadPersonTypes()
  }, [person])

  const isJuridicalPerson = () => {
    if (!formData.person_type) return false
    const selectedType = personTypes.find((t) => t.id === formData.person_type)
    // Consideramos jurídicas si el tipo contiene palabras clave
    return selectedType?.value?.includes("company") ||
      selectedType?.value?.includes("business") ||
      selectedType?.value?.includes("juridical") ||
      selectedType?.label?.toLowerCase().includes("jurídica") ||
      selectedType?.label?.toLowerCase().includes("empresa") ||
      selectedType?.label?.toLowerCase().includes("canal") ||
      selectedType?.label?.toLowerCase().includes("proveedor")
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.person_type || formData.person_type.trim() === "") {
      newErrors.person_type = "El tipo de persona es obligatorio"
    }

    if (isJuridicalPerson()) {
      if (!formData.full_name || formData.full_name.trim() === "") {
        newErrors.full_name = "El nombre completo es obligatorio para personas jurídicas"
      }
    } else {
      if (!formData.first_name || formData.first_name.trim() === "") {
        newErrors.first_name = "El nombre es obligatorio"
      }
      if (!formData.last_name || formData.last_name.trim() === "") {
        newErrors.last_name = "El apellido es obligatorio"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
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
      const personData: CreatePersonData | UpdatePersonData = {
        person_type: formData.person_type,
        first_name: isJuridicalPerson() ? null : (formData.first_name?.trim() || null),
        last_name: isJuridicalPerson() ? null : (formData.last_name?.trim() || null),
        full_name: isJuridicalPerson() ? (formData.full_name?.trim() || null) : null,
        document_type: formData.document_type?.trim() || null,
        document_number: formData.document_number?.trim() || null,
        birth_date: formData.birth_date || null,
        nationality: formData.nationality?.trim() || null,
        notes: formData.notes?.trim() || null,
        is_active: formData.is_active ?? true,
      }

      if (onSave) {
        const success = await onSave(personData)
        if (success) {
          toast({
            title: person ? "Persona actualizada" : "Persona creada",
            description: `La persona ha sido ${person ? "actualizada" : "creada"} correctamente`,
          })
          router.push("/dashboard/persons")
        }
      } else {
        const url = person
          ? `/api/persons/${person.id}`
          : "/api/persons"
        const method = person ? "PUT" : "POST"

        const response = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(personData),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || "Error al guardar la persona")
        }

        toast({
          title: person ? "Persona actualizada" : "Persona creada",
          description: `La persona ha sido ${person ? "actualizada" : "creada"} correctamente`,
        })
        router.push("/dashboard/persons")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al guardar la persona",
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
          <Link href="/dashboard/persons">
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
              {formData.is_active ? "Persona Activa" : "Persona Inactiva"}
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
          <Tabs defaultValue="data" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="bg-slate-100 p-1.5 rounded-2xl h-14 w-full max-w-md shadow-inner border border-slate-200">
                <TabsTrigger value="data" className="rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-indigo-600 transition-all flex-1 h-full">
                  <User className="h-4 w-4" />
                  Datos
                </TabsTrigger>
                {person && (
                  <>
                    <TabsTrigger value="contacts" className="rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-indigo-600 transition-all flex-1 h-full">
                      <Phone className="h-4 w-4" />
                      Contactos
                    </TabsTrigger>
                    <TabsTrigger value="addresses" className="rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 data-[state=active]:bg-white data-[state=active]:shadow-lg data-[state=active]:text-indigo-600 transition-all flex-1 h-full">
                      <MapPin className="h-4 w-4" />
                      Direcciones
                    </TabsTrigger>
                  </>
                )}
              </TabsList>
            </div>

            <TabsContent value="data" className="mt-0 outline-none">
              <Card className="rounded-[2.5rem] border-none shadow-[0_8px_40px_rgb(0,0,0,0.03)] bg-white overflow-hidden">
                <div className="bg-slate-50/30 px-10 py-6 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-indigo-50 rounded-2xl flex items-center justify-center">
                      <User className="w-5 h-5 text-indigo-500" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 tracking-tighter uppercase text-sm">Identidad Básica</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Información principal del perfil</p>
                    </div>
                  </div>
                </div>

                <CardContent className="p-10 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Tipo de Persona</Label>
                      <Select
                        value={formData.person_type || undefined}
                        onValueChange={(value) => handleFieldChange("person_type", value)}
                        disabled={!!person}
                      >
                        <SelectTrigger className="rounded-2xl h-14 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 transition-all font-bold text-slate-700 px-6">
                          <SelectValue placeholder="Selecciona un tipo" />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-slate-100 shadow-xl bg-white p-2">
                          {personTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id} className="rounded-xl font-bold py-3">
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.person_type && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-1">{errors.person_type}</p>}
                    </div>

                    {isJuridicalPerson() ? (
                      <div className="space-y-3">
                        <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Razón Social</Label>
                        <div className="relative">
                          <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                          <Input
                            value={formData.full_name ?? ""}
                            onChange={(e) => handleFieldChange("full_name", e.target.value)}
                            className="rounded-2xl h-14 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 transition-all font-bold text-lg pl-14"
                            placeholder="Nombre corporativo"
                          />
                        </div>
                        {errors.full_name && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-1">{errors.full_name}</p>}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Nombre</Label>
                          <Input
                            value={formData.first_name ?? ""}
                            onChange={(e) => handleFieldChange("first_name", e.target.value)}
                            className="rounded-2xl h-14 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 transition-all font-bold text-lg px-6"
                          />
                          {errors.first_name && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-1">{errors.first_name}</p>}
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Apellidos</Label>
                          <Input
                            value={formData.last_name ?? ""}
                            onChange={(e) => handleFieldChange("last_name", e.target.value)}
                            className="rounded-2xl h-14 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 transition-all font-bold text-lg px-6"
                          />
                          {errors.last_name && <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-1">{errors.last_name}</p>}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pt-6 border-t border-slate-50">
                    <div className="space-y-3">
                      <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Tipo Doc.</Label>
                      <div className="relative">
                        <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        <Input
                          value={formData.document_type ?? ""}
                          onChange={(e) => handleFieldChange("document_type", e.target.value)}
                          placeholder="DNI/NIE"
                          className="rounded-2xl h-14 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 transition-all font-bold pl-14 uppercase"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Nº Documento</Label>
                      <Input
                        value={formData.document_number ?? ""}
                        onChange={(e) => handleFieldChange("document_number", e.target.value)}
                        className="rounded-2xl h-14 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 transition-all font-bold px-6"
                      />
                    </div>
                    {!isJuridicalPerson() && (
                      <>
                        <div className="space-y-3">
                          <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">F. Nacimiento</Label>
                          <div className="relative">
                            <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
                            <Input
                              type="date"
                              value={formData.birth_date ?? ""}
                              onChange={(e) => handleFieldChange("birth_date", e.target.value)}
                              className="rounded-2xl h-14 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 transition-all font-bold pl-14"
                            />
                          </div>
                        </div>
                        <div className="space-y-3">
                          <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Nacionalidad</Label>
                          <div className="relative">
                            <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                            <Input
                              value={formData.nationality ?? ""}
                              onChange={(e) => handleFieldChange("nationality", e.target.value)}
                              className="rounded-2xl h-14 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 transition-all font-bold pl-14"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="space-y-4 pt-6 border-t border-slate-50">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Observaciones / Notas Internas</Label>
                    <div className="relative">
                      <FileText className="absolute left-5 top-6 w-5 h-5 text-slate-300" />
                      <Textarea
                        value={formData.notes ?? ""}
                        onChange={(e) => handleFieldChange("notes", e.target.value)}
                        className="min-h-[140px] rounded-[1.5rem] border-slate-200 focus:border-indigo-500 focus:ring-indigo-500/10 transition-all font-medium text-sm p-6 pl-14"
                        placeholder="..."
                        rows={4}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {person && (
              <>
                <TabsContent value="contacts" className="mt-0 outline-none">
                  <div className="rounded-[2.5rem] border-none shadow-[0_8px_40px_rgb(0,0,0,0.03)] bg-white overflow-hidden p-10">
                    <PersonContactsManager personId={person.id} tenantId={tenantId} />
                  </div>
                </TabsContent>
                <TabsContent value="addresses" className="mt-0 outline-none">
                  <div className="rounded-[2.5rem] border-none shadow-[0_8px_40px_rgb(0,0,0,0.03)] bg-white overflow-hidden p-10">
                    <PersonAddressesManager personId={person.id} tenantId={tenantId} />
                  </div>
                </TabsContent>
              </>
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
                  <span>{person ? "Actualizar" : "Crear"} Persona</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

