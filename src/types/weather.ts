export interface CityWeather {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  utcTime: string;        // HH:mm:ss
  gmtTime: string;        // HH:mm:ss
  wcTemperature: number;  // °C
  ecmwfTemperature: number; // °C
  variance: number;       // WC - ECMWF
  trend: "up" | "down" | "stable";
  lastUpdated: string;    // ISO timestamp
}

export interface CityWeatherError {
  city: string;
  wcError?: string;
  ecmwfError?: string;
  usingBackup: boolean;
  ecmwfUnavailable: boolean;
}

export interface WeatherData {
  cities: CityWeather[];
  errors: CityWeatherError[];
  status: {
    wcOnline: boolean;
    ecmwfOnline: boolean;
    lastUpdated: string;
  };
}
