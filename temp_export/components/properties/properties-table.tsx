"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Building2, MapPin, Users, Bed, Bath, Euro, Pencil, Trash2, Search, Plus, Eye } from "lucide-react"
import type { Property } from "@/lib/api/properties"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
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

interface PropertiesTableProps {
  properties: Property[]
}

export function PropertiesTable({ properties }: PropertiesTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const filteredProperties = properties.filter(
    (property) =>
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.property_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.city?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDelete = async () => {
    if (!deleteId) return

    setDeleting(true)

    try {
      const { error } = await supabase.from("properties").delete().eq("id", deleteId)

      if (error) throw error

      toast({
        title: "Propiedad eliminada",
        description: "La propiedad se ha eliminado correctamente.",
      })

      router.refresh()
      setDeleteId(null)
    } catch (error) {
      console.error("[v0] Error deleting property:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la propiedad.",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "N/A"
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, código o ciudad..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {filteredProperties.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No hay propiedades</p>
              <p className="text-sm text-muted-foreground mb-4">
                {searchTerm
                  ? "No se encontraron propiedades con ese criterio"
                  : "Comienza agregando tu primera propiedad"}
              </p>
              {!searchTerm && (
                <Button onClick={() => router.push("/dashboard/properties/new")}>
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva Propiedad
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredProperties.map((property) => (
                <Card key={property.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg leading-tight line-clamp-1">{property.name}</h3>
                            <Badge variant={property.is_active ? "default" : "secondary"} className="shrink-0">
                              {property.is_active ? "Activa" : "Inactiva"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">Código: {property.property_code}</p>
                          {property.property_type && (
                            <Badge
                              variant="outline"
                              style={{
                                backgroundColor: `${property.property_type.color}20`,
                                color: property.property_type.color || undefined,
                                borderColor: property.property_type.color || undefined,
                              }}
                            >
                              {property.property_type.label}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {(property.city || property.province) && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 shrink-0" />
                          <span className="line-clamp-1">
                            {[property.city, property.province].filter(Boolean).join(", ")}
                          </span>
                        </div>
                      )}

                      <div className="grid grid-cols-3 gap-2 text-sm">
                        {property.bedrooms !== null && (
                          <div className="flex items-center gap-1">
                            <Bed className="h-4 w-4 text-muted-foreground" />
                            <span>{property.bedrooms}</span>
                          </div>
                        )}
                        {property.bathrooms !== null && (
                          <div className="flex items-center gap-1">
                            <Bath className="h-4 w-4 text-muted-foreground" />
                            <span>{property.bathrooms}</span>
                          </div>
                        )}
                        {property.max_guests !== null && (
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{property.max_guests}</span>
                          </div>
                        )}
                      </div>

                      {property.base_price_per_night && (
                        <div className="flex items-center gap-2 text-sm font-semibold">
                          <Euro className="h-4 w-4 text-primary" />
                          <span>{formatCurrency(property.base_price_per_night)}/noche</span>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 bg-transparent"
                          onClick={() => router.push(`/dashboard/properties/${property.id}/edit`)}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-transparent"
                          onClick={() => window.open(`/guides/${property.id}/public`, '_blank')}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Guía
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setDeleteId(property.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. La propiedad será eliminada permanentemente junto con todas sus reservas
              asociadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
