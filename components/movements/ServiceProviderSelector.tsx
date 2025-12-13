"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Plus, Loader2 } from "lucide-react"
import type { ServiceProviderWithDetails } from "@/types/service-providers"
import type { CreateServiceProviderData } from "@/types/service-providers"

interface ServiceProviderSelectorProps {
  value?: string
  onValueChange: (value: string) => void
  tenantId: string
}

export function ServiceProviderSelector({
  value,
  onValueChange,
  tenantId,
}: ServiceProviderSelectorProps) {
  const { toast } = useToast()
  const [providers, setProviders] = useState<ServiceProviderWithDetails[]>([])
  const [loading, setLoading] = useState(false)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newProviderData, setNewProviderData] = useState({
    full_name: "",
    email: "",
    phone: "",
  })

  useEffect(() => {
    loadProviders()
  }, [])

  const loadProviders = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/service-providers?includeInactive=false")
      if (response.ok) {
        const data = await response.json()
        setProviders(data)
      }
    } catch (error) {
      console.error("Error loading providers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProvider = async () => {
    if (!newProviderData.full_name.trim()) {
      toast({
        title: "Error",
        description: "El nombre del proveedor es obligatorio",
        variant: "destructive",
      })
      return
    }

    setCreating(true)
    try {
      const createData: CreateServiceProviderData = {
        full_name: newProviderData.full_name.trim(),
        email: newProviderData.email.trim() || null,
        phone: newProviderData.phone.trim() || null,
        is_active: true,
      }

      const response = await fetch("/api/service-providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Error al crear el proveedor")
      }

      const newProvider = await response.json()

      toast({
        title: "Proveedor creado",
        description: "El proveedor ha sido creado correctamente. Puedes añadir servicios desde la edición del proveedor.",
      })

      setCreateDialogOpen(false)
      setNewProviderData({ full_name: "", email: "", phone: "" })
      await loadProviders()
      onValueChange(newProvider.id)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al crear el proveedor",
        variant: "destructive",
      })
    } finally {
      setCreating(false)
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <Select value={value} onValueChange={onValueChange} disabled={loading}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder={loading ? "Cargando..." : "Seleccionar proveedor"} />
          </SelectTrigger>
          <SelectContent>
            {providers.map((provider) => (
              <SelectItem key={provider.id} value={provider.id}>
                {provider.person.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setCreateDialogOpen(true)}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Crear Nuevo Proveedor</DialogTitle>
            <DialogDescription>
              Crea un nuevo proveedor de servicios. Podrás añadir servicios después desde la edición del proveedor.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="provider_name">
                Nombre del Proveedor <span className="text-red-500">*</span>
              </Label>
              <Input
                id="provider_name"
                value={newProviderData.full_name}
                onChange={(e) =>
                  setNewProviderData({ ...newProviderData, full_name: e.target.value })
                }
                placeholder="Ej: Limpiezas ABC S.L."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider_email">Email</Label>
              <Input
                id="provider_email"
                type="email"
                value={newProviderData.email}
                onChange={(e) =>
                  setNewProviderData({ ...newProviderData, email: e.target.value })
                }
                placeholder="email@ejemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider_phone">Teléfono</Label>
              <Input
                id="provider_phone"
                value={newProviderData.phone}
                onChange={(e) =>
                  setNewProviderData({ ...newProviderData, phone: e.target.value })
                }
                placeholder="+34 600 000 000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              disabled={creating}
            >
              Cancelar
            </Button>
            <Button type="button" onClick={handleCreateProvider} disabled={creating}>
              {creating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                "Crear"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

