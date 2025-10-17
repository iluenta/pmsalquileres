import React from 'react';
import { CurrentWeather as CurrentWeatherType } from '@/types/weather';
import { CloudIcon, CloudSunIcon, SunIcon, DropletIcon, WindIcon, ArrowUpIcon } from 'lucide-react';
import { SunriseSunset } from './SunriseSunset';

interface CurrentWeatherProps {
  unit: 'C' | 'F';
  data: CurrentWeatherType;
}

export function CurrentWeather({ unit, data }: CurrentWeatherProps) {
  console.log('[v0] CurrentWeather data:', data);
  
  // Convert temperature if needed
  const temp = unit === 'C' ? Math.round(data.temperature) : Math.round((data.temperature * 9) / 5 + 32);
  const feelsLike = unit === 'C' ? Math.round(data.feelsLike) : Math.round((data.feelsLike * 9) / 5 + 32);

  // Función para obtener una descripción corta y clara
  const getShortDescription = (condition: string, description: string) => {
    const conditionMap: { [key: string]: string } = {
      'clear': 'Cielo Claro',
      'clouds': 'Nubes',
      'rain': 'Lluvia',
      'snow': 'Nieve',
      'mist': 'Niebla',
      'fog': 'Niebla',
      'haze': 'Calima',
      'dust': 'Polvo',
      'sand': 'Arena',
      'ash': 'Ceniza',
      'squall': 'Ráfaga',
      'tornado': 'Tornado',
      'thunderstorm': 'Tormenta'
    };
    
    const mappedCondition = conditionMap[condition.toLowerCase()] || condition;
    
    // Si la descripción es muy larga, usar la condición mapeada
    if (description && description.length > 15) {
      return mappedCondition;
    }
    
    const result = description || mappedCondition;
    console.log('[v0] getShortDescription result:', { condition, description, result });
    return result;
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white p-6">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
            <span className="text-5xl font-bold">
              {temp}°{unit}
            </span>
            <CloudIcon className="h-12 w-12 ml-4 text-white opacity-90" />
          </div>
          <p className="text-white text-opacity-90 mt-1">
            Sensación térmica {feelsLike}°{unit}
          </p>
        </div>
        <div className="text-right">
          <span className="bg-white bg-opacity-20 px-3 py-1 rounded-full text-sm font-medium text-blue-800 border border-white border-opacity-30">
            {getShortDescription(data.condition, data.description)}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-4 gap-4 mt-8 pt-6 border-t border-white border-opacity-20">
        <div className="text-center">
          <DropletIcon className="h-5 w-5 mx-auto mb-1 text-blue-100" />
          <div className="text-xl font-semibold">{data.humidity}%</div>
          <div className="text-xs text-white text-opacity-75">Humedad</div>
        </div>
        <div className="text-center">
          <WindIcon className="h-5 w-5 mx-auto mb-1 text-blue-100" />
          <div className="text-xl font-semibold">{data.windSpeed} km/h</div>
          <div className="text-xs text-white text-opacity-75">Viento {data.windDirection}</div>
        </div>
        <div className="text-center">
          <ArrowUpIcon className="h-5 w-5 mx-auto mb-1 text-blue-100" />
          <div className="text-xl font-semibold">{data.pressure} hPa</div>
          <div className="text-xs text-white text-opacity-75">Presión</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-semibold">0</div>
          <div className="text-xs text-white text-opacity-75">UV</div>
        </div>
      </div>
      
      <SunriseSunset 
        sunrise={data.sunrise}
        sunset={data.sunset}
      />
    </div>
  );
}