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
import { MoreHorizontal, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import type { SalesChannelWithDetails } from "@/types/sales-channels"
import { useToast } from "@/hooks/use-toast"
import { SalesChannelCard } from "./SalesChannelCard"

interface SalesChannelsTableProps {
  channels: SalesChannelWithDetails[]
}

const ITEMS_PER_PAGE = 5

export function SalesChannelsTable({ channels }: SalesChannelsTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este canal de venta?")) {
      return
    }

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
      <div className="text-center py-12">
        <p className="text-gray-500">No hay canales de venta registrados</p>
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
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <p>
            Mostrando {startIndex + 1} - {Math.min(endIndex, channels.length)} de {channels.length} canal{channels.length !== 1 ? "es" : ""}
          </p>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Logo</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Comisión Venta</TableHead>
                <TableHead>Comisión Cobro</TableHead>
                <TableHead>Impuesto</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedChannels.map((channel) => (
                <TableRow key={channel.id}>
                  <TableCell>
                    {channel.logo_url ? (
                      <div className="relative h-10 w-10">
                        <Image
                          src={channel.logo_url}
                          alt={channel.person.full_name}
                          fill
                          className="object-contain rounded"
                        />
                      </div>
                    ) : (
                      <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                        Sin logo
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">
                    {channel.person.full_name}
                  </TableCell>
                  <TableCell>{channel.sales_commission}%</TableCell>
                  <TableCell>{channel.collection_commission}%</TableCell>
                  <TableCell>
                    {channel.apply_tax && channel.tax_type ? (
                      <div className="text-sm">
                        <div className="font-medium">{channel.tax_type.label}</div>
                        {channel.tax_type.description && (
                          <div className="text-gray-500">
                            {parseFloat(channel.tax_type.description)}%
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Sin impuesto</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        channel.is_active
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {channel.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/sales-channels/${channel.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(channel.id)}
                          disabled={deletingId === channel.id}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          {deletingId === channel.id ? "Eliminando..." : "Eliminar"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls for Desktop */}
        {totalPages > 1 && (
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <div className="text-sm font-medium">
              Página {currentPage} de {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

