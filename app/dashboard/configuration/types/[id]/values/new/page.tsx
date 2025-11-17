"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { ColorPicker } from "@/components/ui/color-picker"
import { IconPicker } from "@/components/ui/icon-picker"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"

export default function NewConfigurationValuePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: typeId } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  const [loading, setLoading] = useState(false)
  const [hasIsDefaultColumn, setHasIsDefaultColumn] = useState(true) // Por defecto asumimos que existe
  const [formData, setFormData] = useState({
    value: "",
    label: "",
    description: "",
    color: "#3b82f6",
    icon: "",
    is_active: true,
    sort_order: 0,
    is_default: false,
  })

  // Verificar si la columna is_default existe
  useEffect(() => {
    const checkColumn = async () => {
      try {
        // Intentar obtener cualquier valor existente para verificar si tiene la columna
        const { data, error } = await supabase
          .from("configuration_values")
          .select("*")
          .limit(1)
          .maybeSingle()

        if (!error && data) {
          // Si tenemos datos, verificar si tienen la propiedad is_default
          setHasIsDefaultColumn('is_default' in data)
        } else if (error) {
          // Si hay error, intentar hacer un select específico de is_default
          // para ver si el error es por columna no existente
          const { error: testError } = await supabase
            .from("configuration_values")
            .select("is_default")
            .limit(0)

          if (testError) {
            // Verificar si el error es por columna no existente
            const errorMsg = testError.message?.toLowerCase() || ''
            const isColumnError = errorMsg.includes('column') && 
                                  errorMsg.includes('is_default') ||
                                  testError.code === '42703' ||
                                  errorMsg.includes('does not exist')
            setHasIsDefaultColumn(!isColumnError)
          } else {
            setHasIsDefaultColumn(true)
          }
        } else {
          // Si no hay datos ni error, asumir que la columna existe
          setHasIsDefaultColumn(true)
        }
      } catch (err: any) {
        // Si hay una excepción, verificar si es por columna no existente
        const errorMsg = err?.message?.toLowerCase() || ''
        const isColumnError = errorMsg.includes('column') && 
                              errorMsg.includes('is_default') ||
                              err?.code === '42703'
        setHasIsDefaultColumn(!isColumnError)
      }
    }
    checkColumn()
  }, [typeId, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Preparar los datos para insertar
      const insertData: any = {
        configuration_type_id: typeId,
        value: formData.value,
        label: formData.label,
        description: formData.description || null,
        color: formData.color,
        icon: formData.icon || null,
        is_active: formData.is_active,
        sort_order: formData.sort_order,
      }

      // Solo procesar is_default si la columna existe
      if (hasIsDefaultColumn) {
        // Si se está marcando como default, desmarcar otros valores del mismo tipo
        if (formData.is_default) {
          const { error: updateError } = await supabase
            .from("configuration_values")
            .update({ is_default: false })
            .eq("configuration_type_id", typeId)
            .eq("is_default", true)

          if (updateError) throw updateError
        }
        insertData.is_default = formData.is_default
      }

      const { error } = await supabase.from("configuration_values").insert(insertData)

      if (error) throw error

      toast({
        title: "Valor creado",
        description: "El valor de configuración se ha creado correctamente.",
      })

      router.push(`/dashboard/configuration/types/${typeId}`)
      router.refresh()
    } catch (error) {
      console.error("[v0] Error creating configuration value:", error)
      toast({
        title: "Error",
        description: "No se pudo crear el valor de configuración.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/configuration/types/${typeId}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Valor de Configuración</h1>
          <p className="text-muted-foreground">Crea un nuevo valor para este tipo de configuración</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Valor</CardTitle>
          <CardDescription>Completa los datos del nuevo valor de configuración</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="value">Valor (Código) *</Label>
                <Input
                  id="value"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="ej: apartment, cash, confirmed"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="label">Etiqueta (Nombre) *</Label>
                <Input
                  id="label"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  placeholder="ej: Apartamento, Efectivo, Confirmada"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción opcional del valor"
                disabled={loading}
                rows={3}
              />
            </div>

            {/* Color Picker */}
            <div className="space-y-4">
              <div>
                <Label>Color</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Selecciona un color compatible con los temas claro y oscuro
                </p>
                <ColorPicker
                  value={formData.color}
                  onChange={(color) => setFormData({ ...formData, color })}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Icon Picker */}
            <div className="space-y-4">
              <div>
                <Label>Icono</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Selecciona un emoji representativo para este valor
                </p>
                <IconPicker
                  value={formData.icon}
                  onChange={(icon) => setFormData({ ...formData, icon })}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <Label htmlFor="sort_order">Orden de visualización</Label>
              <Input
                id="sort_order"
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: Number.parseInt(e.target.value) })}
                placeholder="0"
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground">
                Los valores se ordenarán de menor a mayor
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                disabled={loading}
              />
              <Label htmlFor="is_active">Activo</Label>
            </div>

            {hasIsDefaultColumn && (
              <>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_default"
                    checked={formData.is_default}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
                    disabled={loading}
                  />
                  <Label htmlFor="is_default">Valor por defecto</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Solo puede haber un valor por defecto dentro de cada tipo de configuración. Si marcas este como predeterminado, se desmarcará automáticamente el valor que actualmente tenga esta opción.
                </p>
              </>
            )}

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Crear Valor
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" asChild disabled={loading}>
                <Link href={`/dashboard/configuration/types/${typeId}`}>Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
