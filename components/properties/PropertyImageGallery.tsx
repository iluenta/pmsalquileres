"use client"

import { useState, useEffect, useRef, useCallback } from "react"
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

  const loadImages = useCallback(async () => {
    if (!propertyId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/properties/${propertyId}/images`)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Error loading images:", response.status, errorText)
        throw new Error(`Error ${response.status}: ${errorText || response.statusText}`)
      }

      const data = await response.json()
      setImages(data || [])
    } catch (error) {
      console.error("Error loading images:", error)
      const errorMessage = error instanceof Error ? error.message : "No se pudieron cargar las imágenes"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      setImages([]) // Establecer array vacío en caso de error
    } finally {
      setLoading(false)
    }
  }, [propertyId, toast])

  // Cargar imágenes al montar el componente
  useEffect(() => {
    if (propertyId) {
      loadImages()
    }
  }, [propertyId, loadImages])

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
      <div className="bg-white p-6 md:p-8 rounded-[2rem] border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center rotate-3">
              <Upload className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tighter">Galería de Imágenes</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sube hasta 20 fotos profesionales</p>
            </div>
          </div>
          <div className="relative w-full sm:w-auto">
            <input
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
              disabled={uploading || images.length >= 20}
              className="w-full sm:w-auto gap-2 h-11 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold px-6 shadow-lg shadow-indigo-100 transition-all"
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
          <div className="border-2 border-dashed border-slate-100 bg-slate-50/50 rounded-[2rem] p-16 text-center">
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mx-auto mb-4 -rotate-6">
              <Upload className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest max-w-[200px] mx-auto leading-loose">
              No hay imágenes todavía. Sube la primera para comenzar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((image) => (
              <div
                key={image.id}
                className="group relative bg-white border border-slate-100 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300"
              >
                {/* Imagen */}
                <div className="relative aspect-[4/3] bg-slate-50">
                  <Image
                    src={image.image_url}
                    alt={image.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />

                  {/* Badge de portada */}
                  {image.is_cover && (
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-indigo-600 px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 z-10 shadow-sm">
                      <Star className="h-3 w-3 fill-indigo-600" />
                      Portada
                    </div>
                  )}

                  {/* Menú de acciones */}
                  <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          size="icon"
                          className="h-8 w-8 bg-white/90 backdrop-blur-md hover:bg-white text-slate-600 rounded-lg shadow-sm"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl border-slate-100 p-1">
                        <DropdownMenuItem onClick={() => handleEdit(image)} className="rounded-lg text-xs font-bold uppercase tracking-wider text-slate-600">
                          <Edit2 className="h-3.5 w-3.5 mr-2" />
                          Editar título
                        </DropdownMenuItem>
                        {!image.is_cover && (
                          <DropdownMenuItem onClick={() => handleSetCover(image.id)} className="rounded-lg text-xs font-bold uppercase tracking-wider text-indigo-600">
                            <Star className="h-3.5 w-3.5 mr-2" />
                            Marcar portada
                          </DropdownMenuItem>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                              className="rounded-lg text-xs font-bold uppercase tracking-wider text-red-600 focus:text-red-700"
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-2" />
                              Eliminar
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="font-black text-xl tracking-tighter">¿Eliminar esta imagen?</AlertDialogTitle>
                              <AlertDialogDescription className="text-sm font-medium text-slate-500">
                                Esta acción es permanente y no se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter className="gap-2">
                              <AlertDialogCancel className="rounded-xl border-slate-100 font-bold uppercase text-[10px] tracking-widest mt-0">Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(image.id)}
                                className="rounded-xl bg-red-600 hover:bg-red-700 font-bold uppercase text-[10px] tracking-widest"
                              >
                                Eliminar ahora
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Título y orden */}
                <div className="p-4 bg-white border-t border-slate-50">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-tighter truncate" title={image.title}>
                      {image.title}
                    </p>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 font-black">#{image.sort_order}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-4">
          <div className="h-px bg-slate-100 flex-1" />
          <div className="px-4 py-1.5 bg-slate-50 border border-slate-100 rounded-full">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {images.length} de 20 imágenes {images.length >= 20 && " (Límite alcanzado)"}
            </p>
          </div>
          <div className="h-px bg-slate-100 flex-1" />
        </div>
      </div>

      {/* Dialog para editar título y orden */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-[2.5rem] border-none shadow-2xl max-w-md p-8">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-black tracking-tighter text-slate-900">Editar Detalle</DialogTitle>
            <DialogDescription className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Personaliza el título y orden de la imagen
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label htmlFor="edit-title" className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Título de la imagen</Label>
              <Input
                id="edit-title"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Ej: Vista del salón principal"
                maxLength={255}
                className="h-12 bg-slate-50 border-slate-100 rounded-xl font-bold text-indigo-600"
              />
            </div>
            <div>
              <Label htmlFor="edit-sort-order" className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2 block">Orden de Visualización</Label>
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
                className="h-12 bg-slate-50 border-slate-100 rounded-xl font-black"
                placeholder="0"
              />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-3 italic">
                Determina el orden en la landing (0 es primero).
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-12 rounded-xl border-slate-200 font-black uppercase text-[11px] tracking-widest"
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
                className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase text-[11px] tracking-widest shadow-lg shadow-indigo-100"
                onClick={handleSaveEdit}
                disabled={!editTitle.trim()}
              >
                Guardar Cambios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

