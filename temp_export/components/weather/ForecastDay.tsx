import React from 'react';
import { WeatherForecast as WeatherForecastType } from '@/types/weather';
import { CloudIcon, CloudSunIcon, SunIcon, CloudRainIcon, WindIcon } from 'lucide-react';

interface ForecastDayProps {
  forecast: WeatherForecastType;
  unit: 'C' | 'F';
  isToday: boolean;
}

export function ForecastDay({ forecast, unit, isToday }: ForecastDayProps) {
  console.log('[v0] ForecastDay data:', { forecast, unit, isToday });
  
  // Convert temperatures if needed
  const highTemp = unit === 'C' ? Math.round(forecast.maxTemp) : Math.round((forecast.maxTemp * 9) / 5 + 32);
  const lowTemp = unit === 'C' ? Math.round(forecast.minTemp) : Math.round((forecast.minTemp * 9) / 5 + 32);

  const getWeatherIcon = (condition: string) => {
    switch (condition.toLowerCase()) {
      case 'clear':
      case 'cielo claro':
        return <SunIcon className="h-5 w-5 text-amber-400" />;
      case 'clouds':
      case 'nubes':
        return <CloudIcon className="h-5 w-5 text-gray-400" />;
      case 'rain':
      case 'lluvia':
      case 'muy nuboso':
        return <CloudRainIcon className="h-5 w-5 text-gray-500" />;
      default:
        return <CloudSunIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  // Función para obtener el día de la semana
  const getDayOfWeek = (dateString: string, isToday: boolean) => {
    if (isToday) return 'Hoy';
    
    // Convertir formato DD/MM/YYYY a objeto Date
    const [day, month, year] = dateString.split('/');
    const date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
    
    if (isNaN(date.getTime())) {
      console.error('[v0] Invalid date:', dateString);
      return 'Fecha inválida';
    }
    
    return date.toLocaleDateString('es-ES', { weekday: 'short' });
  };

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
        isToday ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50'
      }`}
    >
      <div className="w-24">
        <div
          className={`font-medium ${isToday ? 'text-blue-600' : 'text-gray-700'}`}
        >
          {getDayOfWeek(forecast.date, isToday)}
        </div>
        <div className="text-xs text-gray-500">{forecast.date}</div>
      </div>
      
      <div className="flex items-center">
        {getWeatherIcon(forecast.condition)}
      </div>
      
      <div className="text-center w-16">
        <span className="font-semibold text-gray-800">{highTemp}°</span>
        <span className="text-gray-500 ml-1">{lowTemp}°</span>
      </div>
      
      <div className="w-28 text-right">
        <div className="text-sm font-medium text-gray-700">
          {forecast.description}
        </div>
        <div className="flex items-center justify-end text-xs text-gray-500">
          <WindIcon className="h-3 w-3 mr-1" />
          {forecast.windSpeed} km/h
        </div>
      </div>
    </div>
  );
}
