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
  console.error('NEXT_PUBLIC_GOOGLE_WEATHER_API_KEY no está configurada en .env.local');
}

// Función para convertir timestamp a hora legible
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

// Función para convertir timestamp a fecha legible
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
    return 'Fecha inválida';
  }
}

// Función para obtener dirección del viento
function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

// Función para convertir código de clima de Google a descripción legible
function getWeatherDescription(weatherCode: string): { condition: string; description: string; icon: string } {
  // Normalizar el código a mayúsculas y limpiar espacios
  const normalizedCode = (weatherCode || '').toUpperCase().trim();
  
  const weatherMap: { [key: string]: { condition: string; description: string; icon: string } } = {
    'CLEAR': { condition: 'Despejado', description: 'Cielo despejado', icon: '01d' },
    'MOSTLY_CLEAR': { condition: 'Mayormente despejado', description: 'Mayormente despejado', icon: '02d' },
    'MOSTLY_SUNNY': { condition: 'Mayormente soleado', description: 'Mayormente soleado', icon: '02d' },
    'PARTLY_CLOUDY': { condition: 'Parcialmente nublado', description: 'Parcialmente nublado', icon: '02d' },
    'MOSTLY_CLOUDY': { condition: 'Mayormente nublado', description: 'Mayormente nublado', icon: '03d' },
    'CLOUDY': { condition: 'Nublado', description: 'Nublado', icon: '04d' },
    'OVERCAST': { condition: 'Muy nublado', description: 'Muy nublado', icon: '04d' },
    'FOG': { condition: 'Niebla', description: 'Niebla', icon: '50d' },
    'LIGHT_RAIN': { condition: 'Lluvia ligera', description: 'Lluvia ligera', icon: '10d' },
    'RAIN': { condition: 'Lluvia', description: 'Lluvia', icon: '09d' },
    'HEAVY_RAIN': { condition: 'Lluvia intensa', description: 'Lluvia intensa', icon: '09d' },
    'LIGHT_SNOW': { condition: 'Nieve ligera', description: 'Nieve ligera', icon: '13d' },
    'SNOW': { condition: 'Nieve', description: 'Nieve', icon: '13d' },
    'HEAVY_SNOW': { condition: 'Nieve intensa', description: 'Nieve intensa', icon: '13d' },
    'LIGHT_SLEET': { condition: 'Aguanieve ligera', description: 'Aguanieve ligera', icon: '13d' },
    'SLEET': { condition: 'Aguanieve', description: 'Aguanieve', icon: '13d' },
    'HEAVY_SLEET': { condition: 'Aguanieve intensa', description: 'Aguanieve intensa', icon: '13d' },
    'LIGHT_HAIL': { condition: 'Granizo ligero', description: 'Granizo ligero', icon: '13d' },
    'HAIL': { condition: 'Granizo', description: 'Granizo', icon: '13d' },
    'HEAVY_HAIL': { condition: 'Granizo intenso', description: 'Granizo intenso', icon: '13d' },
    'THUNDERSTORM': { condition: 'Tormenta', description: 'Tormenta eléctrica', icon: '11d' },
    'LIGHT_THUNDERSTORM': { condition: 'Tormenta ligera', description: 'Tormenta eléctrica ligera', icon: '11d' },
    'HEAVY_THUNDERSTORM': { condition: 'Tormenta intensa', description: 'Tormenta eléctrica intensa', icon: '11d' }
  };

  // Buscar coincidencia exacta primero
  if (weatherMap[normalizedCode]) {
    return weatherMap[normalizedCode];
  }

  // Si no hay coincidencia exacta, intentar match parcial por palabras clave
  const codeUpper = normalizedCode;
  if (codeUpper.includes('RAIN') || codeUpper.includes('LLUVIA')) {
    if (codeUpper.includes('HEAVY') || codeUpper.includes('INTENSA')) {
      return weatherMap['HEAVY_RAIN'];
    }
    if (codeUpper.includes('LIGHT') || codeUpper.includes('LIGERA')) {
      return weatherMap['LIGHT_RAIN'];
    }
    return weatherMap['RAIN'];
  }
  if (codeUpper.includes('SNOW') || codeUpper.includes('NIEVE')) {
    if (codeUpper.includes('HEAVY') || codeUpper.includes('INTENSA')) {
      return weatherMap['HEAVY_SNOW'];
    }
    if (codeUpper.includes('LIGHT') || codeUpper.includes('LIGERA')) {
      return weatherMap['LIGHT_SNOW'];
    }
    return weatherMap['SNOW'];
  }
  if (codeUpper.includes('THUNDER') || codeUpper.includes('TORMENTA')) {
    if (codeUpper.includes('HEAVY') || codeUpper.includes('INTENSA')) {
      return weatherMap['HEAVY_THUNDERSTORM'];
    }
    if (codeUpper.includes('LIGHT') || codeUpper.includes('LIGERA')) {
      return weatherMap['LIGHT_THUNDERSTORM'];
    }
    return weatherMap['THUNDERSTORM'];
  }
  if (codeUpper.includes('CLOUD') || codeUpper.includes('NUBLADO')) {
    if (codeUpper.includes('PARTLY') || codeUpper.includes('PARCIAL')) {
      return weatherMap['PARTLY_CLOUDY'];
    }
    if (codeUpper.includes('MOSTLY') || codeUpper.includes('MAYORMENTE')) {
      return weatherMap['MOSTLY_CLOUDY'];
    }
    if (codeUpper.includes('OVERCAST') || codeUpper.includes('MUY')) {
      return weatherMap['OVERCAST'];
    }
    return weatherMap['CLOUDY'];
  }
  if (codeUpper.includes('CLEAR') || codeUpper.includes('DESPEJADO') || codeUpper.includes('SUNNY') || codeUpper.includes('SOLEADO')) {
    if (codeUpper.includes('MOSTLY') || codeUpper.includes('MAYORMENTE')) {
      return weatherMap['MOSTLY_CLEAR'];
    }
    return weatherMap['CLEAR'];
  }
  if (codeUpper.includes('FOG') || codeUpper.includes('NIEBLA')) {
    return weatherMap['FOG'];
  }

  // Si no se encuentra ninguna coincidencia, usar un fallback más descriptivo
  console.warn(`[Weather API] Código de clima no reconocido: "${weatherCode}" (normalizado: "${normalizedCode}")`);
  return { condition: 'Despejado', description: 'Condición del tiempo', icon: '01d' };
}

