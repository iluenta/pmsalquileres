"use client"

import { Footprints, Car } from "lucide-react"

interface DistanceDisplayProps {
  walkingTime?: number | null
  drivingTime?: number | null
}

export function DistanceDisplay({ walkingTime, drivingTime }: DistanceDisplayProps) {
  // Si no hay ningún tiempo, no mostrar nada
  if (!walkingTime && !drivingTime) {
    return null
  }

  // Si walkingTime existe y es <= 15, mostrar solo caminando
  if (walkingTime && walkingTime <= 15) {
    return (
      <div className="flex items-center text-xs text-gray-500 mb-3">
        <Footprints className="h-3 w-3 mr-1" />
        <span>{walkingTime} min caminando</span>
      </div>
    )
  }

  // Si walkingTime > 15 y hay drivingTime, mostrar ambos
  if (walkingTime && walkingTime > 15 && drivingTime) {
    return (
      <div className="flex items-center text-xs text-gray-500 mb-3">
        <Footprints className="h-3 w-3 mr-1" />
        <span>{walkingTime} min caminando o </span>
        <Car className="h-3 w-3 mr-1 ml-1" />
        <span>{drivingTime} min en coche</span>
      </div>
    )
  }

  // Si solo hay walkingTime (aunque sea > 15 pero no hay driving)
  if (walkingTime) {
    return (
      <div className="flex items-center text-xs text-gray-500 mb-3">
        <Footprints className="h-3 w-3 mr-1" />
        <span>{walkingTime} min caminando</span>
      </div>
    )
  }

  // Si solo hay drivingTime
  if (drivingTime) {
    return (
      <div className="flex items-center text-xs text-gray-500 mb-3">
        <Car className="h-3 w-3 mr-1" />
        <span>{drivingTime} min en coche</span>
      </div>
    )
  }

  return null
}

