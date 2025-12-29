"use client"

import { useEffect, useState } from "react"
import { Cloud, CloudRain, Sun } from "lucide-react"

interface WeatherData {
  temp: number
  description: string
  humidity: number
  windSpeed: number
  icon: string
}

export function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Using Open-Meteo API (no API key required)
    const fetchWeather = async () => {
      try {
        // Coordinates for Vera, Almería
        const lat = 37.2469
        const lon = -1.8686
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=Europe/Madrid`,
        )
        const data = await response.json()

        const weatherCode = data.current.weather_code
        let description = "Despejado"
        let icon = "sun"

        if (weatherCode >= 61 && weatherCode <= 67) {
          description = "Lluvia"
          icon = "rain"
        } else if (weatherCode >= 51 && weatherCode <= 57) {
          description = "Llovizna"
          icon = "rain"
        } else if (weatherCode >= 1 && weatherCode <= 3) {
          description = "Parcialmente nublado"
          icon = "cloud"
        } else if (weatherCode === 0) {
          description = "Despejado"
          icon = "sun"
        }

        setWeather({
          temp: Math.round(data.current.temperature_2m),
          description,
          humidity: data.current.relative_humidity_2m,
          windSpeed: Math.round(data.current.wind_speed_10m),
          icon,
        })
      } catch (error) {
        console.error("[v0] Error fetching weather:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [])

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

  if (!weather) return null

  const WeatherIcon = weather.icon === "sun" ? Sun : weather.icon === "rain" ? CloudRain : Cloud

  return (
    <section className="py-8 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
          <div className="flex items-center gap-4">
            <WeatherIcon className="h-12 w-12 md:h-16 md:w-16" />
            <div>
              <p className="text-sm md:text-base opacity-90">Clima actual en Vera</p>
              <p className="text-3xl md:text-4xl font-bold">{weather.temp}°C</p>
            </div>
          </div>

          <div className="flex gap-8 text-center md:text-left">
            <div>
              <p className="text-sm opacity-75">Condición</p>
              <p className="font-semibold">{weather.description}</p>
            </div>
            <div>
              <p className="text-sm opacity-75">Humedad</p>
              <p className="font-semibold">{weather.humidity}%</p>
            </div>
            <div>
              <p className="text-sm opacity-75">Viento</p>
              <p className="font-semibold">{weather.windSpeed} km/h</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
