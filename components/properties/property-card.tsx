"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Eye,
  Pencil,
  Trash2,
  ExternalLink,
  Calendar,
  MoreHorizontal,
  MapPin,
  Users,
  Bath,
  BedDouble,
  BookOpen
} from "lucide-react"
import Image from "next/image"
import type { Property } from "@/lib/api/properties"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface PropertyCardProps {
  property: Property
  onEdit?: (property: Property) => void
  onDelete?: (propertyId: string) => void
  onViewGuide?: (property: Property) => void
}

export function PropertyCard({ property, onEdit, onDelete, onViewGuide }: PropertyCardProps) {
  const router = useRouter()

  const formatCurrency = (amount: number | null) => {
    if (!amount) return "N/A"
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount)
  }

  const location = [property.city, property.province].filter(Boolean).join(", ")

  return (
    <Card className="group overflow-hidden border-none shadow-[0_4px_20px_rgb(0,0,0,0.03)] rounded-3xl bg-white hover:shadow-[0_12px_40px_rgba(79,70,229,0.06)] transition-all duration-300">
      <div className="flex flex-col sm:flex-row h-full">
        {/* Left: Compact Image Section */}
        <div className="relative w-full sm:w-48 h-40 sm:h-auto bg-slate-100 overflow-hidden shrink-0">
          {property.image_url ? (
            <Image
              src={property.image_url}
              alt={property.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, 192px"
            />
          ) : (
            <div className="w-full h-full bg-indigo-50 flex items-center justify-center">
              <span className="text-2xl">🏠</span>
            </div>
          )}
          <div className="absolute top-3 left-3 z-10">
            <Badge className={`border-none px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${property.is_active
              ? "bg-emerald-500 text-white"
              : "bg-slate-500 text-white"}`}>
              {property.is_active ? "Activa" : "Inactiva"}
            </Badge>
          </div>
        </div>

        {/* Right: Rich Information Section */}
        <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h3 className="font-black text-lg text-slate-900 tracking-tighter truncate leading-tight">
                    {property.name}
                  </h3>
                  {property.property_type && (
                    <span
                      className="px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200"
                    >
                      {property.property_type.label}
                    </span>
                  )}
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                  Cod: {property.property_code}
                </p>
              </div>

              <div className="text-right shrink-0">
                <p className="text-xl font-black text-indigo-600 tracking-tighter leading-none">
                  {formatCurrency(property.base_price_per_night)}
                </p>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Base / Noche</p>
              </div>
            </div>

            {/* Location & Details Row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
              {location && (
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                  <MapPin className="w-3 h-3 text-indigo-500" />
                  <span className="truncate">{location}</span>
                </div>
              )}

              <div className="flex items-center gap-3 border-l border-slate-100 pl-4">
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600" title="Habitaciones">
                  <BedDouble className="w-3 h-3 text-slate-400" />
                  <span>{property.bedrooms ?? "0"}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600" title="Baños">
                  <Bath className="w-3 h-3 text-slate-400" />
                  <span>{property.bathrooms ?? "0"}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600" title="Huéspedes Máx.">
                  <Users className="w-3 h-3 text-slate-400" />
                  <span>{property.max_guests ?? "0"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
            <div className="flex items-center gap-2">
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-9 px-4 font-black uppercase text-[10px] tracking-widest shadow-md shadow-indigo-100 transition-all active:scale-95"
                onClick={() => router.push(`/dashboard/calendar?propertyId=${property.id}`)}
              >
                <Calendar className="w-3.5 h-3.5 mr-2" />
                Calendario
              </Button>
              <Button
                variant="outline"
                className="rounded-xl h-9 px-4 font-black uppercase text-[10px] tracking-widest border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
                onClick={() => router.push(`/dashboard/bookings/new?propertyId=${property.id}`)}
              >
                Nueva Reserva
              </Button>
            </div>

            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl border-slate-200 shadow-xl bg-white">
                  <DropdownMenuItem
                    className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 rounded-xl cursor-pointer"
                    onClick={() => {
                      if (onEdit) onEdit(property)
                      else router.push(`/dashboard/properties/${property.id}/edit`)
                    }}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Editar Datos
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 rounded-xl cursor-pointer"
                    onClick={() => window.open(`/guides/${property.slug || property.id}`, "_blank")}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    Guía del Huésped
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 rounded-xl cursor-pointer"
                    onClick={() => window.open(`/landing/${property.slug}`, "_blank")}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Web Pública
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1 bg-slate-100" />
                  {onDelete && (
                    <DropdownMenuItem
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl cursor-pointer"
                      onClick={() => onDelete(property.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Eliminar Propiedad
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
