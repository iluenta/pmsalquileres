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
import { Badge } from "@/components/ui/badge"
import { MoreHorizontal, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"
import type { PersonWithDetails } from "@/types/persons"
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
} from "@/components/ui/alert-dialog"
import { PersonCard } from "./PersonCard"

interface PersonsTableProps {
  persons: PersonWithDetails[]
  onPersonDeleted?: () => void
}

const ITEMS_PER_PAGE = 5

export function PersonsTable({ persons, onPersonDeleted }: PersonsTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const getPersonDisplayName = (p: PersonWithDetails) => {
    if (p.full_name) return p.full_name
    if (p.first_name || p.last_name) {
      return `${p.first_name || ""} ${p.last_name || ""}`.trim()
    }
    return "Sin nombre"
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const response = await fetch(`/api/persons/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.error || "Error al eliminar la persona"

        toast({
          title: "No se puede eliminar",
          description: errorMessage,
          variant: "destructive",
          duration: 5000,
        })
        return
      }

      toast({
        title: "Persona eliminada",
        description: "La persona ha sido eliminada correctamente",
      })

      if (onPersonDeleted) {
        onPersonDeleted()
      } else {
        router.refresh()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al eliminar la persona",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
      setDeleteDialogOpen(false)
    }
  }

  // Pagination logic
  const totalPages = Math.ceil(persons.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedPersons = useMemo(() => {
    return persons.slice(startIndex, endIndex)
  }, [persons, startIndex, endIndex])

  // Reset page to 1 when persons change
  useEffect(() => {
    setCurrentPage(1)
  }, [persons.length])

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
  }

  if (persons.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No hay personas registradas</p>
      </div>
    )
  }

  return (
    <>
      {/* Mobile View: Cards */}
      <div className="block md:hidden space-y-4">
        {paginatedPersons.map((person) => (
          <PersonCard key={person.id} person={person} onDelete={onPersonDeleted} />
        ))}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 px-2">
          <p>
            {startIndex + 1} - {Math.min(endIndex, persons.length)} de {persons.length} registros
          </p>
        </div>
        <div className="rounded-[2rem] border-none shadow-[0_8px_40px_rgb(0,0,0,0.03)] bg-white overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="py-5 px-6 font-black text-[10px] uppercase tracking-widest text-slate-400">Nombre</TableHead>
                <TableHead className="py-5 px-6 font-black text-[10px] uppercase tracking-widest text-slate-400">Contacto</TableHead>
                <TableHead className="py-5 px-6 font-black text-[10px] uppercase tracking-widest text-slate-400">Documento</TableHead>
                <TableHead className="py-5 px-6 font-black text-[10px] uppercase tracking-widest text-slate-400">Tipo</TableHead>
                <TableHead className="py-5 px-6 font-black text-[10px] uppercase tracking-widest text-slate-400">Estado</TableHead>
                <TableHead className="py-5 px-6 text-right font-black text-[10px] uppercase tracking-widest text-slate-400">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPersons.map((person) => (
                <TableRow key={person.id} className="group hover:bg-slate-50/50 border-slate-50 transition-colors">
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-4">
                      {person.profile_picture_url ? (
                        <div className="relative h-11 w-11 rounded-xl overflow-hidden border border-slate-100 bg-white p-1 shadow-sm flex-shrink-0">
                          <Image src={person.profile_picture_url} alt={getPersonDisplayName(person)} fill className="object-contain" />
                        </div>
                      ) : (
                        <div className="h-11 w-11 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0 shadow-inner">
                          <span className="text-sm font-black text-indigo-500">
                            {getPersonDisplayName(person).charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="font-bold text-slate-700">{getPersonDisplayName(person)}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-slate-600">{person.email || "Sin email"}</span>
                      {person.phone && <span className="text-[10px] font-black text-slate-400 tracking-tight">{person.phone}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    {person.document_type && person.document_number ? (
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{person.document_type}</span>
                        <span className="text-sm font-bold text-slate-600 tracking-tight">{person.document_number}</span>
                      </div>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <Badge variant="outline" className="bg-indigo-50/50 border-indigo-100 text-indigo-600 text-[9px] font-black uppercase tracking-wider rounded-lg px-2">
                      {person.person_type_value?.label || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <Badge
                      variant="outline"
                      className={`border-none text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${person.is_active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
                        }`}
                    >
                      {person.is_active ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl text-slate-300 hover:text-indigo-600 hover:bg-white hover:shadow-sm transition-all">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 shadow-xl p-2">
                        <DropdownMenuItem asChild className="rounded-xl focus:bg-indigo-50 focus:text-indigo-600 font-bold py-2.5">
                          <Link href={`/dashboard/persons/${person.id}/edit`}>
                            <Edit className="mr-3 h-4 w-4" />
                            Editar Perfil
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setDeletingId(person.id)
                            setDeleteDialogOpen(true)
                          }}
                          className="rounded-xl focus:bg-red-50 focus:text-red-600 text-red-600 font-bold py-2.5"
                          disabled={deletingId === person.id}
                        >
                          <Trash2 className="mr-3 h-4 w-4" />
                          {deletingId === person.id ? "Eliminando..." : "Eliminar Registro"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls - Shared for Mobile and Desktop */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between sm:justify-end space-x-2 mt-8 mb-12 py-6 px-4 border-t border-slate-100 bg-white/50 rounded-b-[2rem] shadow-sm">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest sm:mr-6">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className="h-10 px-4 rounded-xl border-slate-200 font-black uppercase text-[10px] tracking-widest text-slate-600 hover:bg-white hover:shadow-sm transition-all disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Anterior</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="h-10 px-4 rounded-xl border-slate-200 font-black uppercase text-[10px] tracking-widest text-slate-600 hover:bg-white hover:shadow-sm transition-all disabled:opacity-50"
            >
              <span className="hidden sm:inline">Siguiente</span>
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la persona y todos sus datos asociados (contactos, direcciones, etc.).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const personToDelete = persons.find((p) => deletingId === p.id)
                if (personToDelete) {
                  handleDelete(personToDelete.id)
                }
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
