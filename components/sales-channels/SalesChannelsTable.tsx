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
import { MoreHorizontal, Edit, Trash2, ChevronLeft, ChevronRight, CheckCircle2, XCircle } from "lucide-react"
import Image from "next/image"
import type { SalesChannelWithDetails } from "@/types/sales-channels"
import { useToast } from "@/hooks/use-toast"
import { SalesChannelCard } from "./SalesChannelCard"
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

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const response = await fetch(`/api/sales-channels/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el canal")
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

  // Pagination logic
  const totalPages = Math.ceil(channels.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedChannels = useMemo(() => {
    return channels.slice(startIndex, endIndex)
  }, [channels, startIndex, endIndex])

  // Reset page to 1 when channels change
  useEffect(() => {
    setCurrentPage(1)
  }, [channels.length])

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
  }

  if (channels.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
        <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No hay canales de venta registrados</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Mobile View: Cards */}
      <div className="block md:hidden space-y-4">
        {channels.map((channel) => (
          <SalesChannelCard key={channel.id} channel={channel} onDelete={() => router.refresh()} />
        ))}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block">
        <div className="rounded-[2rem] border border-slate-200 bg-white overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="w-[80px] uppercase text-[10px] font-black tracking-widest text-slate-500 py-4 pl-6">Logo</TableHead>
                <TableHead className="uppercase text-[10px] font-black tracking-widest text-slate-500">Nombre</TableHead>
                <TableHead className="uppercase text-[10px] font-black tracking-widest text-slate-500">Comisión Venta</TableHead>
                <TableHead className="uppercase text-[10px] font-black tracking-widest text-slate-500">Comisión Cobro</TableHead>
                <TableHead className="uppercase text-[10px] font-black tracking-widest text-slate-500">Impuesto</TableHead>
                <TableHead className="uppercase text-[10px] font-black tracking-widest text-slate-500">Estado</TableHead>
                <TableHead className="text-right uppercase text-[10px] font-black tracking-widest text-slate-500 pr-6">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedChannels.map((channel) => (
                <TableRow key={channel.id} className="hover:bg-slate-50/50 border-slate-100 transition-colors">
                  <TableCell className="py-3 pl-6">
                    {channel.logo_url ? (
                      <div className="relative h-9 w-9 p-1.5 bg-white border border-slate-100 rounded-xl shadow-sm">
                        <Image
                          src={channel.logo_url}
                          alt={channel.person.full_name}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                    ) : (
                      <div className="h-9 w-9 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center">
                        <span className="text-[10px] font-black text-slate-300">N/A</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-slate-900 text-sm tracking-tight">
                      {channel.person.full_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-bold">
                      {channel.sales_commission}%
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-50 text-slate-600 text-xs font-bold">
                      {channel.collection_commission}%
                    </div>
                  </TableCell>
                  <TableCell>
                    {channel.apply_tax && channel.tax_type ? (
                      <div>
                        <div className="font-bold text-slate-800 text-xs uppercase tracking-tight">{channel.tax_type.label}</div>
                        {channel.tax_type.description && (
                          <div className="text-[10px] font-bold text-slate-400">
                            {parseFloat(channel.tax_type.description)}%
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Sin impuesto</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {channel.is_active ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 shadow-sm">
                        <CheckCircle2 className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Activo</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-100">
                        <XCircle className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Inactivo</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44 p-2 rounded-2xl border-slate-200 shadow-xl bg-white">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/sales-channels/${channel.id}/edit`} className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-slate-700 rounded-xl cursor-pointer">
                            <Edit className="h-3.5 w-3.5" />
                            Editar Canal
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault()
                            setDeletingId(channel.id)
                          }}
                          className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Footer - Info & Pagination */}
          <div className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Mostrando {startIndex + 1}-{Math.min(endIndex, channels.length)} de {channels.length} canales
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-xl border-slate-200 text-slate-600 hover:bg-white transition-all disabled:opacity-30"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-[11px] font-bold text-slate-600 px-2 min-w-[80px] text-center">
                  Pág. {currentPage} / {totalPages}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 rounded-xl border-slate-200 text-slate-600 hover:bg-white transition-all disabled:opacity-30"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

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
