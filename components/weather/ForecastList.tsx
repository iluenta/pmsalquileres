import React from 'react';
import { CalendarIcon } from 'lucide-react';
import { ForecastDay } from './ForecastDay';
import { WeatherForecast as WeatherForecastType } from '@/types/weather';

interface ForecastListProps {
  unit: 'C' | 'F';
  forecast: WeatherForecastType[];
}

export function ForecastList({ unit, forecast }: ForecastListProps) {
  return (
    <div className="p-5">
      <div className="flex items-center mb-4">
        <CalendarIcon className="h-5 w-5 text-blue-500 mr-2" />
        <h2 className="text-lg font-semibold text-gray-800">
          Pronóstico de 5 días
        </h2>
      </div>
      
      <div className="space-y-3">
        {forecast.map((dayForecast, index) => (
          <ForecastDay
            key={index}
            forecast={dayForecast}
            unit={unit}
            isToday={index === 0}
          />
        ))}
      </div>
      
      <div className="mt-5 flex items-start p-3 bg-amber-50 rounded-lg border border-amber-100">
        <div className="text-amber-500 mr-2 font-bold">💡</div>
        <p className="text-xs text-amber-700">
          Consejo: Los datos se actualizan cada hora. La probabilidad de
          precipitación se refiere a la posibilidad de lluvia durante el día.
        </p>
      </div>
    </div>
  );
}








