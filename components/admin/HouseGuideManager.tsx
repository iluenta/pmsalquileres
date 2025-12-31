"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ApartmentSection, HouseGuideItem } from "@/types/guides"
import { getHouseGuideItems, createHouseGuideItem, updateHouseGuideItem, deleteHouseGuideItem } from "@/lib/api/guides-client"
import { getIconByName } from "@/lib/utils/icon-registry"
import { IconSelector } from "@/components/admin/IconSelector"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface HouseGuideManagerProps {
  guideId: string
}

export function HouseGuideManager({ guideId }: HouseGuideManagerProps) {
  const [items, setItems] = useState<HouseGuideItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingItem, setEditingItem] = useState<HouseGuideItem | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const { toast } = useToast()

  // Cargar elementos de guía al montar el componente
  useEffect(() => {
    loadItems()
  }, [guideId])

  const loadItems = async () => {
    try {
      setLoading(true)
      const itemsData = await getHouseGuideItems(guideId)
      setItems(itemsData || [])
    } catch (error) {
      console.error('Error loading house guide items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (item: HouseGuideItem) => {
    setEditingItem(item)
    setIsAddingNew(false)
  }

  const handleAddNew = () => {
    setEditingItem({
      id: "",
      guide_id: guideId,
      tenant_id: "",
      title: "",
      description: "",
      details: "",
      icon: "Lightbulb",
      order_index: items.length,
      created_at: "",
      updated_at: ""
    })
    setIsAddingNew(true)
  }

  const handleSave = async () => {
    if (!editingItem) return

    try {
      if (isAddingNew) {
        const newItem = await createHouseGuideItem({
          guide_id: guideId,
          title: editingItem.title,
          description: editingItem.description,
          details: editingItem.details,
          icon: editingItem.icon,
          order_index: editingItem.order_index
        })

        if (newItem) {
          setItems([...items, newItem])
          toast({
            title: "Elemento creado",
            description: "El elemento de la guía ha sido creado correctamente.",
          })
        }
      } else {
        const updatedItem = await updateHouseGuideItem(editingItem.id, {
          title: editingItem.title,
          description: editingItem.description,
          details: editingItem.details,
          icon: editingItem.icon,
          order_index: editingItem.order_index
        })

        if (updatedItem) {
          setItems(items.map(item =>
            item.id === editingItem.id ? updatedItem : item
          ))
          toast({
            title: "Elemento actualizado",
            description: "El elemento ha sido actualizado correctamente.",
          })
        }
      }

      setEditingItem(null)
      setIsAddingNew(false)
    } catch (error) {
      console.error('Error saving house guide item:', error)
    }
  }

  const handleDelete = async (itemId: string) => {
    try {
      const success = await deleteHouseGuideItem(itemId)
      if (success) {
        setItems(items.filter(item => item.id !== itemId))
        toast({
          title: "Elemento eliminado",
          description: "El elemento de la guía ha sido eliminado correctamente.",
        })
      }
    } catch (error) {
      console.error('Error deleting house guide item:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el elemento.",
        variant: "destructive",
      })
    }
  }

  const handleCancel = () => {
    setEditingItem(null)
    setIsAddingNew(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Cargando elementos de la guía...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con botón de agregar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h3 className="text-lg font-semibold">
          Elementos de la Guía de la Casa ({items.length})
        </h3>
        <Button onClick={handleAddNew} className="w-full md:w-auto">
          <i className="fas fa-plus mr-2"></i>
          Agregar Elemento
        </Button>
      </div>

      {/* Lista de elementos existentes */}
      <div className="grid gap-4">
        {items.map((item) => {
          const IconComponent = getIconByName(item.icon)

          return (
            <Card key={item.id} className="border border-gray-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {item.icon && (
                      <IconComponent className="h-6 w-6 text-blue-600" />
                    )}
                    <div>
                      <CardTitle className="text-lg">{item.title}</CardTitle>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(item)}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <i className="fas fa-edit"></i>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción eliminará de forma permanente este elemento de la guía.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(item.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              {item.details && (
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-700">{item.details}</p>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Formulario de edición */}
      {editingItem && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>
              {isAddingNew ? 'Agregar Nueva Guía' : 'Editar Guía'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="item-title">Título</Label>
                  <Input
                    id="item-title"
                    value={editingItem.title || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    placeholder="Título del elemento"
                  />
                </div>
                <div className="space-y-2">
                  <IconSelector
                    value={editingItem.icon || 'Lightbulb'}
                    onChange={(iconName) => setEditingItem({ ...editingItem, icon: iconName })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="item-description">Descripción</Label>
                  <span className="text-[10px] text-muted-foreground">
                    **negrita** | [color:azul]texto[/color] (rojo, verde, naranja)
                  </span>
                </div>
                <Textarea
                  id="item-description"
                  value={editingItem.description || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                  placeholder="Descripción del elemento"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="item-details">Detalles</Label>
                  <span className="text-[10px] text-muted-foreground">
                    **negrita** | [color:azul]texto[/color]
                  </span>
                </div>
                <Textarea
                  id="item-details"
                  value={editingItem.details || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, details: e.target.value })}
                  placeholder="Información detallada sobre este elemento"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="item-order">Orden</Label>
                <Input
                  id="item-order"
                  type="number"
                  value={editingItem.order_index || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, order_index: e.target.value ? Number.parseInt(e.target.value) : 0 })}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave}>
                  <i className="fas fa-save mr-2"></i>
                  Guardar
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {items.length === 0 && !editingItem && (
        <div className="text-center py-8 text-gray-500">
          <i className="fas fa-book-open text-4xl mb-4"></i>
          <p>No hay elementos en la guía de la casa aún.</p>
          <p className="text-sm">Haz clic en "Agregar Elemento" para comenzar.</p>
        </div>
      )}
    </div>
  )
}
