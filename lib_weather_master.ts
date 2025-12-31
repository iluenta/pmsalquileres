import {
  WeatherData,
  CurrentWeather,
  WeatherForecast,
  GoogleWeatherCurrentResponse,
  GoogleWeatherForecastResponse,
  WeatherError
} from '@/types/weather';

const GOOGLE_WEATHER_BASE_URL = 'https://weather.googleapis.com/v1';
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_WEATHER_API_KEY;

if (!API_KEY) {
  console.error('NEXT_PUBLIC_GOOGLE_WEATHER_API_KEY no est├í configurada en .env.local');
}

// Funci├│n para convertir timestamp a hora legible
function formatTime(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error('[Google Weather] Error formatting time:', error);
    return '--:--';
  }
}

// Funci├│n para convertir timestamp a fecha legible
function formatDate(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    console.error('[Google Weather] Error formatting date:', error);
    return 'Fecha inv├ílida';
  }
}

// Funci├│n para obtener direcci├│n del viento
function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

// Funci├│n para convertir c├│digo de clima de Google a descripci├│n legible
// Función para convertir código de clima de Google a descripción legible
function getWeatherDescription(weatherCode: string, lang: string = 'es'): { condition: string; description: string; icon: string } {
  // Normalizar el código a mayúsculas y limpiar espacios
  const normalizedCode = (weatherCode || '').toUpperCase().trim();

  // Definir tipo para la información de clima por idioma o como string (icon)
  type WeatherInfoItem = { condition: string; description: string };

  const weatherMap: Record<string, Record<string, WeatherInfoItem | string> & { icon: string }> = {
    'CLEAR': {
      es: { condition: 'Despejado', description: 'Cielo despejado' },
      en: { condition: 'Clear', description: 'Clear sky' },
      fr: { condition: 'Dégagé', description: 'Ciel dégagé' },
      de: { condition: 'Klar', description: 'Klarer Himmel' },
      it: { condition: 'Sereno', description: 'Cielo sereno' },
      icon: '01d'
    },
    'MOSTLY_CLEAR': {
      es: { condition: 'Mayormente despejado', description: 'Mayormente despejado' },
      en: { condition: 'Mostly clear', description: 'Mostly clear' },
      fr: { condition: 'Plutôt dégagé', description: 'Plutôt dégagé' },
      de: { condition: 'Überwiegend klar', description: 'Überwiegend klar' },
      it: { condition: 'Prevalentemente sereno', description: 'Prevalentemente sereno' },
      icon: '02d'
    },
    'MOSTLY_SUNNY': {
      es: { condition: 'Mayormente soleado', description: 'Mayormente soleado' },
      en: { condition: 'Mostly sunny', description: 'Mostly sunny' },
      fr: { condition: 'Plutôt ensoleillé', description: 'Plutôt ensoleillé' },
      de: { condition: 'Überwiegend sonnig', description: 'Überwiegend sonnig' },
      it: { condition: 'Prevalentemente soleggiato', description: 'Prevalentemente soleggiato' },
      icon: '02d'
    },
    'PARTLY_CLOUDY': {
      es: { condition: 'Parcialmente nublado', description: 'Parcialmente nublado' },
      en: { condition: 'Partly cloudy', description: 'Partly cloudy' },
      fr: { condition: 'Partiellement nuageux', description: 'Partiellement nuageux' },
      de: { condition: 'Teilweise bewölkt', description: 'Teilweise bewölkt' },
      it: { condition: 'Parzialmente nuvoloso', description: 'Parzialmente nuvoloso' },
      icon: '02d'
    },
    'MOSTLY_CLOUDY': {
      es: { condition: 'Mayormente nublado', description: 'Mayormente nublado' },
      en: { condition: 'Mostly cloudy', description: 'Mostly cloudy' },
      fr: { condition: 'Plutôt nuageux', description: 'Plutôt nuageux' },
      de: { condition: 'Überwiegend bewölkt', description: 'Überwiegend bewölkt' },
      it: { condition: 'Prevalentemente nuvoloso', description: 'Prevalentemente nuvoloso' },
      icon: '03d'
    },
    'CLOUDY': {
      es: { condition: 'Nublado', description: 'Nublado' },
      en: { condition: 'Cloudy', description: 'Cloudy' },
      fr: { condition: 'Nuageux', description: 'Nuageux' },
      de: { condition: 'Bewölkt', description: 'Bewölkt' },
      it: { condition: 'Nuvoloso', description: 'Nuvoloso' },
      icon: '04d'
    },
    'OVERCAST': {
      es: { condition: 'Muy nublado', description: 'Muy nublado' },
      en: { condition: 'Overcast', description: 'Overcast' },
      fr: { condition: 'Couvert', description: 'Couvert' },
      de: { condition: 'Bedeckt', description: 'Bedeckt' },
      it: { condition: 'Coperto', description: 'Coperto' },
      icon: '04d'
    },
    'FOG': {
      es: { condition: 'Niebla', description: 'Niebla' },
      en: { condition: 'Fog', description: 'Fog' },
      fr: { condition: 'Brouillard', description: 'Brouillard' },
      de: { condition: 'Nebel', description: 'Nebel' },
      it: { condition: 'Nebbia', description: 'Nebbia' },
      icon: '50d'
    },
    'LIGHT_RAIN': {
      es: { condition: 'Lluvia ligera', description: 'Lluvia ligera' },
      en: { condition: 'Light rain', description: 'Light rain' },
      fr: { condition: 'Pluie légère', description: 'Pluie légère' },
      de: { condition: 'Leichter Regen', description: 'Leichter Regen' },
      it: { condition: 'Pioggia leggera', description: 'Pioggia leggera' },
      icon: '10d'
    },
    'RAIN': {
      es: { condition: 'Lluvia', description: 'Lluvia' },
      en: { condition: 'Rain', description: 'Rain' },
      fr: { condition: 'Pluie', description: 'Pluie' },
      de: { condition: 'Regen', description: 'Regen' },
      it: { condition: 'Pioggia', description: 'Pioggia' },
      icon: '09d'
    },
    'HEAVY_RAIN': {
      es: { condition: 'Lluvia intensa', description: 'Lluvia intensa' },
      en: { condition: 'Heavy rain', description: 'Heavy rain' },
      fr: { condition: 'Pluie forte', description: 'Pluie forte' },
      de: { condition: 'Starker Regen', description: 'Starker Regen' },
      it: { condition: 'Pioggia forte', description: 'Pioggia forte' },
      icon: '09d'
    },
    'THUNDERSTORM': {
      es: { condition: 'Tormenta', description: 'Tormenta eléctrica' },
      en: { condition: 'Thunderstorm', description: 'Thunderstorm' },
      fr: { condition: 'Orage', description: 'Orage' },
      de: { condition: 'Gewitter', description: 'Gewitter' },
      it: { condition: 'Temporale', description: 'Temporale' },
      icon: '11d'
    }
  };

  const info = weatherMap[normalizedCode] || weatherMap['CLEAR'];
  const langInfo = (info[lang] || info['es']) as { condition: string; description: string };

  return {
    condition: langInfo.condition,
    description: langInfo.description,
    icon: info.icon
  };
}

