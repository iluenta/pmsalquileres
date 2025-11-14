"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Search, X, Loader2 } from "lucide-react"
import Link from "next/link"
import { PersonsTable } from "@/components/persons/PersonsTable"
import type { PersonWithDetails } from "@/types/persons"
import type { ConfigurationValue } from "@/lib/api/configuration"

export default function PersonsPage() {
  const router = useRouter()
  const [persons, setPersons] = useState<PersonWithDetails[]>([])
  const [personTypes, setPersonTypes] = useState<ConfigurationValue[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPersonType, setSelectedPersonType] = useState<string | null>(null)
  
  // Filtros
  const [searchName, setSearchName] = useState("")
  const [searchDocument, setSearchDocument] = useState("")
  const [searchEmail, setSearchEmail] = useState("")
  const [searchPhone, setSearchPhone] = useState("")
  const [isActive, setIsActive] = useState<boolean | null>(true)
  
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  // Cargar tipos de persona
  useEffect(() => {
    const loadPersonTypes = async () => {
      try {
        const response = await fetch("/api/configuration/person-types")
        if (response.ok) {
          const types = await response.json()
          // Filtrar los tipos "Contacto" y "Propietario" para que no aparezcan como pestañas
          const filteredTypes = types.filter(
            (type: ConfigurationValue) => {
              const labelLower = type.label?.toLowerCase() || ""
              const valueLower = type.value?.toLowerCase() || ""
              return (
                labelLower !== "contacto" &&
                valueLower !== "contact" &&
                labelLower !== "propietario" &&
                valueLower !== "owner"
              )
            }
          )
          setPersonTypes(filteredTypes)
        }
      } catch (error) {
        console.error("Error loading person types:", error)
      }
    }
    loadPersonTypes()
  }, [])

  // Función para cargar personas con filtros
  const loadPersons = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      if (selectedPersonType) {
        params.append("personType", selectedPersonType)
      }
      
      if (searchName.trim()) {
        params.append("searchName", searchName.trim())
      }
      
      if (searchDocument.trim()) {
        params.append("searchDocument", searchDocument.trim())
      }
      
      if (searchEmail.trim()) {
        params.append("searchEmail", searchEmail.trim())
      }
      
      if (searchPhone.trim()) {
        params.append("searchPhone", searchPhone.trim())
      }
      
      if (isActive !== null) {
        params.append("isActive", isActive.toString())
      }

      const response = await fetch(`/api/persons/search?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setPersons(data)
      } else {
        console.error("Error loading persons")
        setPersons([])
      }
    } catch (error) {
      console.error("Error loading persons:", error)
      setPersons([])
    } finally {
      setLoading(false)
    }
  }, [selectedPersonType, searchName, searchDocument, searchEmail, searchPhone, isActive])

  // Cargar personas al montar y cuando cambien los filtros
  useEffect(() => {
    loadPersons()
  }, [loadPersons])

  // Debounce para búsquedas
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      loadPersons()
    }, 500)
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchName, searchDocument, searchEmail, searchPhone])

  const handleClearFilters = () => {
    setSearchName("")
    setSearchDocument("")
    setSearchEmail("")
    setSearchPhone("")
    setIsActive(true)
    setSelectedPersonType(null)
  }

  const hasActiveFilters = 
    searchName.trim() !== "" ||
    searchDocument.trim() !== "" ||
    searchEmail.trim() !== "" ||
    searchPhone.trim() !== "" ||
    isActive !== true ||
    selectedPersonType !== null

  const handlePersonDeleted = () => {
    loadPersons()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personas</h1>
          <p className="text-muted-foreground">
            Gestiona todas las personas del sistema (huéspedes, propietarios, contactos, proveedores, etc.)
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/persons/new">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Persona
          </Link>
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Filtros de Búsqueda</h3>
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                >
                  <X className="mr-2 h-4 w-4" />
                  Limpiar Filtros
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="searchName">Nombre</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="searchName"
                    placeholder="Buscar por nombre..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="searchDocument">Documento</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="searchDocument"
                    placeholder="Buscar por documento..."
                    value={searchDocument}
                    onChange={(e) => setSearchDocument(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="searchEmail">Email</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="searchEmail"
                    type="email"
                    placeholder="Buscar por email..."
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="searchPhone">Teléfono</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="searchPhone"
                    placeholder="Buscar por teléfono..."
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="isActive">Estado</Label>
                <Select
                  value={isActive === null ? "all" : isActive ? "active" : "inactive"}
                  onValueChange={(value) => {
                    if (value === "all") setIsActive(null)
                    else if (value === "active") setIsActive(true)
                    else setIsActive(false)
                  }}
                >
                  <SelectTrigger id="isActive">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Activos</SelectItem>
                    <SelectItem value="inactive">Inactivos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pestañas por tipo de persona */}
      {personTypes.length > 0 ? (
        <Tabs value={selectedPersonType || ""} onValueChange={(value) => setSelectedPersonType(value || null)}>
          <TabsList className="w-full justify-start">
            {personTypes.map((type) => (
              <TabsTrigger key={type.id} value={type.id}>
                {type.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={selectedPersonType || ""} className="mt-4">
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground mt-2">Cargando personas...</p>
              </div>
            ) : persons.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No se encontraron personas con los filtros aplicados</p>
              </div>
            ) : (
              <PersonsTable 
                persons={
                  selectedPersonType
                    ? persons.filter((p) => p.person_type === selectedPersonType)
                    : persons
                }
                onPersonDeleted={handlePersonDeleted}
              />
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="mt-4">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2">Cargando personas...</p>
            </div>
          ) : persons.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No se encontraron personas con los filtros aplicados</p>
            </div>
          ) : (
            <PersonsTable 
              persons={persons}
              onPersonDeleted={handlePersonDeleted}
            />
          )}
        </div>
      )}
    </div>
  )
}
