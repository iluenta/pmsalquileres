"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { 
  Upload, 
  X, 
  Star, 
  Loader2, 
  GripVertical,
  Edit2,
  Trash2
} from "lucide-react"
import type { PropertyImage } from "@/types/property-images"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface PropertyImageGalleryProps {
  propertyId: string
  tenantId: string
}

export function PropertyImageGallery({ propertyId, tenantId }: PropertyImageGalleryProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [images, setImages] = useState<PropertyImage[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [editingImage, setEditingImage] = useState<PropertyImage | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editSortOrder, setEditSortOrder] = useState<number>(0)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  // Cargar imágenes
  useEffect(() => {
    if (propertyId) {
      loadImages()
    }
  }, [propertyId])

  const loadImages = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/properties/${propertyId}/images`)
      if (response.ok) {
        const data = await response.json()
        setImages(data)
      }
    } catch (error) {
      console.error("Error loading images:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las imágenes",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar límite de 20 imágenes
    if (images.length >= 20) {
      toast({
        title: "Límite alcanzado",
        description: "Solo se permiten 20 imágenes por propiedad",
        variant: "destructive",
      })
      return
    }

    // Validar tipo y tamaño
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: "Solo se permiten imágenes (JPEG, PNG, WebP)",
        variant: "destructive",
      })
      return
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      toast({
        title: "Error",
        description: "El archivo es demasiado grande. Máximo 10MB",
        variant: "destructive",
      })
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("title", file.name.replace(/\.[^/.]+$/, ""))
      formData.append("is_cover", images.length === 0 ? "true" : "false") // Primera imagen como portada

      const response = await fetch(`/api/properties/${propertyId}/images`, {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Error al subir la imagen")
      }

      const newImage = await response.json()
      setImages([...images, newImage])
      
      toast({
        title: "Imagen subida",
        description: "La imagen se ha subido correctamente",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al subir la imagen",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
      // Limpiar input
      if (e.target) {
        e.target.value = ""
      }
    }
  }

  const handleSetCover = async (imageId: string) => {
    try {
      const response = await fetch(
        `/api/properties/${propertyId}/images/${imageId}`,
        {
          method: "PATCH",
        }
      )

      if (!response.ok) {
        throw new Error("Error al establecer imagen de portada")
      }

      const updatedImage = await response.json()
      
      // Actualizar estado local - desmarcar todas y marcar solo la nueva portada
      setImages(images.map(img => ({
        ...img,
        is_cover: img.id === imageId
      })))
      
      // Recargar imágenes para asegurar sincronización
      await loadImages()

      toast({
        title: "Portada actualizada",
        description: "La imagen de portada se ha actualizado",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo establecer la imagen de portada",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (imageId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta imagen?")) {
      return
    }

    try {
      const response = await fetch(
        `/api/properties/${propertyId}/images/${imageId}`,
        {
          method: "DELETE",
        }
      )

      if (!response.ok) {
        throw new Error("Error al eliminar la imagen")
      }

      setImages(images.filter(img => img.id !== imageId))
      
      toast({
        title: "Imagen eliminada",
        description: "La imagen se ha eliminado correctamente",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la imagen",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (image: PropertyImage) => {
    setEditingImage(image)
    setEditTitle(image.title)
    setEditSortOrder(image.sort_order)
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingImage || !editTitle.trim()) return

    // Validar sort_order
    const sortOrder = Math.max(0, Math.floor(editSortOrder))

    try {
      const response = await fetch(
        `/api/properties/${propertyId}/images/${editingImage.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: editTitle.trim(),
            sort_order: sortOrder,
          }),
        }
      )

      if (!response.ok) {
        throw new Error("Error al actualizar la imagen")
      }

      // Recargar imágenes para que se reordenen automáticamente
      await loadImages()

      setIsEditDialogOpen(false)
      setEditingImage(null)
      setEditTitle("")
      setEditSortOrder(0)

      toast({
        title: "Imagen actualizada",
        description: "El título y el orden de la imagen se han actualizado",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la imagen",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Galería de Imágenes</h3>
            <p className="text-sm text-muted-foreground">
              Sube hasta 20 imágenes. Una de ellas será la portada.
            </p>
          </div>
          <div className="relative">
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              disabled={uploading || images.length >= 20}
              className="hidden"
              id="image-upload"
            />
            <Button
              type="button"
              variant="outline"
              disabled={uploading || images.length >= 20}
              className="gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Subir Imagen
                </>
              )}
            </Button>
          </div>
        </div>

        {images.length === 0 ? (
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              No hay imágenes. Sube la primera imagen para comenzar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="group relative border rounded-lg overflow-hidden bg-card hover:shadow-lg transition"
              >
                {/* Imagen */}
                <div className="relative aspect-video bg-muted">
                  <Image
                    src={image.image_url}
                    alt={image.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  
                  {/* Badge de portada */}
                  {image.is_cover && (
                    <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 z-10">
                      <Star className="h-3 w-3 fill-current" />
                      Portada
                    </div>
                  )}

                  {/* Menú de acciones - Siempre visible en móvil, hover en desktop */}
                  <div className="absolute top-2 right-2 z-10">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          size="icon"
                          variant="secondary"
                          className="h-8 w-8 bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(image)}>
                          <Edit2 className="h-4 w-4 mr-2" />
                          Editar título
                        </DropdownMenuItem>
                        {!image.is_cover && (
                          <DropdownMenuItem onClick={() => handleSetCover(image.id)}>
                            <Star className="h-4 w-4 mr-2" />
                            Marcar como portada
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => handleDelete(image.id)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Overlay con botones grandes - Solo visible en hover en desktop */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity hidden md:flex items-center justify-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEdit(image)}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    {!image.is_cover && (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => handleSetCover(image.id)}
                      >
                        <Star className="h-4 w-4 mr-1" />
                        Portada
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(image.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Eliminar
                    </Button>
                  </div>
                </div>

                {/* Título y orden */}
                <div className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium truncate" title={image.title}>
                      {image.title}
                    </p>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      Orden: {image.sort_order}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {images.length > 0 && images.length < 20 && (
          <div className="text-center text-sm text-muted-foreground">
            {images.length} de 20 imágenes
          </div>
        )}

        {images.length >= 20 && (
          <div className="text-center text-sm text-amber-600 dark:text-amber-500">
            Has alcanzado el límite de 20 imágenes
          </div>
        )}
      </div>

      {/* Dialog para editar título y orden */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Imagen</DialogTitle>
            <DialogDescription>
              Modifica el título y el orden de visualización de la imagen
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Título</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Ej: Vista del salón principal"
                maxLength={255}
              />
            </div>
            <div>
              <Label htmlFor="edit-sort-order">Orden de Visualización</Label>
              <Input
                id="edit-sort-order"
                type="number"
                min="0"
                step="1"
                value={editSortOrder}
                onChange={(e) => {
                  const value = e.target.value
                  if (value === "") {
                    setEditSortOrder(0)
                  } else {
                    const numValue = parseInt(value, 10)
                    if (!isNaN(numValue)) {
                      setEditSortOrder(Math.max(0, numValue))
                    }
                  }
                }}
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground mt-1">
                El orden determina cómo se muestran las imágenes en la landing (0 = primera, 1 = segunda, etc.)
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setEditingImage(null)
                  setEditTitle("")
                  setEditSortOrder(0)
                }}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleSaveEdit}
                disabled={!editTitle.trim()}
              >
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