// Transformar respuesta de clima actual de Google
function transformGoogleCurrentWeather(data: any, lang: string = "es"): CurrentWeather {
  console.log('Google Weather API Response:', JSON.stringify(data, null, 2));

  // Extraer datos seg├║n la estructura real de Google Weather API
  // Intentar m├║ltiples rutas posibles para el c├│digo del clima
  const weatherCode =
    data.weatherCondition?.type ||
    data.condition?.type ||
    data.weatherCode ||
    data.condition ||
    'CLEAR';

  console.log('[Weather API] C├│digo de clima extra├¡do:', weatherCode);
  const weatherInfo = getWeatherDescription(weatherCode, lang);
  console.log('[Weather API] Informaci├│n del clima:', weatherInfo);

  const temperature = data.temperature?.degrees || 20;
  const feelsLike = data.feelsLikeTemperature?.degrees || temperature;
  const humidity = data.relativeHumidity || 50;
  const pressure = data.airPressure?.meanSeaLevelMillibars || 1013;
  const windSpeed = data.wind?.speed?.value || 0;
  const windDirection = data.wind?.direction?.degrees || 0;
  const uvIndex = data.uvIndex || 0;
  const currentTime = data.currentTime;

  // Google Weather API v1 currentConditions:lookup no proporciona sunrise/sunset directamente
  // Usaremos placeholders por ahora
  const sunrise = '--:--';
  const sunset = '--:--';

  // Ajustar icono basado en si es de d├¡a o de noche
  let finalIcon = weatherInfo.icon;
  if (data.isDaytime !== undefined) {
    if (weatherInfo.icon.endsWith('d') && !data.isDaytime) {
      finalIcon = weatherInfo.icon.replace('d', 'n');
    } else if (weatherInfo.icon.endsWith('n') && data.isDaytime) {
      finalIcon = weatherInfo.icon.replace('n', 'd');
    }
  }

  const timestamp = new Date(currentTime).getTime() / 1000;

  return {
    temperature: Math.round(temperature),
    feelsLike: Math.round(feelsLike),
    condition: weatherInfo.condition,
    description: weatherInfo.description,
    humidity: Math.round(humidity),
    pressure: Math.round(pressure),
    windSpeed: Math.round(windSpeed),
    windDirection: getWindDirection(windDirection),
    uvIndex: Math.round(uvIndex),
    sunrise: sunrise,
    sunset: sunset,
    icon: finalIcon,
    timestamp: timestamp
  };
}

