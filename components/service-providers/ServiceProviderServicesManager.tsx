"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2, Loader2 } from "lucide-react"
import type {
  ServiceProviderServiceWithDetails,
  CreateServiceProviderServiceData,
  UpdateServiceProviderServiceData,
} from "@/types/service-providers"
import type { ConfigurationValue } from "@/lib/api/configuration"

interface ServiceProviderServicesManagerProps {
  serviceProviderId: string
  tenantId: string
}

export function ServiceProviderServicesManager({
  serviceProviderId,
  tenantId,
}: ServiceProviderServicesManagerProps) {
  const { toast } = useToast()
  const toastRef = useRef(toast)
  const [services, setServices] = useState<ServiceProviderServiceWithDetails[]>([])
  const [serviceTypes, setServiceTypes] = useState<ConfigurationValue[]>([])
  const [taxTypes, setTaxTypes] = useState<ConfigurationValue[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingTypes, setLoadingTypes] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<ServiceProviderServiceWithDetails | null>(null)
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    service_type_id: "",
    price_type: "fixed" as "fixed" | "percentage",
    price: 0,
    apply_tax: false,
    tax_type_id: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Mantener toast actualizado en la ref
  useEffect(() => {
    toastRef.current = toast
  }, [toast])

  const loadServices = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/service-providers/${serviceProviderId}/services`)
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      }
    } catch (error) {
      console.error("Error loading services:", error)
      toastRef.current({
        title: "Error",
        description: "Error al cargar los servicios",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [serviceProviderId])

  // Cargar servicios
  useEffect(() => {
    loadServices()
  }, [loadServices])

  // Cargar tipos de servicio e impuestos
  useEffect(() => {
    loadServiceTypes()
    loadTaxTypes()
  }, [])

  const loadServiceTypes = async () => {
    setLoadingTypes(true)
    try {
      const response = await fetch("/api/configuration/service-types")
      if (response.ok) {
        const data = await response.json()
        setServiceTypes(data)
      }
    } catch (error) {
      console.error("Error loading service types:", error)
    } finally {
      setLoadingTypes(false)
    }
  }

  const loadTaxTypes = async () => {
    try {
      const response = await fetch("/api/configuration/tax-types")
      if (response.ok) {
        const data = await response.json()
        setTaxTypes(data)
      }
    } catch (error) {
      console.error("Error loading tax types:", error)
    }
  }

  const resetForm = () => {
    setFormData({
      service_type_id: "",
      price_type: "fixed",
      price: 0,
      apply_tax: false,
      tax_type_id: "",
    })
    setErrors({})
    setEditingService(null)
  }

  const handleOpenDialog = (service?: ServiceProviderServiceWithDetails) => {
    if (service) {
      setEditingService(service)
      setFormData({
        service_type_id: service.service_type_id,
        price_type: service.price_type,
        price: service.price,
        apply_tax: service.apply_tax,
        tax_type_id: service.tax_type_id || "",
      })
    } else {
      resetForm()
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    resetForm()
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.service_type_id) {
      newErrors.service_type_id = "El tipo de servicio es obligatorio"
    }

    if (formData.price === undefined || formData.price === null) {
      newErrors.price = "El precio es obligatorio"
    } else if (formData.price_type === "percentage" && (formData.price < 0 || formData.price > 100)) {
      newErrors.price = "El porcentaje debe estar entre 0 y 100"
    } else if (formData.price_type === "fixed" && formData.price < 0) {
      newErrors.price = "El precio fijo debe ser mayor o igual a 0"
    }

    if (formData.apply_tax && !formData.tax_type_id) {
      newErrors.tax_type_id = "Debe seleccionar un tipo de impuesto"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "Error de validación",
        description: "Por favor, corrige los errores en el formulario",
        variant: "destructive",
      })
      return
    }

    try {
      const serviceData: CreateServiceProviderServiceData | UpdateServiceProviderServiceData = {
        service_type_id: formData.service_type_id,
        price_type: formData.price_type,
        price: formData.price,
        apply_tax: formData.apply_tax,
        tax_type_id: formData.apply_tax ? formData.tax_type_id : null,
      }

      if (editingService) {
        // Actualizar
        const response = await fetch(`/api/service-providers/services/${editingService.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(serviceData),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || "Error al actualizar el servicio")
        }

        toast({
          title: "Servicio actualizado",
          description: "El servicio ha sido actualizado correctamente",
        })
      } else {
        // Crear
        const response = await fetch(`/api/service-providers/${serviceProviderId}/services`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(serviceData),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || "Error al crear el servicio")
        }

        toast({
          title: "Servicio añadido",
          description: "El servicio ha sido añadido correctamente",
        })
      }

      handleCloseDialog()
      loadServices()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al guardar el servicio",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (serviceId: string) => {
    setDeletingServiceId(serviceId)
    try {
      const response = await fetch(`/api/service-providers/services/${serviceId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Error al eliminar el servicio")
      }

      toast({
        title: "Servicio eliminado",
        description: "El servicio ha sido eliminado correctamente",
      })

      setDeleteDialogOpen(false)
      loadServices()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al eliminar el servicio",
        variant: "destructive",
      })
    } finally {
      setDeletingServiceId(null)
    }
  }

  // Obtener servicios ya asignados para filtrar
  const assignedServiceTypeIds = services
    .filter((s) => s.id !== editingService?.id)
    .map((s) => s.service_type_id)

  const availableServiceTypes = serviceTypes.filter(
    (st) => !assignedServiceTypeIds.includes(st.id)
  )

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Servicios del Proveedor</h3>
            <p className="text-sm text-muted-foreground">
              Gestiona los servicios que ofrece este proveedor y sus precios
            </p>
          </div>
          <Button type="button" onClick={() => handleOpenDialog()} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Añadir Servicio
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2">Cargando servicios...</p>
          </div>
        ) : services.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No hay servicios configurados</p>
              <Button type="button" onClick={() => handleOpenDialog()} className="mt-4" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Añadir Primer Servicio
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo de Servicio</TableHead>
                  <TableHead>Tipo de Precio</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Impuesto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">
                      {service.service_type?.label || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {service.price_type === "fixed" ? "Precio Fijo" : "Porcentaje"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {service.price_type === "fixed" ? (
                        <span>{service.price.toFixed(2)} €</span>
                      ) : (
                        <span>{service.price.toFixed(2)}%</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {service.apply_tax && service.tax_type ? (
                        <Badge variant="secondary">
                          {service.tax_type.label} ({service.tax_type.description}%)
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">Sin impuesto</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={service.is_active ? "default" : "secondary"}>
                        {service.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(service)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeletingServiceId(service.id)
                            setDeleteDialogOpen(true)
                          }}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Dialog para crear/editar servicio */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingService ? "Editar Servicio" : "Añadir Servicio"}
            </DialogTitle>
            <DialogDescription>
              {editingService
                ? "Modifica la información del servicio"
                : "Añade un nuevo servicio que ofrece este proveedor"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="service_type_id">
                Tipo de Servicio <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.service_type_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, service_type_id: value })
                }
                disabled={!!editingService}
              >
                <SelectTrigger id="service_type_id">
                  <SelectValue placeholder="Seleccione un tipo de servicio" />
                </SelectTrigger>
                <SelectContent>
                  {loadingTypes ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      Cargando tipos de servicio...
                    </div>
                  ) : availableServiceTypes.length === 0 && !editingService ? (
                    <div className="px-2 py-1.5 text-sm text-muted-foreground">
                      No hay tipos de servicio disponibles o todos ya están asignados
                    </div>
                  ) : (
                    <>
                      {editingService && (
                        <SelectItem value={editingService.service_type_id}>
                          {editingService.service_type?.label}
                        </SelectItem>
                      )}
                      {availableServiceTypes.map((serviceType) => (
                        <SelectItem key={serviceType.id} value={serviceType.id}>
                          {serviceType.label}
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
              {errors.service_type_id && (
                <p className="text-sm text-red-500">{errors.service_type_id}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price_type">Tipo de Precio <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.price_type}
                  onValueChange={(value: "fixed" | "percentage") =>
                    setFormData({ ...formData, price_type: value, price: 0 })
                  }
                >
                  <SelectTrigger id="price_type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Precio Fijo (€)</SelectItem>
                    <SelectItem value="percentage">Porcentaje (%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">
                  {formData.price_type === "fixed" ? "Precio (€)" : "Porcentaje (%)"} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  max={formData.price_type === "percentage" ? 100 : undefined}
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })
                  }
                  placeholder={formData.price_type === "fixed" ? "0.00" : "0.00"}
                />
                {errors.price && (
                  <p className="text-sm text-red-500">{errors.price}</p>
                )}
                {formData.price_type === "percentage" && (
                  <p className="text-xs text-muted-foreground">
                    Porcentaje sobre el total de la reserva (0-100)
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch
                id="apply_tax"
                checked={formData.apply_tax}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    apply_tax: checked,
                    tax_type_id: checked ? formData.tax_type_id : "",
                  })
                }
              />
              <Label htmlFor="apply_tax" className="cursor-pointer">
                Aplicar impuesto sobre el precio
              </Label>
            </div>

            {formData.apply_tax && (
              <div className="space-y-2">
                <Label htmlFor="tax_type_id">
                  Tipo de Impuesto <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.tax_type_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, tax_type_id: value })
                  }
                >
                  <SelectTrigger id="tax_type_id">
                    <SelectValue placeholder="Seleccione un tipo de impuesto" />
                  </SelectTrigger>
                  <SelectContent>
                    {taxTypes.length === 0 ? (
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        No hay tipos de impuesto configurados
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
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSubmit}>
              {editingService ? "Actualizar" : "Añadir"} Servicio
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación de eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el servicio del proveedor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingServiceId) {
                  handleDelete(deletingServiceId)
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletingServiceId !== null}
            >
              {deletingServiceId ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Eliminando...
                </>
              ) : (
                "Eliminar"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

