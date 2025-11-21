"use client"

import { useWeather } from "@/hooks/useWeather"
import { Cloud, CloudRain, Sun, Droplets, Wind } from "lucide-react"

interface GuideWeatherWidgetProps {
  latitude?: number | null
  longitude?: number | null
  locality?: string | null
}

export function GuideWeatherWidget({ latitude, longitude, locality }: GuideWeatherWidgetProps) {
  console.log('[GuideWeatherWidget] Coordinates:', { latitude, longitude })
  console.log('[GuideWeatherWidget] Locality:', locality)
  
  const { data, loading, error } = useWeather(latitude ?? null, longitude ?? null)

  if (!latitude || !longitude) {
    console.log('[GuideWeatherWidget] No coordinates, returning null')
    return null
  }

  if (loading) {
    return (
      <section className="py-12 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <div className="animate-pulse text-lg">Cargando pronóstico del tiempo...</div>
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

  // Función para obtener el día de la semana desde distintos formatos
  const getDayName = (dateString: string) => {
    const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
    let date: Date
    // Soporta formato dd/mm/yyyy
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      const [dd, mm, yyyy] = dateString.split('/')
      date = new Date(Number(yyyy), Number(mm) - 1, Number(dd))
    } else if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
      // ISO yyyy-mm-dd
      date = new Date(dateString)
    } else {
      // Fallback: intentar parsear nativo
      date = new Date(dateString)
    }
    return days[date.getDay()]
  }

  const WeatherIcon = getWeatherIcon(data.current.description)
  const cityName = locality || data.location?.name || "Ubicación de la propiedad"

  return (
    <section className="py-12 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
      <div className="container mx-auto px-4">
        {/* Título */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold font-serif">El Tiempo en {cityName}</h2>
        </div>

        {/* Clima actual */}
        <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 mb-8 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-sm opacity-75 mb-1">Ahora</p>
                <WeatherIcon className="h-12 w-12 mx-auto mb-2" />
              </div>
              <div>
                <p className="text-4xl md:text-5xl font-bold">{Math.round(data.current.temperature)}°C</p>
                <p className="text-lg opacity-90">{data.current.description}</p>
              </div>
            </div>

            <div className="flex gap-6 text-center">
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5 opacity-75" />
                <div>
                  <p className="text-sm opacity-75">Humedad</p>
                  <p className="font-semibold">{data.current.humidity}%</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="h-5 w-5 opacity-75" />
                <div>
                  <p className="text-sm opacity-75">Viento</p>
                  <p className="font-semibold">{Math.round(data.current.windSpeed)} km/h</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pronóstico de 5 días */}
        {data.forecast && data.forecast.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <h3 className="text-lg font-semibold mb-4 text-center">Próximos 5 días</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {data.forecast.slice(0, 5).map((day, index) => {
                const DayWeatherIcon = getWeatherIcon(day.description)
                return (
                  <div key={index} className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <p className="text-sm font-medium mb-2">{getDayName(day.date)}</p>
                    <DayWeatherIcon className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm opacity-90 mb-2">{day.description}</p>
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">{day.maxTemp}°</span>
                      <span className="opacity-75">{day.minTemp}°</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
