"use client"
// Updated: 2024-01-15 - Fixed schema issues, removed icon field
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
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"

export default function EditConfigurationTypePage({ params }: { params: Promise<{ id: string }> }) {
  const { id: typeId } = use(params)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = getSupabaseBrowserClient()

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_active: true,
    sort_order: 0,
  })

  useEffect(() => {
    const fetchType = async () => {
      try {
        const { data, error } = await supabase
          .from("configuration_types")
          .select("*")
          .eq("id", typeId)
          .single()

        if (error) throw error

        if (data) {
          setFormData({
            name: data.name || "",
            description: data.description || "",
            is_active: data.is_active ?? true,
            sort_order: data.sort_order || 0,
          })
        }
      } catch (error) {
        console.error("[v0] Error fetching configuration type:", error)
        toast({
          title: "Error",
          description: "No se pudo cargar el tipo de configuración.",
          variant: "destructive",
        })
      } finally {
        setFetching(false)
      }
    }

    fetchType()
  }, [typeId, supabase, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const updateData = {
        name: formData.name,
        description: formData.description,
        is_active: formData.is_active,
        sort_order: formData.sort_order,
        updated_at: new Date().toISOString(),
      }
      
      console.log("[v0] TEMP FILE - Updating configuration type with data:", updateData)
      console.log("[v0] TEMP FILE - Timestamp:", new Date().toISOString())
      console.log("[v0] TEMP FILE - File updated: 2024-01-15 - No icon field should be present")
      
      const { error } = await supabase
        .from("configuration_types")
        .update(updateData)
        .eq("id", typeId)

      if (error) throw error

      toast({
        title: "Tipo actualizado",
        description: "El tipo de configuración se ha actualizado correctamente.",
      })

      router.push("/dashboard/configuration")
      router.refresh()
    } catch (error) {
      console.error("[v0] Error updating configuration type:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el tipo de configuración.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/configuration">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Editar Tipo de Configuración</h1>
          <p className="text-muted-foreground">Modifica los datos del tipo de configuración</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Tipo</CardTitle>
          <CardDescription>Completa los datos del tipo de configuración</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="ej: Tipos de Propiedades"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción opcional del tipo de configuración"
                disabled={loading}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sort_order">Orden</Label>
              <Input
                id="sort_order"
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: Number.parseInt(e.target.value) })}
                placeholder="0"
                disabled={loading}
              />
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
                <Link href="/dashboard/configuration">Cancelar</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
