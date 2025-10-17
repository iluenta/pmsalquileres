import React from 'react';
import { MapPinIcon, SunIcon, RefreshCwIcon } from 'lucide-react';

interface WeatherHeaderProps {
  unit: 'C' | 'F';
  toggleUnit: () => void;
  latitude: number | null;
  longitude: number | null;
  onRefresh: () => void;
  cityName?: string;
}

export function WeatherHeader({ unit, toggleUnit, latitude, longitude, onRefresh, cityName }: WeatherHeaderProps) {
  console.log('[v0] WeatherHeader props:', { latitude, longitude, unit, cityName });
  
  const displayLocation = cityName || (latitude !== null && longitude !== null 
    ? `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
    : 'Ubicación desconocida');
    
  console.log('[v0] WeatherHeader displayLocation:', displayLocation);

  return (
    <div className="p-5 flex flex-col md:flex-row justify-between items-center border-b border-gray-100">
      <div className="flex items-center mb-3 md:mb-0">
        <SunIcon className="h-8 w-8 text-amber-400 mr-2" />
        <h1 className="text-2xl font-bold text-gray-800">Clima Actual</h1>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center text-gray-600">
          <MapPinIcon className="h-5 w-5 mr-1" />
          <span className="text-sm font-medium" data-test="location-display">
            {displayLocation} (v2)
          </span>
        </div>
        <button
          onClick={toggleUnit}
          className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm font-medium transition-colors"
        >
          °{unit}
        </button>
        <button 
          onClick={onRefresh}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          title="Actualizar datos"
        >
          <RefreshCwIcon className="h-5 w-5 text-gray-500" />
        </button>
      </div>
    </div>
  );
}
