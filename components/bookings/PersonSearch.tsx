"use client"

import { useState, useEffect, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown, Plus, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Person } from "@/types/bookings"

interface PersonSearchProps {
  tenantId: string
  value?: Person | null
  onSelect: (person: Person | null) => void
  onCreateNew?: (personData: { first_name: string; last_name: string; email?: string; phone?: string }) => Promise<Person | null>
  className?: string
  required?: boolean
}

export function PersonSearch({ 
  tenantId, 
  value, 
  onSelect, 
  onCreateNew,
  className,
  required = false 
}: PersonSearchProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [persons, setPersons] = useState<Person[]>([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newPersonData, setNewPersonData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  })

  const searchPersons = useCallback(async (term: string) => {
    if (!term || term.length < 2) {
      setPersons([])
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/persons/search?tenantId=${tenantId}&search=${encodeURIComponent(term)}&category=guest`)
      const data = await response.json()
      setPersons(data || [])
    } catch (error) {
      console.error("Error searching persons:", error)
      setPersons([])
    } finally {
      setLoading(false)
    }
  }, [tenantId])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (searchTerm) {
        searchPersons(searchTerm)
      } else {
        setPersons([])
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm, searchPersons])

  const handleCreateNew = async () => {
    if (!newPersonData.first_name.trim() || !newPersonData.last_name.trim()) {
      return
    }

    if (!onCreateNew) {
      // Si no hay función de creación, crear mediante API
      try {
        const response = await fetch("/api/persons", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...newPersonData,
            tenant_id: tenantId,
            person_category: "guest",
          }),
        })
        
        if (!response.ok) throw new Error("Error creating person")
        
        const newPerson = await response.json()
        onSelect(newPerson)
        setOpen(false)
        setShowCreateForm(false)
        setNewPersonData({ first_name: "", last_name: "", email: "", phone: "" })
      } catch (error) {
        console.error("Error creating person:", error)
      }
    } else {
      const newPerson = await onCreateNew(newPersonData)
      if (newPerson) {
        onSelect(newPerson)
        setOpen(false)
        setShowCreateForm(false)
        setNewPersonData({ first_name: "", last_name: "", email: "", phone: "" })
      }
    }
  }

  const displayValue = value 
    ? `${value.first_name} ${value.last_name}${value.email ? ` (${value.email})` : ""}`
    : "Buscar huésped..."

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor="person-search">
        Huésped {required && <span className="text-red-500">*</span>}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            id="person-search"
          >
            <span className="truncate">{displayValue}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Buscar por nombre, email o teléfono..." 
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              {loading && (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
              {!loading && searchTerm.length < 2 && (
                <CommandEmpty>Escribe al menos 2 caracteres para buscar...</CommandEmpty>
              )}
              {!loading && searchTerm.length >= 2 && persons.length === 0 && !showCreateForm && (
                <CommandEmpty>
                  <div className="py-4 text-center">
                    <p className="text-sm text-gray-500 mb-2">No se encontraron huéspedes</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setShowCreateForm(true)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Crear nuevo huésped
                    </Button>
                  </div>
                </CommandEmpty>
              )}
              {!loading && !showCreateForm && persons.length > 0 && (
                <CommandGroup>
                  {persons.map((person) => (
                    <CommandItem
                      key={person.id}
                      value={person.id}
                      onSelect={() => {
                        onSelect(person)
                        setOpen(false)
                        setSearchTerm("")
                      }}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value?.id === person.id ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {person.first_name} {person.last_name}
                        </span>
                        {(person.email || person.phone) && (
                          <span className="text-xs text-gray-500">
                            {person.email && person.email}
                            {person.email && person.phone && " • "}
                            {person.phone && person.phone}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {showCreateForm && (
                <CommandGroup>
                  <div className="p-4 space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Nombre</Label>
                      <Input
                        placeholder="Nombre"
                        value={newPersonData.first_name}
                        onChange={(e) =>
                          setNewPersonData({ ...newPersonData, first_name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Apellidos</Label>
                      <Input
                        placeholder="Apellidos"
                        value={newPersonData.last_name}
                        onChange={(e) =>
                          setNewPersonData({ ...newPersonData, last_name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Email (opcional)</Label>
                      <Input
                        type="email"
                        placeholder="email@ejemplo.com"
                        value={newPersonData.email}
                        onChange={(e) =>
                          setNewPersonData({ ...newPersonData, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Teléfono (opcional)</Label>
                      <Input
                        type="tel"
                        placeholder="+34 600 000 000"
                        value={newPersonData.phone}
                        onChange={(e) =>
                          setNewPersonData({ ...newPersonData, phone: e.target.value })
                        }
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleCreateNew}
                        disabled={!newPersonData.first_name.trim() || !newPersonData.last_name.trim()}
                        className="flex-1"
                      >
                        Crear
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowCreateForm(false)
                          setNewPersonData({ first_name: "", last_name: "", email: "", phone: "" })
                        }}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {value && (
        <p className="text-xs text-gray-500">
          {value.email && `Email: ${value.email}`}
          {value.email && value.phone && " • "}
          {value.phone && `Tel: ${value.phone}`}
        </p>
      )}
    </div>
  )
}

