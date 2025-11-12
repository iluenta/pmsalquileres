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
import type { PersonContactInfo, CreatePersonContactData, UpdatePersonContactData } from "@/types/persons"

interface PersonContactsManagerProps {
  personId: string
  tenantId: string
}

export function PersonContactsManager({
  personId,
  tenantId,
}: PersonContactsManagerProps) {
  const { toast } = useToast()
  const toastRef = useRef(toast)
  const [contacts, setContacts] = useState<PersonContactInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [editingContact, setEditingContact] = useState<PersonContactInfo | null>(null)
  const [deletingContactId, setDeletingContactId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    contact_type: "email",
    contact_value: "",
    is_primary: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    toastRef.current = toast
  }, [toast])

  const loadContacts = useCallback(async () => {
    if (!personId) return
    setLoading(true)
    try {
      const response = await fetch(`/api/persons/${personId}`)
      if (response.ok) {
        const person = await response.json()
        setContacts(person.contacts || [])
      }
    } catch (error) {
      console.error("Error loading contacts:", error)
      toastRef.current({
        title: "Error",
        description: "Error al cargar los contactos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [personId])

  useEffect(() => {
    loadContacts()
  }, [loadContacts])

  const contactTypes = [
    { value: "email", label: "Email" },
    { value: "phone", label: "Teléfono" },
    { value: "mobile", label: "Móvil" },
    { value: "fax", label: "Fax" },
    { value: "website", label: "Sitio Web" },
    { value: "other", label: "Otro" },
  ]

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.contact_value || formData.contact_value.trim() === "") {
      newErrors.contact_value = "El valor del contacto es obligatorio"
    }

    if (formData.contact_type === "email" && formData.contact_value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.contact_value)) {
        newErrors.contact_value = "El email no es válido"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleOpenDialog = (contact?: PersonContactInfo) => {
    if (contact) {
      setEditingContact(contact)
      setFormData({
        contact_type: contact.contact_type,
        contact_value: contact.contact_value,
        is_primary: contact.is_primary,
      })
    } else {
      setEditingContact(null)
      setFormData({
        contact_type: "email",
        contact_value: "",
        is_primary: false,
      })
    }
    setErrors({})
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingContact(null)
    setFormData({
      contact_type: "email",
      contact_value: "",
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
      const contactData: CreatePersonContactData | UpdatePersonContactData = {
        contact_type: formData.contact_type,
        contact_value: formData.contact_value.trim(),
        is_primary: formData.is_primary,
      }

      if (editingContact) {
        const response = await fetch(`/api/persons/contacts/${editingContact.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contactData),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || "Error al actualizar el contacto")
        }

        toast({
          title: "Contacto actualizado",
          description: "El contacto ha sido actualizado correctamente",
        })
      } else {
        const response = await fetch(`/api/persons/${personId}/contacts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(contactData),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || "Error al crear el contacto")
        }

        toast({
          title: "Contacto añadido",
          description: "El contacto ha sido añadido correctamente",
        })
      }

      handleCloseDialog()
      loadContacts()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al guardar el contacto",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (contactId: string) => {
    setDeletingContactId(contactId)
    try {
      const response = await fetch(`/api/persons/contacts/${contactId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Error al eliminar el contacto")
      }

      toast({
        title: "Contacto eliminado",
        description: "El contacto ha sido eliminado correctamente",
      })

      setDeleteDialogOpen(false)
      loadContacts()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al eliminar el contacto",
        variant: "destructive",
      })
    } finally {
      setDeletingContactId(null)
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-2">Contactos de la Persona</h3>
            <p className="text-sm text-muted-foreground">
              Gestiona los contactos (email, teléfono, etc.) de esta persona
            </p>
          </div>
          <Button type="button" onClick={() => handleOpenDialog()} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Añadir Contacto
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground mt-2">Cargando contactos...</p>
          </div>
        ) : contacts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No hay contactos configurados</p>
              <Button type="button" onClick={() => handleOpenDialog()} className="mt-4" variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Añadir Primer Contacto
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Principal</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contacts.map((contact) => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">
                      <Badge variant="outline">
                        {contactTypes.find((t) => t.value === contact.contact_type)?.label || contact.contact_type}
                      </Badge>
                    </TableCell>
                    <TableCell>{contact.contact_value}</TableCell>
                    <TableCell>
                      {contact.is_primary ? (
                        <Badge variant="default">Principal</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={contact.is_active ? "default" : "secondary"}>
                        {contact.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(contact)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setDeletingContactId(contact.id)
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

      {/* Dialog para añadir/editar contacto */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingContact ? "Editar Contacto" : "Añadir Contacto"}
            </DialogTitle>
            <DialogDescription>
              {editingContact
                ? "Modifica la información del contacto"
                : "Añade un nuevo contacto para esta persona"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact_type">
                Tipo de Contacto <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.contact_type}
                onValueChange={(value) =>
                  setFormData({ ...formData, contact_type: value })
                }
              >
                <SelectTrigger id="contact_type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {contactTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_value">
                Valor <span className="text-red-500">*</span>
              </Label>
              <Input
                id="contact_value"
                value={formData.contact_value}
                onChange={(e) =>
                  setFormData({ ...formData, contact_value: e.target.value })
                }
                placeholder={
                  formData.contact_type === "email"
                    ? "email@ejemplo.com"
                    : formData.contact_type === "phone" || formData.contact_type === "mobile"
                    ? "+34 600 000 000"
                    : "Valor del contacto"
                }
              />
              {errors.contact_value && (
                <p className="text-sm text-red-500">{errors.contact_value}</p>
              )}
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="is_primary">Contacto Principal</Label>
                <p className="text-sm text-muted-foreground">
                  Marca este contacto como principal para este tipo
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
              {editingContact ? "Actualizar" : "Añadir"}
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
              Esta acción no se puede deshacer. Se eliminará el contacto permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deletingContactId) {
                  handleDelete(deletingContactId)
                }
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deletingContactId ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

