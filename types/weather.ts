// Tipos para el sistema de clima

export interface WeatherLocation {
  name: string;
  country: string;
  lat: number;
  lon: number;
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  condition: string;
  description: string;
  humidity: number;
  pressure: number;
  windSpeed: number;
  windDirection: string;
  uvIndex: number;
  sunrise: string;
  sunset: string;
  icon: string;
  timestamp: number;
}

export interface WeatherForecast {
  date: string;
  maxTemp: number;
  minTemp: number;
  condition: string;
  description: string;
  precipitation: number;
  icon: string;
  humidity: number;
  windSpeed: number;
}

export interface WeatherData {
  current: CurrentWeather;
  forecast: WeatherForecast[];
  location: WeatherLocation;
}

export interface WeatherError {
  message: string;
}

// Tipos para la respuesta de la API de OpenWeatherMap
export interface OpenWeatherCurrentResponse {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
    pressure: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
    deg: number;
  };
  sys: {
    sunrise: number;
    sunset: number;
  };
  dt: number;
  name: string;
  country: string;
}

export interface OpenWeatherForecastResponse {
  list: Array<{
    dt: number;
    dt_txt: string;
    main: {
      temp_max: number;
      temp_min: number;
      humidity: number;
    };
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
    wind: {
      speed: number;
    };
    pop: number;
  }>;
  city: {
    name: string;
    country: string;
  };
}
