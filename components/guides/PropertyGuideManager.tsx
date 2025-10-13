"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, Eye, Settings, MapPin, Home, Phone, Info } from "lucide-react"
import type { PropertyGuide, GuideData } from "@/types/guides"
import { getPropertyGuide, createPropertyGuide, updatePropertyGuide } from "@/lib/api/guides"

interface PropertyGuideManagerProps {
  propertyId: string
  propertyName: string
}

export function PropertyGuideManager({ propertyId, propertyName }: PropertyGuideManagerProps) {
  const [guide, setGuide] = useState<PropertyGuide | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    welcome_message: "",
    host_names: "",
    host_signature: "",
  })

  useEffect(() => {
    loadGuide()
  }, [propertyId])

  const loadGuide = async () => {
    try {
      setLoading(true)
      const guideData = await getPropertyGuide(propertyId)
      setGuide(guideData)
      
      if (guideData) {
        setFormData({
          title: guideData.title,
          welcome_message: guideData.welcome_message || "",
          host_names: guideData.host_names || "",
          host_signature: guideData.host_signature || "",
        })
      } else {
        // Set default values for new guide
        setFormData({
          title: `Guía del Huésped - ${propertyName}`,
          welcome_message: "",
          host_names: "",
          host_signature: "",
        })
      }
    } catch (error) {
      console.error("Error loading guide:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      let result: PropertyGuide | null = null

      if (guide) {
        // Update existing guide
        result = await updatePropertyGuide(guide.id, formData)
      } else {
        // Create new guide
        result = await createPropertyGuide({
          property_id: propertyId,
          ...formData,
        })
      }

      if (result) {
        setGuide(result)
        setEditing(false)
      }
    } catch (error) {
      console.error("Error saving guide:", error)
    }
  }

  const handleCancel = () => {
    if (guide) {
      setFormData({
        title: guide.title,
        welcome_message: guide.welcome_message || "",
        host_names: guide.host_names || "",
        host_signature: guide.host_signature || "",
      })
    }
    setEditing(false)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Guía del Huésped</h2>
          <p className="text-gray-600">Información y recursos para tus huéspedes</p>
        </div>
        <div className="flex items-center gap-2">
          {guide && (
            <Badge variant={guide.is_active ? "default" : "secondary"}>
              {guide.is_active ? "Activa" : "Inactiva"}
            </Badge>
          )}
          <Button
            variant={editing ? "outline" : "default"}
            onClick={() => setEditing(!editing)}
          >
            {editing ? "Cancelar" : guide ? "Editar" : "Crear Guía"}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Información General</TabsTrigger>
          <TabsTrigger value="sections">Secciones</TabsTrigger>
          <TabsTrigger value="places">Lugares</TabsTrigger>
          <TabsTrigger value="rules">Normas</TabsTrigger>
          <TabsTrigger value="contact">Contacto</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título de la Guía</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Guía del Huésped"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="welcome_message">Mensaje de Bienvenida</Label>
                    <Textarea
                      id="welcome_message"
                      value={formData.welcome_message}
                      onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
                      placeholder="¡Bienvenido a nuestra propiedad! Esperamos que disfrutes tu estancia..."
                      rows={4}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="host_names">Nombres del Anfitrión</Label>
                    <Input
                      id="host_names"
                      value={formData.host_names}
                      onChange={(e) => setFormData({ ...formData, host_names: e.target.value })}
                      placeholder="María y Juan"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="host_signature">Firma del Anfitrión</Label>
                    <Textarea
                      id="host_signature"
                      value={formData.host_signature}
                      onChange={(e) => setFormData({ ...formData, host_signature: e.target.value })}
                      placeholder="¡Esperamos verte pronto!"
                      rows={2}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleSave}>Guardar</Button>
                    <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {guide ? (
                    <>
                      <div>
                        <h3 className="font-semibold text-lg">{guide.title}</h3>
                        {guide.welcome_message && (
                          <p className="text-gray-600 mt-2">{guide.welcome_message}</p>
                        )}
                      </div>
                      
                      {guide.host_names && (
                        <div>
                          <h4 className="font-medium">Anfitriones</h4>
                          <p className="text-gray-600">{guide.host_names}</p>
                        </div>
                      )}
                      
                      {guide.host_signature && (
                        <div>
                          <h4 className="font-medium">Mensaje Final</h4>
                          <p className="text-gray-600">{guide.host_signature}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        No hay guía creada
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Crea una guía para proporcionar información útil a tus huéspedes
                      </p>
                      <Button onClick={() => setEditing(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Crear Guía
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Secciones de Contenido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Secciones de Contenido
                </h3>
                <p className="text-gray-600 mb-4">
                  Próximamente: gestión de secciones personalizables
                </p>
                <Button disabled>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Sección
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="places" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Lugares de Interés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Lugares de Interés
                </h3>
                <p className="text-gray-600 mb-4">
                  Próximamente: gestión de playas, restaurantes y actividades
                </p>
                <Button disabled>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Lugar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Normas de la Casa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Normas de la Casa
                </h3>
                <p className="text-gray-600 mb-4">
                  Próximamente: gestión de normas y reglas de la propiedad
                </p>
                <Button disabled>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Norma
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Información de Contacto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Información de Contacto
                </h3>
                <p className="text-gray-600 mb-4">
                  Próximamente: gestión de contactos y números de emergencia
                </p>
                <Button disabled>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Contacto
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