// Transformar respuesta de clima actual de Google
function transformGoogleCurrentWeather(data: any): CurrentWeather {
  console.log('Google Weather API Response:', JSON.stringify(data, null, 2));

  // Extraer datos según la estructura real de Google Weather API
  // Intentar múltiples rutas posibles para el código del clima
  const weatherCode = 
    data.weatherCondition?.type || 
    data.condition?.type ||
    data.weatherCode ||
    data.condition ||
    'CLEAR';
  
  console.log('[Weather API] Código de clima extraído:', weatherCode);
  const weatherInfo = getWeatherDescription(weatherCode);
  console.log('[Weather API] Información del clima:', weatherInfo);

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

  // Ajustar icono basado en si es de día o de noche
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
function transformGoogleForecast(data: any): WeatherForecast[] {
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
    const weatherInfo = getWeatherDescription(weatherCode);

    // Temperaturas máximas y mínimas (diferentes nombres según API)
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

    return {
      date: typeof dateRaw === 'object' && dateRaw?.year
        ? formatDate(`${dateRaw.year}-${String(dateRaw.month).padStart(2,'0')}-${String(dateRaw.day).padStart(2,'0')}`)
        : formatDate(String(dateRaw)),
      maxTemp: Math.round(Number(maxTempRaw)),
      minTemp: Math.round(Number(minTempRaw)),
      condition: weatherInfo.condition,
      description: weatherInfo.description,
      precipitation: Math.round(Number(precipitationRaw)),
      icon: weatherInfo.icon,
      humidity: Math.round(Number(humidityRaw)),
      windSpeed: Math.round(Number(windSpeedRaw)),
    };
  });
}

// Obtener clima actual usando Google Weather API
export async function getCurrentWeather(lat: number, lon: number): Promise<CurrentWeather> {
  if (!API_KEY) {
    throw new Error('API key de Google Weather no configurada');
  }

  try {
    const response = await fetch(
      `${GOOGLE_WEATHER_BASE_URL}/currentConditions:lookup?key=${API_KEY}&location.latitude=${lat}&location.longitude=${lon}`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error de Google Weather API: ${errorData.error?.message || response.statusText}`);
    }

    const data: GoogleWeatherCurrentResponse = await response.json();
    return transformGoogleCurrentWeather(data);
  } catch (error) {
    console.error('Error fetching current weather from Google:', error);
    throw error;
  }
}

// Obtener pronóstico de 5 días usando Google Weather API
export async function getWeatherForecast(lat: number, lon: number): Promise<WeatherForecast[]> {
  if (!API_KEY) {
    throw new Error('API key de Google Weather no configurada');
  }

  try {
    const response = await fetch(
      `${GOOGLE_WEATHER_BASE_URL}/forecast/days:lookup?key=${API_KEY}&location.latitude=${lat}&location.longitude=${lon}&days=5`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error de Google Weather API: ${errorData.error?.message || response.statusText}`);
    }

    const data: GoogleWeatherForecastResponse = await response.json();
    return transformGoogleForecast(data);
  } catch (error) {
    console.error('Error fetching weather forecast from Google:', error);
    throw error;
  }
}

// Obtener datos completos de clima (actual + pronóstico)
export async function getWeatherData(lat: number, lon: number): Promise<WeatherData> {
  try {
    const [current, forecast] = await Promise.all([
      getCurrentWeather(lat, lon),
      getWeatherForecast(lat, lon)
    ]);

    // Obtener el nombre de la ciudad usando Google Geocoding API
    const cityName = await getCityName(lat, lon);

    return {
      current,
      forecast,
      location: {
        name: cityName,
        country: 'ES', // Por defecto España
        lat,
        lon
      }
    };
  } catch (error) {
    console.error('Error fetching weather data from Google:', error);
    throw error;
  }
}

// Función para obtener el nombre de la ciudad usando Google Geocoding API
async function getCityName(lat: number, lon: number): Promise<string> {
  if (!API_KEY) {
    return 'Ubicación de la propiedad';
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${API_KEY}&language=es`
    );

    if (!response.ok) {
      console.warn('No se pudo obtener el nombre de la ciudad');
      return 'Ubicación de la propiedad';
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

    return 'Ubicación de la propiedad';
  } catch (error) {
    console.warn('Error obteniendo nombre de ciudad:', error);
    return 'Ubicación de la propiedad';
  }
}

// Función de utilidad para verificar si las coordenadas son válidas
export function isValidCoordinates(lat: number | null, lon: number | null): boolean {
  if (lat === null || lon === null) return false;
  return lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
}
