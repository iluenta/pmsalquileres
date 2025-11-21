import React from 'react';

interface WeatherFooterProps {
  lastUpdate: Date;
}

export function WeatherFooter({ lastUpdate }: WeatherFooterProps) {
  return (
    <div className="p-4 text-center text-xs text-gray-500 bg-gray-50 border-t border-gray-100">
      Datos proporcionados por OpenWeatherMap · Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}
    </div>
  );
}













