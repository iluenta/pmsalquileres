"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pencil, Trash2, GripVertical } from "lucide-react"
import type { ConfigurationValue } from "@/lib/api/configuration"
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

interface ConfigurationValuesListProps {
  values: ConfigurationValue[]
  typeId: string
}

export function ConfigurationValuesList({ values, typeId }: ConfigurationValuesListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = getSupabaseBrowserClient()

  const handleDelete = async () => {
    if (!deleteId) return

    setDeleting(true)

    try {
      const { error } = await supabase.from("configuration_values").delete().eq("id", deleteId)

      if (error) throw error

      toast({
        title: "Valor eliminado",
        description: "El valor de configuración se ha eliminado correctamente.",
      })

      router.refresh()
      setDeleteId(null)
    } catch (error) {
      console.error("[v0] Error deleting configuration value:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el valor de configuración.",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Valores de Configuración</CardTitle>
        </CardHeader>
        <CardContent>
          {values.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No hay valores configurados</p>
          ) : (
            <div className="space-y-2">
              {values.map((value) => (
                <div
                  key={value.id}
                  className="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      {value.icon && <span className="text-lg">{value.icon}</span>}
                      <span className="font-medium">{value.label}</span>
                      <Badge variant={value.is_active ? "default" : "secondary"} className="ml-2">
                        {value.is_active ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    {value.description && <p className="text-sm text-muted-foreground">{value.description}</p>}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Valor: {value.value}</span>
                      {value.color && (
                        <div className="flex items-center gap-1">
                          <span>•</span>
                          <div className="w-4 h-4 rounded border" style={{ backgroundColor: value.color }} />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.push(`/dashboard/configuration/types/${typeId}/values/${value.id}/edit`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeleteId(value.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
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
              Esta acción no se puede deshacer. El valor de configuración será eliminado permanentemente.
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