// Transformar respuesta de pronóstico de Google
function transformGoogleForecast(data: any, lang: string = 'es'): WeatherForecast[] {
  console.log('Google Weather Forecast API Response:', JSON.stringify(data, null, 2));

  // Intentar detectar la colección de días en distintas variantes
  const days: any[] =
    data?.forecastDays ||
    data?.dailyForecasts ||
    data?.daily ||
    data?.days ||
    data?.forecast?.daily ||
    data?.forecast ||
    data?.list ||
    [];

  if (!Array.isArray(days) || days.length === 0) {
    return [];
  }

  return days.slice(0, 5).map((day: any) => {
    // Preferir pronóstico diurno si está disponible
    const daytime = day?.daytimeForecast || day?.day || null;

    // Código de condición
    const weatherCode =
      daytime?.weatherCondition?.type ||
      day?.weatherCondition?.type ||
      day?.weatherCode ||
      day?.weather?.[0]?.main ||
      'CLEAR';
    const weatherInfo = getWeatherDescription(weatherCode, lang);

    // Temperaturas m├íximas y m├¡nimas (diferentes nombres seg├║n API)
    const maxTempRaw =
      day?.temperatureMax?.degrees ??
      day?.maxTemperature?.degrees ??
      day?.maxTemperature?.value ??
      day?.maxTemperature ??
      day?.temp?.max ??
      day?.main?.temp_max ??
      25;
    const minTempRaw =
      day?.temperatureMin?.degrees ??
      day?.minTemperature?.degrees ??
      day?.minTemperature?.value ??
      day?.minTemperature ??
      day?.temp?.min ??
      day?.main?.temp_min ??
      15;

    // Otros valores
    const precipitationRaw =
      daytime?.precipitation?.probability?.percent ??
      day?.precipitation?.probability?.percent ??
      day?.precipitationProbability?.value ??
      day?.precipitationProbability ??
      day?.pop ??
      0;
    const humidityRaw =
      daytime?.relativeHumidity ??
      day?.relativeHumidity ??
      day?.humidity?.value ??
      day?.humidity ??
      day?.main?.humidity ??
      50;
    const windSpeedRaw =
      daytime?.wind?.speed?.value ??
      day?.wind?.speed?.value ??
      day?.windSpeed?.value ??
      day?.windSpeed ??
      day?.wind?.speed ??
      0;

    const dateRaw =
      day?.date ||
      day?.displayDate ||
      day?.interval?.startTime ||
      day?.startTime ||
      day?.validTime ||
      day?.dt_txt ||
      day?.dt ||
      new Date().toISOString();

    const timestamp = typeof dateRaw === 'string'
      ? Math.floor(new Date(dateRaw).getTime() / 1000)
      : typeof dateRaw === 'object' && dateRaw?.year
        ? Math.floor(new Date(`${dateRaw.year}-${String(dateRaw.month).padStart(2, '0')}-${String(dateRaw.day).padStart(2, '0')}`).getTime() / 1000)
        : Math.floor(Date.now() / 1000);

    return {
      date: typeof dateRaw === 'object' && dateRaw?.year
        ? formatDate(`${dateRaw.year}-${String(dateRaw.month).padStart(2, '0')}-${String(dateRaw.day).padStart(2, '0')}`)
        : formatDate(String(dateRaw)),
      maxTemp: Math.round(Number(maxTempRaw)),
      minTemp: Math.round(Number(minTempRaw)),
      condition: weatherInfo.condition,
      description: weatherInfo.description,
      precipitation: Math.round(Number(precipitationRaw)),
      icon: weatherInfo.icon,
      humidity: Math.round(Number(humidityRaw)),
      windSpeed: Math.round(Number(windSpeedRaw)),
      timestamp,
    };
  });
}

