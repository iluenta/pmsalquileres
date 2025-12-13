"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
import { CalendarIcon, Loader2 } from "lucide-react"

interface DuplicateMovementDialogProps {
  movementId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function DuplicateMovementDialog({
  movementId,
  open,
  onOpenChange,
  onSuccess,
}: DuplicateMovementDialogProps) {
  const { toast } = useToast()
  const [newDate, setNewDate] = useState<string>(() => {
    // Fecha por defecto: hoy
    return new Date().toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)

  const handleDuplicate = async () => {
    if (!newDate) {
      toast({
        title: "Error",
        description: "Por favor selecciona una fecha",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/movements/${movementId}/duplicate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newDate }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al duplicar el movimiento")
      }

      const duplicatedMovement = await response.json()

      toast({
        title: "Movimiento duplicado",
        description: "El movimiento ha sido duplicado correctamente",
      })

      // Cerrar el diálogo
      onOpenChange(false)
      
      // Resetear la fecha
      setNewDate(new Date().toISOString().split('T')[0])

      // Llamar callback de éxito si existe
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al duplicar el movimiento",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Duplicar Movimiento</DialogTitle>
          <DialogDescription>
            Selecciona la fecha para el nuevo movimiento. Se copiarán todos los datos del movimiento original.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="newDate" className="text-sm font-medium">
              Nueva Fecha <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <Input
                id="newDate"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="bg-background pr-10"
                disabled={loading}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button onClick={handleDuplicate} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Duplicando...
              </>
            ) : (
              "Duplicar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

