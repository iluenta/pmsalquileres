import React from 'react';
import { SunriseIcon, SunsetIcon } from 'lucide-react';

interface SunriseSunsetProps {
  sunrise: string;
  sunset: string;
}

export function SunriseSunset({ sunrise, sunset }: SunriseSunsetProps) {
  return (
    <div className="flex justify-between mt-6 pt-4 border-t border-white border-opacity-20">
      <div className="flex items-center">
        <SunriseIcon className="h-5 w-5 mr-2 text-amber-300" />
        <div>
          <div className="text-sm font-medium">Amanecer</div>
          <div className="text-xs text-white text-opacity-75">{sunrise}</div>
        </div>
      </div>
      <div className="flex items-center">
        <SunsetIcon className="h-5 w-5 mr-2 text-amber-300" />
        <div>
          <div className="text-sm font-medium">Atardecer</div>
          <div className="text-xs text-white text-opacity-75">{sunset}</div>
        </div>
      </div>
    </div>
  );
}