// Obtener clima actual usando Google Weather API
export async function getCurrentWeather(lat: number, lon: number, lang: string = 'es'): Promise<CurrentWeather> {
  if (!API_KEY) {
    throw new Error('API key de Google Weather no configurada');
  }

  // Validar coordenadas antes de hacer la llamada
  if (!isValidCoordinates(lat, lon)) {
    throw new Error('Coordenadas no v├ílidas. La latitud debe estar entre -90 y 90, y la longitud entre -180 y 180.');
  }

  // Verificar que no sean coordenadas por defecto (0,0)
  if (lat === 0 && lon === 0) {
    throw new Error('Las coordenadas de la propiedad no est├ín configuradas. Por favor, configura la ubicaci├│n de la propiedad.');
  }

  try {
    const response = await fetch(
      `${GOOGLE_WEATHER_BASE_URL}/currentConditions:lookup?key=${API_KEY}&location.latitude=${lat}&location.longitude=${lon}`
    );

    if (!response.ok) {
      let errorData: any;
      let errorMessage: string;

      try {
        errorData = await response.json();
        errorMessage = errorData.error?.message || errorData.message || response.statusText;
      } catch (parseError) {
        // Si no se puede parsear el JSON, usar el status text
        errorMessage = response.statusText || 'Error desconocido de la API';
      }

      // Manejar error espec├¡fico de ubicaci├│n no soportada
      if (errorMessage.includes('not supported for this location') ||
        errorMessage.includes('Information is not supported') ||
        errorMessage.includes('not supported')) {
        const customError = new Error('La ubicaci├│n de la propiedad no est├í soportada por el servicio de clima. Por favor, verifica las coordenadas de la propiedad.');
        // Marcar el error como controlado para evitar stack traces innecesarios
        (customError as any).isControlled = true;
        throw customError;
      }

      const apiError = new Error(`Error de Google Weather API: ${errorMessage}`);
      (apiError as any).isControlled = true;
      throw apiError;
    }

    const data: GoogleWeatherCurrentResponse = await response.json();
    return transformGoogleCurrentWeather(data, lang);
  } catch (error) {
    // Solo loggear si no es un error controlado
    if (!(error as any)?.isControlled) {
      console.error('[Weather API] Error obteniendo clima actual:', error);
    }
    throw error;
  }
}

