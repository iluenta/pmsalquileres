"use client"

import { useWeather } from "@/hooks/useWeather"
import { Cloud, CloudRain, Sun } from "lucide-react"

interface GuideWeatherWidgetProps {
  latitude?: number | null
  longitude?: number | null
}

export function GuideWeatherWidget({ latitude, longitude }: GuideWeatherWidgetProps) {
  console.log('[GuideWeatherWidget] Coordinates:', { latitude, longitude })
  
  const { data, loading, error } = useWeather(latitude ?? null, longitude ?? null)

  if (!latitude || !longitude) {
    console.log('[GuideWeatherWidget] No coordinates, returning null')
    return null
  }

  if (loading) {
    return (
      <section className="py-8 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <div className="animate-pulse">Cargando clima...</div>
          </div>
        </div>
      </section>
    )
  }

  if (error || !data) {
    console.log('[GuideWeatherWidget] Error or no data:', { error, data })
    return null
  }

  // Determinar el icono basado en la condición del clima
  const getWeatherIcon = (condition: string) => {
    const conditionLower = condition.toLowerCase()
    if (conditionLower.includes('lluvia') || conditionLower.includes('rain')) {
      return CloudRain
    } else if (conditionLower.includes('despejado') || conditionLower.includes('clear') || conditionLower.includes('sun')) {
      return Sun
    } else {
      return Cloud
    }
  }

  const WeatherIcon = getWeatherIcon(data.current.description)
  const cityName = data.location?.name || "Vera"

  return (
    <section className="py-8 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <WeatherIcon className="h-12 w-12 md:h-16 md:w-16" />
            <div>
              <p className="text-sm md:text-base opacity-90">Clima actual en {cityName}</p>
              <p className="text-3xl md:text-4xl font-bold">{Math.round(data.current.temperature)}°C</p>
            </div>
          </div>

          <div className="flex gap-8 text-center md:text-left">
            <div>
              <p className="text-sm opacity-75">Condición</p>
              <p className="font-semibold">{data.current.description}</p>
            </div>
            <div>
              <p className="text-sm opacity-75">Humedad</p>
              <p className="font-semibold">{data.current.humidity}%</p>
            </div>
            <div>
              <p className="text-sm opacity-75">Viento</p>
              <p className="font-semibold">{Math.round(data.current.windSpeed)} km/h</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
