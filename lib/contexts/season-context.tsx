"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

interface SeasonContextType {
  selectedYear: number | null // Puede ser null para "Todos"
  setSelectedYear: (year: number | null) => void
  availableYears: number[]
  loadAvailableYears: () => Promise<void>
}

const SeasonContext = createContext<SeasonContextType | undefined>(undefined)

const STORAGE_KEY = "selected-season-year"

export function SeasonProvider({ children }: { children: React.ReactNode }) {
  // Inicializar con año actual por defecto
  const getInitialYear = (): number | null => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        // Si es "all" o "todos", retornar null
        if (stored === "all" || stored === "todos") {
          return null
        }
        const year = parseInt(stored, 10)
        if (!isNaN(year)) {
          return year
        }
      }
    }
    // Por defecto, año actual
    return new Date().getFullYear()
  }

  // Estado inicial puede ser número o null
  const [selectedYear, setSelectedYearState] = useState<number | null>(getInitialYear())
  const [availableYears, setAvailableYears] = useState<number[]>([])

  // Sincronizar con localStorage al montar (por si cambió en otra pestaña)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        // Si es "all" o "todos", establecer null
        if (stored === "all" || stored === "todos") {
          setSelectedYearState(null)
        } else {
          const year = parseInt(stored, 10)
          if (!isNaN(year)) {
            setSelectedYearState((prev) => {
              // Solo actualizar si es diferente
              return prev !== year ? year : prev
            })
          } else {
            // Si el valor almacenado no es válido, usar año actual
            const currentYear = new Date().getFullYear()
            setSelectedYearState(currentYear)
            localStorage.setItem(STORAGE_KEY, currentYear.toString())
            document.cookie = `${STORAGE_KEY}=${currentYear.toString()}; path=/; max-age=31536000`
          }
        }
      } else {
        // Si no hay valor almacenado, usar año actual por defecto
        const currentYear = new Date().getFullYear()
        setSelectedYearState((prev) => {
          if (prev === null) {
            // Guardar en localStorage y cookie para persistencia
            localStorage.setItem(STORAGE_KEY, currentYear.toString())
            document.cookie = `${STORAGE_KEY}=${currentYear.toString()}; path=/; max-age=31536000`
            return currentYear
          }
          return prev
        })
      }
    }
  }, []) // Solo ejecutar una vez al montar

  // Guardar en localStorage y cookies cuando cambia
  const setSelectedYear = useCallback((year: number | null) => {
    setSelectedYearState(year)
    if (year === null) {
      // Guardar "all" para indicar "Todos"
      localStorage.setItem(STORAGE_KEY, "all")
      document.cookie = `${STORAGE_KEY}=all; path=/; max-age=31536000`
    } else {
      localStorage.setItem(STORAGE_KEY, year.toString())
      // También guardar en cookie para acceso desde servidor
      document.cookie = `${STORAGE_KEY}=${year.toString()}; path=/; max-age=31536000` // 1 año
    }
  }, [])

  // Cargar años disponibles desde las reservas
  const loadAvailableYears = useCallback(async () => {
    try {
      const response = await fetch("/api/bookings/years")
      if (response.ok) {
        const years = await response.json()
        setAvailableYears(years)
      } else {
        // Si falla, usar años por defecto (año actual ± 2)
        const currentYear = new Date().getFullYear()
        const defaultYears = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)
        setAvailableYears(defaultYears)
      }
    } catch (error) {
      console.error("Error loading available years:", error)
      // Años por defecto en caso de error
      const currentYear = new Date().getFullYear()
      const defaultYears = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)
      setAvailableYears(defaultYears)
    }
  }, [])

  // Cargar años disponibles al montar
  useEffect(() => {
    loadAvailableYears()
  }, [loadAvailableYears])

  return (
    <SeasonContext.Provider
      value={{
        selectedYear,
        setSelectedYear,
        availableYears,
        loadAvailableYears,
      }}
    >
      {children}
    </SeasonContext.Provider>
  )
}

export function useSeason() {
  const context = useContext(SeasonContext)
  if (context === undefined) {
    throw new Error("useSeason must be used within a SeasonProvider")
  }
  return context
}

