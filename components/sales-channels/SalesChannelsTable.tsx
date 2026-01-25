"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Edit, Trash2, ChevronLeft, ChevronRight, CheckCircle2, XCircle, Filter, X } from "lucide-react"
import Image from "next/image"
import type { SalesChannelWithDetails } from "@/types/sales-channels"
import { useToast } from "@/hooks/use-toast"
import { SalesChannelCard } from "./SalesChannelCard"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface SalesChannelsTableProps {
  channels: SalesChannelWithDetails[]
}

const ITEMS_PER_PAGE = 10 // Increased for B2B density

export function SalesChannelsTable({ channels }: SalesChannelsTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  const filteredChannels = useMemo(() => {
    return channels.filter((channel) => {
      const matchesSearch = channel.person.full_name.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "active" && channel.is_active) ||
        (statusFilter === "inactive" && !channel.is_active)
      return matchesSearch && matchesStatus
    })
  }, [channels, search, statusFilter])

  const hasActiveFilters = search !== "" || statusFilter !== "all"

  const clearFilters = () => {
    setSearch("")
    setStatusFilter("all")
  }

  // Pagination logic
  const totalPages = Math.ceil(filteredChannels.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedChannels = useMemo(() => {
    return filteredChannels.slice(startIndex, endIndex)
  }, [filteredChannels, startIndex, endIndex])

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [search, statusFilter])

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
  }

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/sales-channels/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al eliminar el canal")
      }

      toast({
        title: "Canal eliminado",
        description: "El canal de venta ha sido eliminado correctamente",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al eliminar el canal",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Filtros de Búsqueda (Standardized) */}
      <div className="bg-white p-6 md:p-6 rounded-[2rem] border border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center rotate-3 border border-indigo-100">
              <Filter className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tighter">Filtros de Búsqueda</h3>
              <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Encuentra canales rápidamente</p>
            </div>
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-10 rounded-xl px-4 font-bold text-red-500 hover:text-red-600 hover:bg-red-50 transition-all"
            >
              <X className="mr-2 h-4 w-4" />
              Limpiar filtros
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Búsqueda Rápida */}
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="filter-search" className="text-[10px] font-black uppercase tracking-widest text-slate-700 ml-1">
              Búsqueda Rápida
            </Label>
            <Input
              id="filter-search"
              placeholder="Buscar por nombre de canal..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 bg-slate-50 border-slate-100 rounded-xl font-bold focus:ring-indigo-500 placeholder:text-slate-400"
            />
          </div>

          {/* Filtro por Estado */}
          <div className="space-y-2">
            <Label htmlFor="filter-status" className="text-[10px] font-black uppercase tracking-widest text-slate-700 ml-1">
              Estado
            </Label>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger id="filter-status" className="h-11 bg-slate-50 border-slate-100 rounded-xl font-bold focus:ring-indigo-500">
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-xl bg-white">
                <SelectItem value="all" className="font-bold">Todos los estados</SelectItem>
                <SelectItem value="active" className="font-bold">Solo Activos</SelectItem>
                <SelectItem value="inactive" className="font-bold">Solo Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      {/* Mobile View: Cards */}
      <div className="block md:hidden space-y-4">
        {channels.map((channel) => (
          <SalesChannelCard key={channel.id} channel={channel} onDelete={() => router.refresh()} />
        ))}
      </div>

      {/* Desktop View: Table - B2B High Density Card */}
      <div className="hidden md:block bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-200">
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-800 py-3 pl-6">Logo</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-800 py-3">Nombre</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-800 py-3 text-center">Comisión Venta</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-800 py-3 text-center">Comisión Cobro</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-800 py-3">Impuesto</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-800 py-3">Estado</TableHead>
              <TableHead className="text-[10px] font-bold uppercase tracking-widest text-slate-800 py-3 pr-6 text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedChannels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-20">
                  <p className="text-lg font-bold text-slate-300">No hay canales con estos filtros</p>
                </TableCell>
              </TableRow>
            ) : (
              paginatedChannels.map((channel) => (
                <TableRow key={channel.id} className="group hover:bg-slate-50 border-b border-slate-100 transition-colors">
                  <TableCell className="py-2.5 pl-6">
                    {channel.logo_url ? (
                      <div className="relative h-9 w-9 p-1 bg-white border border-slate-100 rounded-lg shadow-sm">
                        <Image
                          src={channel.logo_url}
                          alt={channel.person.full_name}
                          fill
                          className="object-contain p-0.5"
                        />
                      </div>
                    ) : (
                      <div className="h-9 w-9 bg-slate-50 border border-slate-100 rounded-lg flex items-center justify-center">
                        <span className="text-[10px] font-black text-slate-300">N/A</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="py-2.5">
                    <span className="font-bold text-slate-900 tracking-tight text-sm">
                      {channel.person.full_name}
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold">
                      {channel.sales_commission}%
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-50 text-slate-600 text-xs font-bold">
                      {channel.collection_commission}%
                    </span>
                  </TableCell>
                  <TableCell className="py-2.5">
                    {channel.apply_tax && channel.tax_type ? (
                      <div className="flex flex-col leading-tight">
                        <span className="text-[10px] text-slate-500 font-mono font-medium tracking-tight uppercase">{channel.tax_type.label}</span>
                        {channel.tax_type.description && (
                          <span className="text-xs font-bold text-slate-900 tracking-tight">
                            {parseFloat(channel.tax_type.description).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Sin impuesto</span>
                    )}
                  </TableCell>
                  <TableCell className="py-2.5">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider",
                      channel.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-50 text-slate-400"
                    )}>
                      <div className={cn("w-1 h-1 rounded-full", channel.is_active ? "bg-emerald-500" : "bg-slate-300")} />
                      {channel.is_active ? "Activo" : "Inactivo"}
                    </div>
                  </TableCell>
                  <TableCell className="py-2.5 pr-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0 hover:bg-slate-100">
                            <MoreHorizontal className="h-4 w-4 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-slate-200 shadow-xl">
                          <DropdownMenuItem asChild className="font-bold">
                            <Link href={`/dashboard/sales-channels/${channel.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar Canal
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault()
                              setDeletingId(channel.id)
                            }}
                            className="text-red-500 font-bold focus:text-red-600 focus:bg-red-50"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer - Info & Pagination (Standardized) */}
      {filteredChannels.length > 0 && (
        <div className="hidden md:flex items-center justify-between px-2 pt-2">
          <div className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1}-{Math.min(endIndex, filteredChannels.length)} de {filteredChannels.length} canal{filteredChannels.length !== 1 ? "es" : ""}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="h-9 rounded-xl border-slate-200 font-bold text-slate-600"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <div className="text-sm font-medium text-slate-500 px-2">
              Página {currentPage} de {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="h-9 rounded-xl border-slate-200 font-bold text-slate-600"
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent className="rounded-[2rem] border-slate-200 shadow-2xl bg-white p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-slate-900 tracking-tighter">¿Eliminar canal?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 font-medium py-2">
              Esta acción eliminará de forma permanente el canal de venta y no podrá ser revertida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="rounded-2xl h-12 px-6 font-black uppercase text-[11px] tracking-widest border-slate-200 text-slate-600 hover:bg-slate-50 transition-all">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && handleDelete(deletingId)}
              className="bg-red-600 hover:bg-red-700 text-white rounded-2xl h-12 px-8 font-black uppercase text-[11px] tracking-widest shadow-lg shadow-red-100 transition-all active:scale-95"
            >
              Confirmar Eliminación
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
