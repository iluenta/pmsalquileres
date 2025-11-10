"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

interface SeasonContextType {
  selectedYear: number | null
  setSelectedYear: (year: number | null) => void
  availableYears: number[]
  loadAvailableYears: () => Promise<void>
}

const SeasonContext = createContext<SeasonContextType | undefined>(undefined)

const STORAGE_KEY = "selected-season-year"

export function SeasonProvider({ children }: { children: React.ReactNode }) {
  const [selectedYear, setSelectedYearState] = useState<number | null>(null)
  const [availableYears, setAvailableYears] = useState<number[]>([])

  // Cargar año seleccionado desde localStorage al inicializar
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const year = parseInt(stored, 10)
      if (!isNaN(year)) {
        setSelectedYearState(year)
      }
    } else {
      // Por defecto, año actual
      setSelectedYearState(new Date().getFullYear())
    }
  }, [])

  // Guardar en localStorage y cookies cuando cambia
  const setSelectedYear = useCallback((year: number | null) => {
    setSelectedYearState(year)
    if (year !== null) {
      localStorage.setItem(STORAGE_KEY, year.toString())
      // También guardar en cookie para acceso desde servidor
      document.cookie = `${STORAGE_KEY}=${year.toString()}; path=/; max-age=31536000` // 1 año
    } else {
      localStorage.removeItem(STORAGE_KEY)
      // Eliminar cookie
      document.cookie = `${STORAGE_KEY}=; path=/; max-age=0`
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

