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
import { Loader2, Save, User, Phone, MapPin } from "lucide-react"
import type { PersonWithDetails, CreatePersonData, UpdatePersonData } from "@/types/persons"
import type { ConfigurationValue } from "@/lib/api/configuration"
import { PersonContactsManager } from "./PersonContactsManager"
import { PersonAddressesManager } from "./PersonAddressesManager"

interface PersonFormProps {
  person?: PersonWithDetails
  tenantId: string
  onSave?: (data: CreatePersonData | UpdatePersonData) => Promise<boolean>
}

export function PersonForm({
  person,
  tenantId,
  onSave,
}: PersonFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{person ? "Editar Persona" : "Nueva Persona"}</CardTitle>
          <CardDescription>Complete la información de la persona en las siguientes pestañas</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="data" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="data" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Datos</span>
              </TabsTrigger>
              {person && (
                <>
                  <TabsTrigger value="contacts" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span className="hidden sm:inline">Contactos</span>
                  </TabsTrigger>
                  <TabsTrigger value="addresses" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span className="hidden sm:inline">Direcciones</span>
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            {/* Pestaña: Datos */}
            <TabsContent value="data" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Información de la Persona</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Datos básicos de la persona
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="person_type">
                    Tipo de Persona <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.person_type || undefined}
                    onValueChange={(value) =>
                      setFormData({ ...formData, person_type: value })
                    }
                    disabled={!!person}
                  >
                    <SelectTrigger id="person_type">
                      <SelectValue placeholder="Selecciona un tipo de persona" />
                    </SelectTrigger>
                    <SelectContent>
                      {loadingTypes ? (
                        <SelectItem value="loading" disabled>
                          Cargando tipos...
                        </SelectItem>
                      ) : (
                        personTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.label}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {errors.person_type && (
                    <p className="text-sm text-red-500">{errors.person_type}</p>
                  )}
                </div>

                {isJuridicalPerson() ? (
                  <div className="space-y-2">
                    <Label htmlFor="full_name">
                      Nombre Completo <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="full_name"
                      value={formData.full_name ?? ""}
                      onChange={(e) =>
                        setFormData({ ...formData, full_name: e.target.value })
                      }
                      placeholder="Ej: Empresa ABC, S.L."
                    />
                    {errors.full_name && (
                      <p className="text-sm text-red-500">{errors.full_name}</p>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first_name">
                        Nombre <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="first_name"
                        value={formData.first_name ?? ""}
                        onChange={(e) =>
                          setFormData({ ...formData, first_name: e.target.value })
                        }
                        placeholder="Juan"
                      />
                      {errors.first_name && (
                        <p className="text-sm text-red-500">{errors.first_name}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last_name">
                        Apellidos <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="last_name"
                        value={formData.last_name ?? ""}
                        onChange={(e) =>
                          setFormData({ ...formData, last_name: e.target.value })
                        }
                        placeholder="García López"
                      />
                      {errors.last_name && (
                        <p className="text-sm text-red-500">{errors.last_name}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="document_type">Tipo de Documento</Label>
                    <Input
                      id="document_type"
                      value={formData.document_type ?? ""}
                      onChange={(e) =>
                        setFormData({ ...formData, document_type: e.target.value })
                      }
                      placeholder="DNI, NIE, CIF, etc."
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

                {!isJuridicalPerson() && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="birth_date">Fecha de Nacimiento</Label>
                      <Input
                        id="birth_date"
                        type="date"
                        value={formData.birth_date ?? ""}
                        onChange={(e) =>
                          setFormData({ ...formData, birth_date: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nationality">Nacionalidad</Label>
                      <Input
                        id="nationality"
                        value={formData.nationality ?? ""}
                        onChange={(e) =>
                          setFormData({ ...formData, nationality: e.target.value })
                        }
                        placeholder="Española"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes ?? ""}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Notas adicionales sobre la persona..."
                    rows={4}
                  />
                </div>

                <div className="flex items-center justify-between space-x-2 pt-4 border-t">
                  <div className="space-y-0.5">
                    <Label htmlFor="is_active">Estado de la Persona</Label>
                    <p className="text-sm text-muted-foreground">
                      {formData.is_active
                        ? "La persona está activa y disponible para usar"
                        : "La persona está inactiva y no aparecerá en las opciones"}
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

            {/* Pestaña: Contactos */}
            {person && (
              <TabsContent value="contacts" className="space-y-4 mt-6">
                <PersonContactsManager personId={person.id} tenantId={tenantId} />
              </TabsContent>
            )}

            {/* Pestaña: Direcciones */}
            {person && (
              <TabsContent value="addresses" className="space-y-4 mt-6">
                <PersonAddressesManager personId={person.id} tenantId={tenantId} />
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
              {person ? "Actualizar" : "Crear"} Persona
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

