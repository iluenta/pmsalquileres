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
        message: 'Coordenadas de la propiedad no válidas o no configuradas'
      });
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
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al obtener datos del clima';
      console.error('[v0] Error fetching weather data:', errorMessage);
      
      setError({
        message: errorMessage
      });
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













