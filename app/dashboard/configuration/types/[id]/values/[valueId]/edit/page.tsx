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

export default function EditConfigurationValuePage({ params }: { params: Promise<{ id: string; valueId: string }> }) {
  const { id: typeId, valueId } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
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

  const [hasIsDefaultColumn, setHasIsDefaultColumn] = useState(true) // Por defecto asumimos que existe

  useEffect(() => {
    const fetchValue = async () => {
      try {
        const { data, error } = await supabase
          .from("configuration_values")
          .select("*")
          .eq("id", valueId)
          .single()

        if (error) throw error

        if (data) {
          // Verificar si la columna is_default existe en los datos devueltos
          const hasColumn = 'is_default' in data
          setHasIsDefaultColumn(hasColumn)

          setFormData({
            value: data.value || "",
            label: data.label || "",
            description: data.description || "",
            color: data.color || "#3b82f6",
            icon: data.icon || "",
            is_active: data.is_active ?? true,
            sort_order: data.sort_order || 0,
            is_default: hasColumn ? (data.is_default ?? false) : false,
          })
        }
      } catch (error: any) {
        // Si el error es porque la columna no existe, ocultar el campo
        if (error?.message?.includes('column') && error?.message?.includes('is_default') ||
            error?.code === '42703') {
          setHasIsDefaultColumn(false)
        }
        
        console.error("[v0] Error fetching configuration value:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar el valor de configuración.",
          variant: "destructive",
        })
      } finally {
        setFetching(false)
      }
    }

    fetchValue()
  }, [valueId, supabase, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Solo procesar is_default si la columna existe
      if (hasIsDefaultColumn) {
        // Si se está marcando como default, desmarcar otros valores del mismo tipo
        if (formData.is_default) {
          const { error: updateError } = await supabase
            .from("configuration_values")
            .update({ is_default: false })
            .eq("configuration_type_id", typeId)
            .eq("is_default", true)
            .neq("id", valueId)

          if (updateError) throw updateError
        }
      }

      // Preparar los datos para actualizar, excluyendo is_default si la columna no existe
      const updateData: any = {
        value: formData.value,
        label: formData.label,
        description: formData.description || null,
        color: formData.color,
        icon: formData.icon || null,
        is_active: formData.is_active,
        sort_order: formData.sort_order,
        updated_at: new Date().toISOString(),
      }

      // Solo incluir is_default si la columna existe
      if (hasIsDefaultColumn) {
        updateData.is_default = formData.is_default
      }

      const { error } = await supabase
        .from("configuration_values")
        .update(updateData)
        .eq("id", valueId)

      if (error) throw error

      toast({
        title: "Valor actualizado",
        description: "El valor de configuración se ha actualizado correctamente.",
      })

      router.push(`/dashboard/configuration/types/${typeId}`)
      router.refresh()
    } catch (error) {
      console.error("[v0] Error updating configuration value:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el valor de configuración.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
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
          <h1 className="text-3xl font-bold tracking-tight">Editar Valor de Configuración</h1>
          <p className="text-muted-foreground">Modifica los datos del valor de configuración</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Valor</CardTitle>
          <CardDescription>Actualiza los datos del valor de configuración</CardDescription>
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
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
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

