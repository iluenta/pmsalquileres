import { useState, useEffect } from 'react';
import { WeatherData, WeatherError } from '@/types/weather';
import { getWeatherData, isValidCoordinates } from '@/lib/api/weather';

interface UseWeatherReturn {
  data: WeatherData | null;
  loading: boolean;
  error: WeatherError | null;
  refetch: () => void;
}

export function useWeather(latitude: number | null, longitude: number | null): UseWeatherReturn {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<WeatherError | null>(null);

  const fetchWeather = async () => {
    // Validar coordenadas
    if (!isValidCoordinates(latitude, longitude)) {
      setError({
        message: 'Coordenadas de la propiedad no válidas o no configuradas. La latitud debe estar entre -90 y 90, y la longitud entre -180 y 180.'
      });
      setLoading(false);
      return;
    }

    // Verificar que no sean coordenadas por defecto (0,0)
    if (latitude === 0 && longitude === 0) {
      setError({
        message: 'Las coordenadas de la propiedad no están configuradas. Por favor, configura la ubicación de la propiedad en el panel de administración.'
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[v0] Fetching weather data for coordinates:', { latitude, longitude });
      
      const weatherData = await getWeatherData(latitude!, longitude!);
      setData(weatherData);
      
      console.log('[v0] Weather data fetched successfully:', weatherData);
    } catch (err) {
      // Capturar el error de forma controlada
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al obtener datos del clima';
      
      // Determinar si es un error controlado (ubicación no soportada, coordenadas inválidas, etc.)
      const isControlledError = (err as any)?.isControlled || 
                                errorMessage.includes('no está soportada') ||
                                errorMessage.includes('no están configuradas') ||
                                errorMessage.includes('Coordenadas no válidas');
      
      // Solo loggear como error si no es controlado, para evitar que Next.js lo trate como error no controlado
      if (isControlledError) {
        console.warn('[v0] Error controlado de clima:', {
          message: errorMessage,
          coordinates: { latitude, longitude }
        });
      } else {
        console.error('[v0] Error fetching weather data:', {
          message: errorMessage,
          error: err,
          coordinates: { latitude, longitude }
        });
      }
      
      // Establecer el error en el estado para que el componente lo maneje
      setError({
        message: errorMessage
      });
      
      // No re-lanzar el error, ya está manejado en el estado
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (latitude !== null && longitude !== null) {
      fetchWeather();
    }
  }, [latitude, longitude]);

  return {
    data,
    loading,
    error,
    refetch: fetchWeather
  };
}