// Obtener pronóstico de 5 días usando Google Weather API
export async function getWeatherForecast(lat: number, lon: number, lang: string = 'es'): Promise<WeatherForecast[]> {
  if (!API_KEY) {
    throw new Error('API key de Google Weather no configurada');
  }

  // Validar coordenadas antes de hacer la llamada
  if (!isValidCoordinates(lat, lon)) {
    throw new Error('Coordenadas no v├ílidas. La latitud debe estar entre -90 y 90, y la longitud entre -180 y 180.');
  }

  // Verificar que no sean coordenadas por defecto (0,0)
  if (lat === 0 && lon === 0) {
    throw new Error('Las coordenadas de la propiedad no est├ín configuradas. Por favor, configura la ubicaci├│n de la propiedad.');
  }

  try {
    const response = await fetch(
      `${GOOGLE_WEATHER_BASE_URL}/forecast/days:lookup?key=${API_KEY}&location.latitude=${lat}&location.longitude=${lon}&days=5`
    );

    if (!response.ok) {
      let errorData: any;
      let errorMessage: string;

      try {
        errorData = await response.json();
        errorMessage = errorData.error?.message || errorData.message || response.statusText;
      } catch (parseError) {
        // Si no se puede parsear el JSON, usar el status text
        errorMessage = response.statusText || 'Error desconocido de la API';
      }

      // Manejar error espec├¡fico de ubicaci├│n no soportada
      if (errorMessage.includes('not supported for this location') ||
        errorMessage.includes('Information is not supported') ||
        errorMessage.includes('not supported')) {
        const customError = new Error('La ubicaci├│n de la propiedad no est├í soportada por el servicio de clima. Por favor, verifica las coordenadas de la propiedad.');
        // Marcar el error como controlado para evitar stack traces innecesarios
        (customError as any).isControlled = true;
        throw customError;
      }

      const apiError = new Error(`Error de Google Weather API: ${errorMessage}`);
      (apiError as any).isControlled = true;
      throw apiError;
    }

    const data: GoogleWeatherForecastResponse = await response.json();
    return transformGoogleForecast(data, lang);
  } catch (error) {
    // Solo loggear si no es un error controlado
    if (!(error as any)?.isControlled) {
      console.error('[Weather API] Error obteniendo pron├│stico:', error);
    }
    throw error;
  }
}

