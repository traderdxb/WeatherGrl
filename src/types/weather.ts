export interface CityWeather {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  utcTime: string;           // HH:mm:ss
  gmtTime: string;           // HH:mm:ss
  currentTemperature: number; // °C — primary current temp
  ecmwfTemperature: number;   // °C — ECMWF model reference
  highTemperature: number;    // °C — today's forecast high
  lowTemperature: number;     // °C — today's forecast low
  variance: number;           // current - ECMWF
  trend: "up" | "down" | "stable";
  resolutionSource: string;   // e.g. "KMA", "CMA", "NWS", "HKO"
  lastUpdated: string;        // ISO timestamp
}

export interface CityWeatherError {
  city: string;
  primaryError?: string;
  ecmwfError?: string;
  usingBackup: boolean;
  ecmwfUnavailable: boolean;
}

export interface WeatherData {
  cities: CityWeather[];
  errors: CityWeatherError[];
  status: {
    primaryOnline: boolean;
    ecmwfOnline: boolean;
    lastUpdated: string;
  };
}