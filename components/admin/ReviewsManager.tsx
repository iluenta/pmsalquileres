"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Star, Check, X } from "lucide-react"
import type { PropertyReview } from "@/types/property-reviews"
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

interface ReviewsManagerProps {
  propertyId: string
}

interface Booking {
  id: string
  booking_code: string
  check_in_date: string
  check_out_date: string
  person?: {
    first_name: string
    last_name: string
  }
}

export function ReviewsManager({ propertyId }: ReviewsManagerProps) {
  const [reviews, setReviews] = useState<PropertyReview[]>([])
  const [loading, setLoading] = useState(true)
  const [editingReview, setEditingReview] = useState<PropertyReview | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filterApproved, setFilterApproved] = useState<boolean | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadReviews()
    loadBookings()
  }, [propertyId])

  const loadReviews = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/properties/${propertyId}/reviews?includeUnapproved=true`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data || [])
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadBookings = async () => {
    try {
      const response = await fetch(`/api/bookings?propertyId=${propertyId}`)
      if (response.ok) {
        const data = await response.json()
        setBookings(data || [])
      }
    } catch (error) {
      console.error('Error loading bookings:', error)
    }
  }

  const handleEdit = (review: PropertyReview) => {
    setEditingReview(review)
    setIsAddingNew(false)
  }

  const handleAddNew = () => {
    setEditingReview({
      id: "",
      property_id: propertyId,
      tenant_id: "",
      guest_name: "",
      person_id: null,
      booking_id: null,
      rating: 5,
      comment: "",
      review_date: new Date().toISOString().split('T')[0],
      is_approved: false,
      source: 'manual',
      external_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: null,
    })
    setIsAddingNew(true)
  }

  const handleSave = async () => {
    if (!editingReview) return

    try {
      if (isAddingNew) {
        const response = await fetch(`/api/properties/${propertyId}/reviews`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingReview),
        })
        if (response.ok) {
          const newReview = await response.json()
          setReviews([...reviews, newReview])
          toast({
            title: "Reseña guardada",
            description: "La reseña ha sido creada correctamente.",
          })
        }
      } else {
        const response = await fetch(`/api/properties/${propertyId}/reviews/${editingReview.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingReview),
        })
        if (response.ok) {
          const updatedReview = await response.json()
          setReviews(reviews.map(r => r.id === editingReview.id ? updatedReview : r))
          toast({
            title: "Reseña actualizada",
            description: "La reseña ha sido actualizada correctamente.",
          })
        }
      }
      setEditingReview(null)
      setIsAddingNew(false)
    } catch (error) {
      console.error('Error saving review:', error)
    }
  }

  const handleDelete = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}/reviews/${reviewId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setReviews(reviews.filter(r => r.id !== reviewId))
        toast({
          title: "Reseña eliminada",
          description: "La reseña ha sido eliminada correctamente.",
        })
      } else {
        throw new Error("Failed to delete review")
      }
    } catch (error) {
      console.error('Error deleting review:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la reseña.",
        variant: "destructive",
      })
    }
  }

  const handleApprove = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      })
      if (response.ok) {
        const updatedReview = await response.json()
        setReviews(reviews.map(r => r.id === reviewId ? updatedReview : r))
        toast({
          title: "Reseña aprobada",
          description: "La reseña ahora es visible públicamente.",
        })
      }
    } catch (error) {
      console.error('Error approving review:', error)
    }
  }

  const handleReject = async (reviewId: string) => {
    try {
      const response = await fetch(`/api/properties/${propertyId}/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject' }),
      })
      if (response.ok) {
        const updatedReview = await response.json()
        setReviews(reviews.map(r => r.id === reviewId ? updatedReview : r))
        toast({
          title: "Reseña rechazada",
          description: "La reseña ya no será visible públicamente.",
        })
      }
    } catch (error) {
      console.error('Error rejecting review:', error)
    }
  }

  const filteredReviews = filterApproved === null
    ? reviews
    : reviews.filter(r => filterApproved ? r.is_approved : !r.is_approved)

  const averageRating = reviews.filter(r => r.is_approved).length > 0
    ? reviews.filter(r => r.is_approved).reduce((acc, r) => acc + r.rating, 0) / reviews.filter(r => r.is_approved).length
    : 0

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-gray-600">Cargando reseñas...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Reseñas ({reviews.length})
              {averageRating > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {averageRating.toFixed(1)} ⭐
                </Badge>
              )}
            </CardTitle>
            <div className="flex gap-2">
              <Select value={filterApproved === null ? "all" : filterApproved ? "approved" : "pending"}
                onValueChange={(v) => setFilterApproved(v === "all" ? null : v === "approved")}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="approved">Aprobadas</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleAddNew}>
                Agregar Reseña
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredReviews.length === 0 ? (
            <div className="text-center py-8">
              <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay reseñas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                                }`}
                            />
                          ))}
                        </div>
                        <span className="font-medium">{review.guest_name}</span>
                        {review.booking_id && (
                          <Badge variant="outline" className="text-xs">
                            Vinculada a reserva
                          </Badge>
                        )}
                        {!review.is_approved && (
                          <Badge variant="secondary" className="text-xs">
                            Pendiente
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 mb-2 italic">"{review.comment}"</p>
                      <p className="text-xs text-gray-500">
                        {new Date(review.review_date).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!review.is_approved && (
                        <>
                          <Button size="sm" variant="outline" onClick={() => handleApprove(review.id)}>
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleReject(review.id)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Button size="sm" variant="outline" onClick={() => handleEdit(review)}>
                        Editar
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive">
                            Eliminar
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará de forma permanente esta reseña.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(review.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {editingReview && (
        <Card>
          <CardHeader>
            <CardTitle>{isAddingNew ? "Agregar Nueva Reseña" : "Editar Reseña"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="review-guest-name">Nombre del Huésped *</Label>
                  <Input
                    id="review-guest-name"
                    value={editingReview.guest_name || ''}
                    onChange={(e) => setEditingReview({ ...editingReview, guest_name: e.target.value })}
                    placeholder="Nombre del huésped"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="review-rating">Calificación *</Label>
                  <Select
                    value={editingReview.rating.toString()}
                    onValueChange={(v) => setEditingReview({ ...editingReview, rating: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 4, 3, 2, 1].map(r => (
                        <SelectItem key={r} value={r.toString()}>
                          {r} ⭐
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-booking">Vincular a Reserva (opcional)</Label>
                <Select
                  value={editingReview.booking_id || ""}
                  onValueChange={(v) => setEditingReview({ ...editingReview, booking_id: v || null })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar reserva" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Ninguna</SelectItem>
                    {bookings.map(booking => (
                      <SelectItem key={booking.id} value={booking.id}>
                        {booking.booking_code} - {booking.person?.first_name} {booking.person?.last_name} ({new Date(booking.check_in_date).toLocaleDateString()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-date">Fecha de la Reseña *</Label>
                <Input
                  id="review-date"
                  type="date"
                  value={editingReview.review_date || ''}
                  onChange={(e) => setEditingReview({ ...editingReview, review_date: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-comment">Comentario *</Label>
                <Textarea
                  id="review-comment"
                  value={editingReview.comment || ''}
                  onChange={(e) => setEditingReview({ ...editingReview, comment: e.target.value })}
                  placeholder="Comentario de la reseña"
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="review-approved"
                  checked={editingReview.is_approved}
                  onChange={(e) => setEditingReview({ ...editingReview, is_approved: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="review-approved">Aprobada (visible públicamente)</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave}>
                  Guardar
                </Button>
                <Button variant="outline" onClick={() => {
                  setEditingReview(null)
                  setIsAddingNew(false)
                }}>
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