// Obtener datos completos de clima (actual + pronóstico)
export async function getWeatherData(lat: number, lon: number, lang: string = 'es'): Promise<WeatherData> {
  // Validar coordenadas antes de hacer cualquier llamada
  if (!isValidCoordinates(lat, lon)) {
    throw new Error('Coordenadas no v├ílidas. La latitud debe estar entre -90 y 90, y la longitud entre -180 y 180.');
  }

  if (lat === 0 && lon === 0) {
    throw new Error('Las coordenadas de la propiedad no est├ín configuradas. Por favor, configura la ubicaci├│n de la propiedad.');
  }

  try {
    // Intentar obtener ambos datos, pero manejar errores de forma independiente
    let current: CurrentWeather | null = null;
    let forecast: WeatherForecast[] = [];
    let errorMessage: string | null = null;
    let hasLocationError = false;

    try {
      current = await getCurrentWeather(lat, lon, lang);
    } catch (error) {
      const err = error instanceof Error ? error.message : 'Error desconocido';
      const isControlled = (error as any)?.isControlled ||
        err.includes('no est├í soportada') ||
        err.includes('not supported') ||
        err.includes('no est├ín configuradas') ||
        err.includes('Coordenadas no v├ílidas');

      // Solo loggear como warning si es un error controlado, para evitar que Next.js lo trate como error no controlado
      if (isControlled) {
        console.warn('[Weather API] Ubicaci├│n no soportada para clima actual:', err);
      } else {
        console.error('[Weather API] Error obteniendo clima actual:', err);
      }

      // Detectar si es un error de ubicaci├│n no soportada
      if (err.includes('no est├í soportada') || err.includes('not supported')) {
        hasLocationError = true;
      }

      errorMessage = err;
      // Si falla el clima actual, intentamos con el pron├│stico de todas formas
    }

    try {
      forecast = await getWeatherForecast(lat, lon, lang);
    } catch (error) {
      const err = error instanceof Error ? error.message : 'Error desconocido';
      const isControlled = (error as any)?.isControlled ||
        err.includes('no est├í soportada') ||
        err.includes('not supported') ||
        err.includes('no est├ín configuradas') ||
        err.includes('Coordenadas no v├ílidas');

      // Solo loggear como warning si es un error controlado, para evitar que Next.js lo trate como error no controlado
      if (isControlled) {
        console.warn('[Weather API] Ubicaci├│n no soportada para pron├│stico:', err);
      } else {
        console.error('[Weather API] Error obteniendo pron├│stico:', err);
      }

      // Detectar si es un error de ubicaci├│n no soportada
      if (err.includes('no est├í soportada') || err.includes('not supported')) {
        hasLocationError = true;
      }

      // Si no hay error previo, usar este
      if (!errorMessage) {
        errorMessage = err;
      }
    }

    // Si ambas llamadas fallaron, lanzar el error con mensaje espec├¡fico
    if (!current && forecast.length === 0) {
      const finalMessage = hasLocationError
        ? 'La ubicaci├│n de la propiedad no est├í soportada por el servicio de clima. Por favor, verifica las coordenadas de la propiedad.'
        : (errorMessage || 'No se pudo obtener informaci├│n del clima para esta ubicaci├│n.');

      const finalError = new Error(finalMessage);
      (finalError as any).isControlled = true;
      throw finalError;
    }

    // Si al menos una llamada tuvo ├®xito, continuar
    // Si falta el clima actual, crear uno b├ísico
    if (!current) {
      current = {
        temperature: 20,
        feelsLike: 20,
        condition: 'Despejado',
        description: 'Informaci├│n no disponible',
        humidity: 50,
        pressure: 1013,
        windSpeed: 0,
        windDirection: 'N',
        uvIndex: 0,
        sunrise: '--:--',
        sunset: '--:--',
        icon: '01d',
        timestamp: Math.floor(Date.now() / 1000)
      };
    }

    // Obtener el nombre de la ciudad usando Google Geocoding API
    const cityName = await getCityName(lat, lon, lang);

    return {
      current,
      forecast,
      location: {
        name: cityName,
        country: 'ES', // Por defecto Espa├▒a
        lat,
        lon
      }
    };
  } catch (error) {
    // Si es un error controlado, solo loggear como warning para evitar que Next.js lo trate como error no controlado
    if ((error as any)?.isControlled) {
      console.warn('[Weather API] Error controlado de clima:', error instanceof Error ? error.message : 'Error desconocido');
    } else {
      console.error('[Weather API] Error obteniendo datos del clima:', error);
    }
    throw error;
  }
}

// Función para obtener el nombre de la ciudad usando Google Geocoding API
async function getCityName(lat: number, lon: number, lang: string = 'es'): Promise<string> {
  if (!API_KEY) {
    return 'Ubicaci├│n de la propiedad';
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${API_KEY}&language=${lang}`
    );

    if (!response.ok) {
      console.warn('No se pudo obtener el nombre de la ciudad');
      return 'Ubicaci├│n de la propiedad';
    }

    const data = await response.json();

    if (data.results && data.results.length > 0) {
      // Buscar el componente de ciudad en los resultados
      const result = data.results[0];
      const cityComponent = result.address_components.find((component: any) =>
        component.types.includes('locality') ||
        component.types.includes('administrative_area_level_2')
      );

      return cityComponent ? cityComponent.long_name : result.formatted_address.split(',')[0];
    }

    return 'Ubicaci├│n de la propiedad';
  } catch (error) {
    console.warn('Error obteniendo nombre de ciudad:', error);
    return 'Ubicaci├│n de la propiedad';
  }
}

// Funci├│n de utilidad para verificar si las coordenadas son v├ílidas
export function isValidCoordinates(lat: number | null, lon: number | null): boolean {
  if (lat === null || lon === null) return false;
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}
