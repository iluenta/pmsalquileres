"use client"

import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useWeather } from '@/hooks/useWeather'
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSun,
  CloudLightning,
  CloudFog,
  Wind,
  Droplets,
  RefreshCw
} from 'lucide-react'

interface WeatherWidgetProps {
  latitude: number | null
  longitude: number | null
  locality?: string | null
  propertyName?: string
}

// --- Helper Components ---

function WeatherIcon({ condition, className }: { condition: string; className?: string }) {
  const c = condition.toLowerCase()
  if (c.includes('despejado') || c.includes('claro') || c.includes('clear') || c.includes('soleado'))
    return <Sun className={`${className} text-amber-400`} />
  if (c.includes('nublado') || c.includes('clouds') || c.includes('nubes')) {
    if (c.includes('parcialmente') || c.includes('partly'))
      return <CloudSun className={`${className} text-amber-300`} />
    return <Cloud className={`${className} text-blue-200`} />
  }
  if (c.includes('lluvia') || c.includes('rain'))
    return <CloudRain className={`${className} text-blue-400`} />
  if (c.includes('tormenta') || c.includes('thunder'))
    return <CloudLightning className={`${className} text-indigo-400`} />
  if (c.includes('niebla') || c.includes('fog'))
    return <CloudFog className={`${className} text-gray-300`} />
  return <CloudSun className={`${className} text-blue-300`} />
}

function ForecastCard({ day, unit, isToday }: { day: any; unit: 'C' | 'F'; isToday: boolean }) {
  const [dd, mm, yyyy] = day.date.split('/')
  const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
  const dayName = isToday ? 'Hoy' : date.toLocaleDateString('es-ES', { weekday: 'short' })
  const dayNumber = date.getDate()

  return (
    <div className={`bg-white rounded-[24px] p-6 flex flex-col items-center gap-3 shadow-sm border border-gray-100 transition-all hover:scale-105 ${isToday ? 'border-blue-200 ring-2 ring-blue-50/50' : ''}`}>
      <div className="text-center mb-1">
        <p className="font-bold text-gray-900 text-lg capitalize leading-tight">{dayName}</p>
        <p className="text-sm text-gray-400 font-medium">{dayNumber}</p>
      </div>

      <div className="my-1.5">
        <WeatherIcon condition={day.condition} className="h-10 w-10" />
      </div>

      <div className="flex justify-center items-baseline gap-1 mt-1">
        <span className="text-xl font-bold text-gray-900">{Math.round(unit === 'C' ? day.maxTemp : (day.maxTemp * 9) / 5 + 32)}°</span>
        <span className="text-sm font-medium text-gray-400 ml-1">{Math.round(unit === 'C' ? day.minTemp : (day.minTemp * 9) / 5 + 32)}°</span>
      </div>

      <p className="text-sm md:text-base font-medium text-gray-500 text-center leading-snug mb-2 min-h-[3rem] flex items-center justify-center underline decoration-dotted decoration-blue-200/50 underline-offset-4 break-words px-1">
        {day.condition}
      </p>

      <div className="w-full pt-4 border-t border-gray-50 flex flex-col gap-2">
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-blue-500">
          <Droplets className="h-4 w-4" />
          <span>{Math.round(day.precipitation)}%</span>
        </div>
        <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-300">
          <Wind className="h-4 w-4" />
          <span>{Math.round(day.windSpeed)} km/h</span>
        </div>
      </div>
    </div>
  )
}

