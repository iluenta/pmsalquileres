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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

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

  const getPersonDisplayName = (person: PersonWithDetails) => {
    if (person.full_name) {
      return person.full_name
    }
    if (person.first_name || person.last_name) {
      return `${person.first_name || ""} ${person.last_name || ""}`.trim()
    }
    return "Sin nombre"
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
        {persons.map((person) => (
          <PersonCard key={person.id} person={person} onDelete={onPersonDeleted} />
        ))}
      </div>

      {/* Desktop View: Table */}
      <div className="hidden md:block">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <p>
            Mostrando {startIndex + 1} - {Math.min(endIndex, persons.length)} de {persons.length} persona{persons.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="rounded-md border">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tipo</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Direcciones</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedPersons.map((person) => (
              <TableRow key={person.id}>
                <TableCell>
                  <Badge variant="outline" className="text-xs">
                    {person.person_type_value?.label || "N/A"}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">
                  {getPersonDisplayName(person)}
                </TableCell>
                <TableCell>
                  {person.document_type && person.document_number ? (
                    <div className="text-sm">
                      <span className="text-muted-foreground">{person.document_type}:</span>{" "}
                      {person.document_number}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell>{person.email || "-"}</TableCell>
                <TableCell>{person.phone || "-"}</TableCell>
                <TableCell>
                  {person.addresses && person.addresses.length > 0 ? (
                    <Badge variant="outline" className="text-xs">
                      {person.addresses.length} dirección{person.addresses.length !== 1 ? "es" : ""}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={person.is_active ? "default" : "secondary"}>
                    {person.is_active ? "Activo" : "Inactivo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/persons/${person.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setDeletingId(person.id)
                          setDeleteDialogOpen(true)
                        }}
                        className="text-destructive"
                        disabled={deletingId === person.id}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {deletingId === person.id ? "Eliminando..." : "Eliminar"}
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

