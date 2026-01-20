"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { MoreHorizontal, Edit, Trash2, User, Mail, Phone, FileText, MapPin, CheckCircle2, XCircle } from "lucide-react"
import type { PersonWithDetails } from "@/types/persons"

interface PersonCardProps {
  person: PersonWithDetails
  onDelete?: () => void
}

export function PersonCard({ person, onDelete }: PersonCardProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

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

      setDeleteId(null)
      if (onDelete) {
        onDelete()
      } else {
        router.refresh()
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Error al eliminar la persona",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setDeletingId(null)
    }
  }

  const getPersonDisplayName = () => {
    if (person.full_name) {
      return person.full_name
    }
    if (person.first_name || person.last_name) {
      return `${person.first_name || ""} ${person.last_name || ""}`.trim()
    }
    return "Sin nombre"
  }

  return (
    <Card className="w-full rounded-[2rem] border-none shadow-[0_8px_40px_rgb(0,0,0,0.03)] bg-white overflow-hidden group">
      <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-indigo-50 flex items-center justify-center flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform duration-300">
            <User className="h-7 w-7 text-indigo-500" />
          </div>
          <div>
            <CardTitle className="text-xl font-black text-slate-900 tracking-tight">
              {getPersonDisplayName()}
            </CardTitle>
            <div className="mt-1">
              <Badge variant="outline" className="bg-indigo-50 border-indigo-100 text-[10px] font-black uppercase tracking-widest text-indigo-600 py-0.5 px-2 rounded-lg">
                {person.person_type_value?.label || "N/A"}
              </Badge>
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors">
              <MoreHorizontal className="h-5 w-5" />
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
              onClick={() => setDeleteId(person.id)}
              disabled={deletingId === person.id}
              className="rounded-xl focus:bg-red-50 focus:text-red-600 text-red-600 font-bold py-2.5"
            >
              <Trash2 className="mr-3 h-4 w-4" />
              {deletingId === person.id ? "Eliminando..." : "Eliminar Registro"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="px-6 py-4 space-y-4">
        <div className="grid grid-cols-1 gap-2.5">
          {person.document_type && person.document_number && (
            <div className="flex items-center gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
              <FileText className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{person.document_type}: {person.document_number}</span>
            </div>
          )}
          {person.email && (
            <div className="flex items-center gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
              <Mail className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-600">{person.email}</span>
            </div>
          )}
          {person.phone && (
            <div className="flex items-center gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
              <Phone className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-600">{person.phone}</span>
            </div>
          )}
          {person.addresses && person.addresses.length > 0 && (
            <div className="flex items-center gap-3 bg-slate-50/50 p-3 rounded-xl border border-slate-100/50">
              <MapPin className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-600">
                {person.addresses.length} {person.addresses.length === 1 ? "Dirección registrada" : "Direcciones guardadas"}
              </span>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="px-6 py-4 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
        <Badge
          variant="outline"
          className={`border-none text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full ${person.is_active ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"
            }`}
        >
          {person.is_active ? "Perfil Activo" : "Perfil Inactivo"}
        </Badge>
        <Button variant="outline" size="sm" asChild className="h-9 rounded-xl border-slate-200 font-black uppercase text-[10px] tracking-widest text-slate-600 hover:bg-white hover:shadow-sm transition-all">
          <Link href={`/dashboard/persons/${person.id}/edit`}>Detalles</Link>
        </Button>
      </CardFooter>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => {
        if (!open && !deletingId) {
          setDeleteId(null)
        }
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará la persona y todos sus datos asociados (contactos, direcciones, etc.).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={!!deletingId}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={!!deletingId}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600 text-white"
            >
              {deletingId ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