// --- Loading Skeleton ---
function WeatherSkeleton() {
  return (
    <div className="w-full space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-gray-200 rounded-lg mx-auto" />
      <div className="h-56 w-full bg-gray-200 rounded-3xl" />
      <div className="grid grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-44 bg-gray-200 rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

export function WeatherWidget({ latitude, longitude, locality, propertyName }: WeatherWidgetProps) {
  const [unit] = useState<'C' | 'F'>('C')
  const { data: weather, loading, error, refetch } = useWeather(latitude, longitude)

  if (loading) return <WeatherSkeleton />

  if (!latitude || !longitude) {
    return (
      <Card className="rounded-2xl border-dashed border-2">
        <CardContent className="p-10 text-center">
          <p className="text-gray-500">⚠️ Ubicación no configurada para el clima.</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="rounded-2xl border-red-100 bg-red-50">
        <CardContent className="p-8 text-center">
          <p className="text-red-600 font-medium">Error al cargar el clima.</p>
          <Button onClick={refetch} variant="outline" size="sm" className="mt-4">Reintentar</Button>
        </CardContent>
      </Card>
    )
  }

  if (weather) {
    // Formatear cityName: si locality tiene coma (municipio, provincia), poner provincia entre paréntesis
    let formattedLocality = ''
    if (locality) {
      const parts = locality.split(',').map(p => p.trim())
      if (parts.length > 1) {
        // Hay municipio y provincia: "Vera, Almería" -> "Vera (Almería)"
        formattedLocality = `${parts[0]} (${parts.slice(1).join(', ')})`
      } else {
        // Solo un valor: usar tal cual
        formattedLocality = parts[0]
      }
    }

    const cityName = propertyName
      ? `${propertyName}${formattedLocality ? `, ${formattedLocality}` : ''}`
      : (formattedLocality || weather.location?.name || "Ubicación de la propiedad")

    const formattedDate = new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    }).format(new Date())
    const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)

    return (
      <div className="w-full space-y-6" data-version="v2">
        {/* Título Superior */}
        <div className="text-center mb-2">
          <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
            El Tiempo en <span className="text-blue-600">{cityName}</span>
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-1">Tiempo actualizado para {capitalizedDate}</p>
        </div>

        {/* Card Principal - Diseño EXACTO de la imagen */}
        <div className="relative overflow-hidden bg-gradient-to-br from-[#3b82f6] via-[#4f46e5] to-[#7c3aed] rounded-[24px] p-8 md:p-10 text-white shadow-xl max-w-5xl mx-auto">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12">

            {/* Lado izquierdo: Icono grande y Temperatura masiva */}
            <div className="flex items-center gap-10">
              <WeatherIcon condition={weather.current.condition} className="h-24 w-24 md:h-32 md:w-32 drop-shadow-2xl" />
              <div>
                <div className="text-7xl md:text-8xl font-black flex items-start leading-none tracking-tighter">
                  {Math.round(unit === 'C' ? weather.current.temperature : (weather.current.temperature * 9) / 5 + 32)}
                  <span className="text-4xl md:text-5xl mt-2">°</span>
                </div>
                <div className="mt-2 space-y-1">
                  <p className="text-xl md:text-2xl font-bold opacity-95">{weather.current.condition}</p>
                  <p className="text-sm md:text-base opacity-80 font-medium">
                    Sensación térmica: {Math.round(unit === 'C' ? weather.current.feelsLike : (weather.current.feelsLike * 9) / 5 + 32)}°
                  </p>
                </div>
              </div>
            </div>

            {/* Lado derecho: Métricas verticales elegantes */}
            <div className="flex flex-col gap-4 min-w-[180px]">
              <div className="bg-white/10 backdrop-blur-md rounded-[18px] p-4 flex items-center gap-4 border border-white/20 shadow-inner">
                <div className="bg-white/10 p-2 rounded-lg">
                  <Droplets className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Humedad</p>
                  <p className="text-2xl font-black leading-none mt-1">{weather.current.humidity}%</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-[18px] p-4 flex items-center gap-4 border border-white/20 shadow-inner">
                <div className="bg-white/10 p-2 rounded-lg">
                  <Wind className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Viento</p>
                  <p className="text-2xl font-black leading-none mt-1">{Math.round(weather.current.windSpeed)} <span className="text-xs font-bold opacity-70">km/h</span></p>
                </div>
              </div>
            </div>

          </div>

          {/* Decoración de fondo */}
          <div className="absolute top-[-30%] right-[-10%] w-[300px] h-[300px] bg-white/10 rounded-full blur-[80px]"></div>
          <div className="absolute bottom-[-20%] left-[-10%] w-[200px] h-[200px] bg-[#6366f1]/30 rounded-full blur-[60px]"></div>
        </div>

        {/* Pronóstico de 5 días */}
        <div className="max-w-5xl mx-auto mt-8">
          <h3 className="text-2xl font-black text-gray-900 mb-6 px-1">Pronóstico de 5 días</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
            {weather.forecast.slice(0, 5).map((day, i) => (
              <ForecastCard key={i} day={day} unit={unit} isToday={i === 0} />
            ))}
          </div>
        </div>

        {/* Consejos para tu estancia */}
        <div className="max-w-5xl mx-auto mt-8">
          <div className="bg-[#FFF9EA] rounded-2xl p-6 md:p-8 border border-[#FEF3C7] shadow-sm flex items-start gap-5">
            <div className="bg-[#FEF3C7] rounded-xl p-3 shrink-0">
              <Sun className="h-6 w-6 text-[#D97706]" />
            </div>
            <div className="space-y-2">
              <h4 className="text-lg font-black text-[#92400E]">Consejos para tu estancia</h4>
              <p className="text-gray-700 leading-relaxed text-sm md:text-base font-medium">
                Vera disfruta de un clima mediterráneo con más de 300 días de sol al año. Te recomendamos llevar protección solar, ropa ligera y cómoda, y no olvides hidratarte frecuentemente, especialmente durante los meses de verano.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-6 opacity-40">
          <button onClick={refetch} className="text-[11px] font-black text-gray-500 hover:text-blue-600 transition-colors inline-flex items-center gap-2 uppercase tracking-[2px]">
            <RefreshCw className="h-3.5 w-3.5" />
            Actualizado: {new Date(weather.current.timestamp * 1000).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </button>
        </div>
      </div>
    )
  }

  return null
}
