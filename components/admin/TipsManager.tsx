"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tip } from "@/types/guides"
import { getTips, createTip, updateTip, deleteTip } from "@/lib/api/guides-client"

interface TipsManagerProps {
  guideId: string
}

export function TipsManager({ guideId }: TipsManagerProps) {
  const [tips, setTips] = useState<Tip[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTip, setEditingTip] = useState<Tip | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)

  // Cargar consejos al montar el componente
  useEffect(() => {
    loadTips()
  }, [guideId])

  const loadTips = async () => {
    try {
      setLoading(true)
      const tipsData = await getTips(guideId)
      setTips(tipsData || [])
    } catch (error) {
      console.error('Error loading tips:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (tip: Tip) => {
    setEditingTip(tip)
    setIsAddingNew(false)
  }

  const handleAddNew = () => {
    setEditingTip({
      id: "",
      guide_id: guideId,
      tenant_id: "",
      title: "",
      description: "",
      details: "",
      icon: "fas fa-lightbulb",
      order_index: tips.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    setIsAddingNew(true)
  }

  const handleSave = async () => {
    if (!editingTip) return

    try {
      if (isAddingNew) {
        // Crear nuevo consejo
        const newTip = await createTip({
          guide_id: guideId,
          title: editingTip.title,
          description: editingTip.description,
          details: editingTip.details,
          icon: editingTip.icon,
          order_index: editingTip.order_index
        })
        
        if (newTip) {
          setTips([...tips, newTip])
        }
      } else {
        // Actualizar consejo existente
        const updatedTip = await updateTip(editingTip.id, {
          title: editingTip.title,
          description: editingTip.description,
          details: editingTip.details,
          icon: editingTip.icon,
          order_index: editingTip.order_index
        })
        
        if (updatedTip) {
          setTips(tips.map(tip => tip.id === editingTip.id ? updatedTip : tip))
        }
      }
      
      setEditingTip(null)
      setIsAddingNew(false)
    } catch (error) {
      console.error('Error saving tip:', error)
    }
  }

  const handleDelete = async (tipId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este consejo?")) {
      try {
        const success = await deleteTip(tipId)
        if (success) {
          setTips(tips.filter(tip => tip.id !== tipId))
        }
      } catch (error) {
        console.error('Error deleting tip:', error)
      }
    }
  }

  const handleCancel = () => {
    setEditingTip(null)
    setIsAddingNew(false)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <i className="fas fa-spinner fa-spin text-2xl text-gray-400 mb-4"></i>
          <p className="text-gray-600">Cargando consejos...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <i className="fas fa-lightbulb text-yellow-600"></i>
              Consejos para Huéspedes ({tips.length})
            </CardTitle>
            <Button onClick={handleAddNew}>
              <i className="fas fa-plus mr-2"></i>
              Agregar Consejo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {tips.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-lightbulb text-4xl text-gray-400 mb-4"></i>
              <p className="text-gray-600">No hay consejos creados</p>
              <p className="text-sm text-gray-500 mt-2 mb-4">Agrega consejos útiles para que los huéspedes disfruten mejor su estancia</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tips.map((tip) => (
                <div key={tip.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className={`${tip.icon} text-yellow-600`}></i>
                      </div>
                      <div>
                        <h4 className="font-medium mb-1">{tip.title}</h4>
                        <p className="text-sm text-gray-600">{tip.description}</p>
                        {tip.details && (
                          <p className="text-sm text-gray-700 mt-2">{tip.details}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(tip)}>
                        <i className="fas fa-edit"></i>
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(tip.id)}>
                        <i className="fas fa-trash"></i>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {editingTip && (
        <Card>
          <CardHeader>
            <CardTitle>{isAddingNew ? "Agregar Nuevo Consejo" : "Editar Consejo"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tip-title">Título</Label>
                  <Input
                    id="tip-title"
                    value={editingTip.title || ''}
                    onChange={(e) => setEditingTip({ ...editingTip, title: e.target.value })}
                    placeholder="Título del consejo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tip-icon">Icono (Font Awesome)</Label>
                  <Input
                    id="tip-icon"
                    value={editingTip.icon || ''}
                    onChange={(e) => setEditingTip({ ...editingTip, icon: e.target.value })}
                    placeholder="fas fa-lightbulb"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tip-description">Descripción</Label>
                <Textarea
                  id="tip-description"
                  value={editingTip.description || ''}
                  onChange={(e) => setEditingTip({ ...editingTip, description: e.target.value })}
                  placeholder="Descripción breve del consejo"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tip-details">Detalles</Label>
                <Textarea
                  id="tip-details"
                  value={editingTip.details || ''}
                  onChange={(e) => setEditingTip({ ...editingTip, details: e.target.value })}
                  placeholder="Información detallada del consejo"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tip-order">Orden</Label>
                <Input
                  id="tip-order"
                  type="number"
                  value={editingTip.order_index || ''}
                  onChange={(e) => setEditingTip({ ...editingTip, order_index: e.target.value ? Number.parseInt(e.target.value) : 0 })}
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
    </div>
  )
}
