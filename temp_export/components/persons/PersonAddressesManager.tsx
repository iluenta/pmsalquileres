"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
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
import type { PersonFiscalAddress, CreatePersonAddressData, UpdatePersonAddressData } from "@/types/persons"

interface PersonAddressesManagerProps {
  personId: string
  tenantId: string
}

export function PersonAddressesManager({
  personId,
  tenantId,
}: PersonAddressesManagerProps) {
  const { toast } = useToast()
  const toastRef = useRef(toast)
  const [addresses, setAddresses] = useState<PersonFiscalAddress[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<PersonFiscalAddress | null>(null)
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    street: "",
    number: "",
    floor: "",
    door: "",
    city: "",
    province: "",
    postal_code: "",
    country: "",
    is_primary: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    toastRef.current = toast
  }, [toast])

  const loadAddresses = useCallback(async () => {
    if (!personId) return
    setLoading(true)
    try {
      const response = await fetch(`/api/persons/${personId}`)
      if (response.ok) {
        const person = await response.json()
        setAddresses(person.addresses || [])
      }
    } catch (error) {
      console.error("Error loading addresses:", error)
      toastRef.current({
        title: "Error",
        description: "Error al cargar las direcciones",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [personId])

  useEffect(() => {
    loadAddresses()
  }, [loadAddresses])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.street || formData.street.trim() === "") {
      newErrors.street = "La calle es obligatoria"
    }

    if (!formData.city || formData.city.trim() === "") {
      newErrors.city = "La ciudad es obligatoria"
    }

    if (!formData.postal_code || formData.postal_code.trim() === "") {
      newErrors.postal_code = "El código postal es obligatorio"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleOpenDialog = (address?: PersonFiscalAddress) => {
    if (address) {
      setEditingAddress(address)
      setFormData({
        street: address.street || "",
        number: address.number || "",
        floor: address.floor || "",
        door: address.door || "",
        city: address.city || "",
        province: address.province || "",
        postal_code: address.postal_code || "",
        country: address.country || "",
        is_primary: address.is_primary,
      })
    } else {
      setEditingAddress(null)
      setFormData({
        street: "",
        number: "",
        floor: "",
        door: "",
        city: "",
        province: "",
        postal_code: "",
        country: "",
        is_primary: false,
      })
    }
    setErrors({})
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingAddress(null)
    setFormData({
      street: "",
      number: "",
      floor: "",
      door: "",
      city: "",
      province: "",
      postal_code: "",
      country: "",
      is_primary: false,
    })
    setErrors({})
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
      const addressData: CreatePersonAddressData | UpdatePersonAddressData = {
        street: formData.street.trim() || null,
        number: formData.number.trim() || null,
        floor: formData.floor.trim() || null,
        door: formData.door.trim() || null,
        city: formData.city.trim() || null,
        province: formData.province.trim() || null,
        postal_code: formData.postal_code.trim() || null,
        country: formData.country.trim() || null,
        is_primary: formData.is_primary,
      }

      if (editingAddress) {
        const response = await fetch(`/api/persons/addresses/${editingAddress.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(addressData),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || "Error al actualizar la dirección")
        }

        toast({
          title: "Dirección actualizada",
          description: "La dirección ha sido actualizada correctamente",
        })
      } else {
        const response = await fetch(`/api/persons/${personId}/addresses`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(addressData),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || "Error al crear la dirección")
        }

        toast({
          title: "Dirección añadida",
          description: "La dirección ha sido añadida correctamente",
        })
      }

      handleCloseDialog()
      loadAddresses()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al guardar la dirección",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (addressId: string) => {
    setDeletingAddressId(addressId)
    try {
      const response = await fetch(`/api/persons/addresses/${addressId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Error al eliminar la dirección")
      }

      toast({
        title: "Dirección eliminada",
        description: "La dirección ha sido eliminada correctamente",
      })

      setDeleteDialogOpen(false)
      loadAddresses()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al eliminar la dirección",
        variant: "destructive",
      })
    } finally {
      setDeletingAddressId(null)
    }
  }

  const formatAddress = (address: PersonFiscalAddress): string => {
    const parts: string[] = []
    if (address.street) parts.push(address.street)
    if (address.number) parts.push(address.number)
    if (address.floor) parts.push(`Piso ${address.floor}`)
    if (address.door) parts.push(`Puerta ${address.door}`)
    if (address.postal_code) parts.push(address.postal_code)
    if (address.city) parts.push(address.city)
    if (address.province) parts.push(address.province)
    if (address.country) parts.push(address.country)
    return parts.join(", ") || "Dirección incompleta"
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Direcciones Fiscales</h3>
            <p className="text-sm text-muted-foreground">
              Gestiona las direcciones fiscales de esta persona
            </p>
          </div>
          <Button type="button" onClick={() => handleOpenDialog()} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Añadir Dirección
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2">Cargando direcciones...</p>
          </div>
        ) : addresses.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No hay direcciones configuradas</p>
              <Button type="button" onClick={() => handleOpenDialog()} className="mt-4" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Añadir Primera Dirección
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Principal</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {addresses.map((address) => (
                  <TableRow key={address.id}>
                    <TableCell>
                      <div className="max-w-md">
                        <p className="text-sm">{formatAddress(address)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {address.is_primary ? (
                        <Badge variant="default">Principal</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={address.is_active ? "default" : "secondary"}>
                        {address.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(address)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeletingAddressId(address.id)
                            setDeleteDialogOpen(true)
                          }}
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

      {/* Dialog para añadir/editar dirección */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingAddress ? "Editar Dirección" : "Añadir Dirección"}
            </DialogTitle>
            <DialogDescription>
              {editingAddress
                ? "Modifica la información de la dirección"
                : "Añade una nueva dirección fiscal para esta persona"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="street">
                  Calle <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="street"
                  value={formData.street}
                  onChange={(e) =>
                    setFormData({ ...formData, street: e.target.value })
                  }
                  placeholder="Calle Principal"
                />
                {errors.street && (
                  <p className="text-sm text-red-500">{errors.street}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="number">Número</Label>
                <Input
                  id="number"
                  value={formData.number}
                  onChange={(e) =>
                    setFormData({ ...formData, number: e.target.value })
                  }
                  placeholder="123"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="floor">Piso</Label>
                <Input
                  id="floor"
                  value={formData.floor}
                  onChange={(e) =>
                    setFormData({ ...formData, floor: e.target.value })
                  }
                  placeholder="1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="door">Puerta</Label>
                <Input
                  id="door"
                  value={formData.door}
                  onChange={(e) =>
                    setFormData({ ...formData, door: e.target.value })
                  }
                  placeholder="A"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postal_code">
                  Código Postal <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) =>
                    setFormData({ ...formData, postal_code: e.target.value })
                  }
                  placeholder="28001"
                />
                {errors.postal_code && (
                  <p className="text-sm text-red-500">{errors.postal_code}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">
                  Ciudad <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="Madrid"
                />
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="province">Provincia</Label>
                <Input
                  id="province"
                  value={formData.province}
                  onChange={(e) =>
                    setFormData({ ...formData, province: e.target.value })
                  }
                  placeholder="Madrid"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">País</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  placeholder="España"
                />
              </div>
            </div>

            <div className="flex items-center justify-between space-x-2 pt-4 border-t">
              <div className="space-y-0.5">
                <Label htmlFor="is_primary">Dirección Principal</Label>
                <p className="text-sm text-muted-foreground">
                  Marca esta dirección como principal
                </p>
              </div>
              <Switch
                id="is_primary"
                checked={formData.is_primary}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_primary: checked })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleSubmit}>
              {editingAddress ? "Actualizar" : "Añadir"}
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
              Esta acción no se puede deshacer. Se eliminará la dirección permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingAddressId) {
                  handleDelete(deletingAddressId)
                }
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deletingAddressId ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

