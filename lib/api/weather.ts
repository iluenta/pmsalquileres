import { 
  WeatherData, 
  CurrentWeather, 
  WeatherForecast, 
  OpenWeatherCurrentResponse, 
  OpenWeatherForecastResponse,
  WeatherError 
} from '@/types/weather';

const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const API_KEY = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY;

if (!API_KEY) {
  console.error('NEXT_PUBLIC_OPENWEATHER_API_KEY no está configurada en .env.local');
}

// Función para convertir timestamp a hora legible
function formatTime(timestamp: number): string {
  console.log('[v0] formatTime input:', timestamp, 'type:', typeof timestamp);
  
  if (!timestamp || isNaN(timestamp)) {
    console.error('[v0] Invalid timestamp for formatTime:', timestamp);
    return '--:--';
  }
  
  const date = new Date(timestamp * 1000);
  console.log('[v0] formatTime date object:', date);
  
  if (isNaN(date.getTime())) {
    console.error('[v0] Invalid date created from timestamp:', timestamp);
    return '--:--';
  }
  
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

// Función para convertir timestamp a fecha legible
function formatDate(timestamp: number): string {
  console.log('[v0] formatDate input:', timestamp, 'type:', typeof timestamp);
  
  if (!timestamp || isNaN(timestamp)) {
    console.error('[v0] Invalid timestamp for formatDate:', timestamp);
    return 'Fecha inválida';
  }
  
  const date = new Date(timestamp * 1000);
  console.log('[v0] formatDate date object:', date);
  
  if (isNaN(date.getTime())) {
    console.error('[v0] Invalid date created from timestamp:', timestamp);
    return 'Fecha inválida';
  }
  
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}

// Función para capitalizar la primera letra
function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Función para obtener dirección del viento
function getWindDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

// Transformar respuesta de clima actual
function transformCurrentWeather(data: OpenWeatherCurrentResponse): CurrentWeather {
  const weather = data.weather[0];
  
  console.log('[v0] transformCurrentWeather - weather object:', weather);
  console.log('[v0] transformCurrentWeather - weather.main:', weather.main);
  console.log('[v0] transformCurrentWeather - weather.description:', weather.description);

  return {
    temperature: Math.round(data.main.temp),
    feelsLike: Math.round(data.main.feels_like),
    condition: weather.main || 'Desconocido',
    description: capitalizeFirst(weather.description),
    humidity: data.main.humidity,
    pressure: data.main.pressure,
    windSpeed: Math.round(data.wind.speed * 3.6), // convertir m/s a km/h
    windDirection: getWindDirection(data.wind.deg),
    uvIndex: 0, // No disponible en la API gratuita
    sunrise: formatTime(data.sys.sunrise),
    sunset: formatTime(data.sys.sunset),
    icon: weather.icon,
    timestamp: data.dt
  };
}

// Transformar respuesta de pronóstico
function transformForecast(data: OpenWeatherForecastResponse): WeatherForecast[] {
  console.log('[v0] transformForecast - Raw API data:', data);
  console.log('[v0] transformForecast - First item dt:', data.list[0]?.dt, 'type:', typeof data.list[0]?.dt);
  
  // Agrupar por día y tomar el pronóstico de mediodía (12:00) para cada día
  const dailyForecasts: { [key: string]: any } = {};
  
  data.list.forEach((item, index) => {
    console.log(`[v0] Processing forecast item ${index}:`, {
      dt: item.dt,
      dt_type: typeof item.dt,
      dt_txt: item.dt_txt
    });
    
    const date = formatDate(item.dt);
    const hour = new Date(item.dt * 1000).getHours();
    
    console.log(`[v0] Item ${index} - formatted date:`, date, 'hour:', hour);
    
    // Tomar el pronóstico de mediodía (12:00) como representativo del día
    if (hour === 12 || !dailyForecasts[date]) {
      dailyForecasts[date] = item;
      console.log(`[v0] Selected item ${index} for date ${date}`);
    }
  });
  
  console.log('[v0] Daily forecasts selected:', Object.keys(dailyForecasts));
  
  return Object.values(dailyForecasts).slice(0, 5).map((item, index) => {
    console.log(`[v0] Creating forecast object ${index} with dt:`, item.dt);
    
    return {
      date: formatDate(item.dt),
      maxTemp: Math.round(item.main.temp_max),
      minTemp: Math.round(item.main.temp_min),
      condition: item.weather[0].main,
      description: capitalizeFirst(item.weather[0].description),
      precipitation: Math.round(item.pop * 100), // convertir a porcentaje
      icon: item.weather[0].icon,
      humidity: item.main.humidity,
      windSpeed: Math.round(item.wind.speed * 3.6) // convertir m/s a km/h
    };
  });
}

// Obtener clima actual
export async function getCurrentWeather(lat: number, lon: number): Promise<CurrentWeather> {
  if (!API_KEY) {
    throw new Error('API key de OpenWeatherMap no configurada');
  }

  try {
    const response = await fetch(
      `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error de API: ${errorData.message || response.statusText}`);
    }

    const data: OpenWeatherCurrentResponse = await response.json();
    return transformCurrentWeather(data);
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw error;
  }
}

// Obtener pronóstico de 5 días
export async function getWeatherForecast(lat: number, lon: number): Promise<WeatherForecast[]> {
  if (!API_KEY) {
    throw new Error('API key de OpenWeatherMap no configurada');
  }

  try {
    const response = await fetch(
      `${OPENWEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error de API: ${errorData.message || response.statusText}`);
    }

    const data: OpenWeatherForecastResponse = await response.json();
    return transformForecast(data);
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
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

    // Obtener el nombre de la ciudad de la respuesta del pronóstico
    const cityName = forecast.length > 0 ? 
      await getCityName(lat, lon) : 
      'Ubicación de la propiedad';

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
    console.error('Error fetching weather data:', error);
    throw error;
  }
}

// Función para obtener el nombre de la ciudad a partir de coordenadas
async function getCityName(lat: number, lon: number): Promise<string> {
  if (!API_KEY) {
    return 'Ubicación de la propiedad';
  }

  try {
    const response = await fetch(
      `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=es`
    );

    if (!response.ok) {
      console.warn('No se pudo obtener el nombre de la ciudad');
      return 'Ubicación de la propiedad';
    }

    const data: OpenWeatherCurrentResponse = await response.json();
    return data.name || 'Ubicación de la propiedad';
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
