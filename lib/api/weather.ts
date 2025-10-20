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
  const weatherMap: { [key: string]: { condition: string; description: string; icon: string } } = {
    'CLEAR': { condition: 'Despejado', description: 'Cielo despejado', icon: '01d' },
    'PARTLY_CLOUDY': { condition: 'Parcialmente nublado', description: 'Parcialmente nublado', icon: '02d' },
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

  return weatherMap[weatherCode] || { condition: 'Desconocido', description: 'Condición desconocida', icon: '01d' };
}

// Transformar respuesta de clima actual de Google
function transformGoogleCurrentWeather(data: GoogleWeatherCurrentResponse): CurrentWeather {
  const weatherInfo = getWeatherDescription(data.weatherCode);
  
  return {
    temperature: Math.round(data.temperature.value),
    feelsLike: Math.round(data.apparentTemperature.value),
    condition: weatherInfo.condition,
    description: weatherInfo.description,
    humidity: Math.round(data.humidity.value),
    pressure: Math.round(data.pressure.value),
    windSpeed: Math.round(data.windSpeed.value),
    windDirection: getWindDirection(data.windDirection.value),
    uvIndex: Math.round(data.uvIndex.value),
    sunrise: formatTime(data.sunrise),
    sunset: formatTime(data.sunset),
    icon: weatherInfo.icon,
    timestamp: new Date(data.updateTime).getTime() / 1000
  };
}

// Transformar respuesta de pronóstico de Google
function transformGoogleForecast(data: GoogleWeatherForecastResponse): WeatherForecast[] {
  return data.dailyForecasts.slice(0, 5).map((day) => {
    const weatherInfo = getWeatherDescription(day.weatherCode);
    
    return {
      date: formatDate(day.date),
      maxTemp: Math.round(day.maxTemperature.value),
      minTemp: Math.round(day.minTemperature.value),
      condition: weatherInfo.condition,
      description: weatherInfo.description,
      precipitation: Math.round(day.precipitationProbability.value),
      icon: weatherInfo.icon,
      humidity: Math.round(day.humidity.value),
      windSpeed: Math.round(day.windSpeed.value)
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
      `${GOOGLE_WEATHER_BASE_URL}/currentConditions:lookup?key=${API_KEY}&location.latitude=${lat}&location.longitude=${lon}&units=METRIC&language=es`
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
      `${GOOGLE_WEATHER_BASE_URL}/forecast/days:lookup?key=${API_KEY}&location.latitude=${lat}&location.longitude=${lon}&units=METRIC&language=es&days=5`
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
