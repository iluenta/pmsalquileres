import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { WeatherHeader } from './WeatherHeader';
import { CurrentWeather } from './CurrentWeather';
import { ForecastList } from './ForecastList';
import { WeatherFooter } from './WeatherFooter';
import { useWeather } from '@/hooks/useWeather';

interface WeatherWidgetProps {
  latitude: number | null;
  longitude: number | null;
}

// Componente de carga
function WeatherSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Skeleton para clima actual */}
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-20 mb-2" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="text-right">
              <Skeleton className="h-12 w-12 mb-2" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          
          {/* Skeleton para detalles */}
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center">
                <Skeleton className="h-6 w-12 mx-auto mb-1" />
                <Skeleton className="h-3 w-16 mx-auto" />
              </div>
            ))}
          </div>
          
          {/* Skeleton para pronóstico */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function WeatherWidget({ latitude, longitude }: WeatherWidgetProps) {
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const { data: weather, loading, error, refetch } = useWeather(latitude, longitude);

  console.log('[v0] WeatherWidget props:', { latitude, longitude });
  console.log('[v0] WeatherWidget state:', { weather, loading, error });

  const toggleUnit = () => {
    setUnit((prev) => (prev === 'C' ? 'F' : 'C'));
  };

  // Mostrar skeleton mientras carga
  if (loading) {
    return <WeatherSkeleton />;
  }

  // Mostrar error si no hay coordenadas
  if (!latitude || !longitude) {
    console.log('[v0] No coordinates provided, showing error message');
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertDescription>
              ⚠️ No se han configurado las coordenadas de la propiedad. 
              Contacta con el administrador para agregar la ubicación y poder mostrar el clima.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Mostrar error de API
  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <AlertDescription>
              ⚠️ Error al cargar datos del clima: {error.message}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Mostrar datos del clima
  if (weather) {
    console.log('[v0] WeatherWidget rendering with weather data:', weather);
    console.log('[v0] WeatherWidget coordinates:', { latitude, longitude });
    
    return (
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl" data-version="v2">
        <WeatherHeader 
          unit={unit} 
          toggleUnit={toggleUnit} 
          latitude={latitude}
          longitude={longitude}
          onRefresh={refetch}
          cityName={weather.location?.name}
        />
        <CurrentWeather 
          unit={unit} 
          data={weather.current}
        />
        <ForecastList 
          unit={unit} 
          forecast={weather.forecast}
        />
        <WeatherFooter 
          lastUpdate={new Date(weather.current.timestamp * 1000)}
        />
      </div>
    );
  }

  return null;
}
