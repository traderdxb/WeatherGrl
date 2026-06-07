/**
 * weatherApi.ts — Fetches real current/high/low temperatures from Open-Meteo.
 *
 * Open-Meteo is free (CC BY 4.0), no API key required, CORS-friendly.
 * Primary data: best_match model (blend of national weather services).
 * ECMWF reference: IFS model for cross-validation.
 *
 * Resolution Sources per city (as specified):
 *   1. Seoul       — Korea Meteorological Administration (KMA)
 *   2. Shenzhen    — China Meteorological Administration (CMA)
 *   3. Hong Kong   — Hong Kong Observatory (HKO)
 *   4. NYC         — National Weather Service Central Park (KNYC)
 *   5. London      — UK Met Office
 *   6. Taipei      — Taiwan Central Weather Administration (CWA)
 *   7. Guangzhou   — China Meteorological Administration (CMA)
 *   8. Shanghai    — Shanghai Meteorological Bureau / CMA
 *   9. Tokyo       — Japan Meteorological Agency (JMA)
 *  10. Paris       — Météo-France
 *  11. Chengdu     — China Meteorological Administration (CMA)
 *  12. Chongqing   — China Meteorological Administration (CMA)
 *  13. Singapore   — Meteorological Service Singapore (MSS)
 *  14. Beijing     — China Meteorological Administration (CMA)
 */

import type { CityWeather, CityWeatherError, WeatherData } from '../types/weather';

// ---------------------------------------------------------------------------
// City Configuration
// ---------------------------------------------------------------------------

interface CityConfig {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  resolutionSource: string;
}

const CITY_CONFIGS: CityConfig[] = [
  { city: 'Seoul',      country: 'South Korea',   latitude: 37.5665,  longitude: 126.9780, timezone: 'Asia/Seoul',      resolutionSource: 'KMA' },
  { city: 'Shenzhen',   country: 'China',          latitude: 22.5431,  longitude: 114.0579, timezone: 'Asia/Shanghai',   resolutionSource: 'CMA' },
  { city: 'Hong Kong',  country: 'China',          latitude: 22.3193,  longitude: 114.1694, timezone: 'Asia/Hong_Kong',  resolutionSource: 'HKO' },
  { city: 'NYC',        country: 'USA',            latitude: 40.7829,  longitude: -73.9654, timezone: 'America/New_York', resolutionSource: 'NWS Central Park' },
  { city: 'London',     country: 'United Kingdom', latitude: 51.5074,  longitude: -0.1278, timezone: 'Europe/London',   resolutionSource: 'UK Met Office' },
  { city: 'Taipei',     country: 'Taiwan',         latitude: 25.0330,  longitude: 121.5654, timezone: 'Asia/Taipei',     resolutionSource: 'CWA' },
  { city: 'Guangzhou',  country: 'China',          latitude: 23.1291,  longitude: 113.2644, timezone: 'Asia/Shanghai',   resolutionSource: 'CMA' },
  { city: 'Shanghai',   country: 'China',          latitude: 31.2304,  longitude: 121.4737, timezone: 'Asia/Shanghai',   resolutionSource: 'Shanghai Met Bureau / CMA' },
  { city: 'Tokyo',      country: 'Japan',          latitude: 35.6762,  longitude: 139.6503, timezone: 'Asia/Tokyo',      resolutionSource: 'JMA' },
  { city: 'Paris',      country: 'France',         latitude: 48.8566,  longitude: 2.3522,   timezone: 'Europe/Paris',     resolutionSource: 'Météo-France' },
  { city: 'Chengdu',    country: 'China',          latitude: 30.5728,  longitude: 104.0668, timezone: 'Asia/Shanghai',   resolutionSource: 'CMA' },
  { city: 'Chongqing',  country: 'China',          latitude: 29.4316,  longitude: 106.9123, timezone: 'Asia/Shanghai',   resolutionSource: 'CMA' },
  { city: 'Singapore',  country: 'Singapore',      latitude: 1.3521,   longitude: 103.8198, timezone: 'Asia/Singapore',  resolutionSource: 'MSS' },
  { city: 'Beijing',    country: 'China',          latitude: 39.9042,  longitude: 116.4074, timezone: 'Asia/Shanghai',   resolutionSource: 'CMA' },
];

// ---------------------------------------------------------------------------
// Open-Meteo API helpers
// ---------------------------------------------------------------------------

const OPEN_METEO_BASE = 'https://api.open-meteo.com/v1/forecast';

interface OpenMeteoResponse {
  current?: { temperature_2m?: number; time?: string };
  daily?: {
    temperature_2m_max?: number[];
    temperature_2m_min?: number[];
    time?: string[];
  };
}

/**
 * Fetch current temp + daily high/low for a single city from Open-Meteo.
 * Uses the "best_match" model (blend of national services).
 */
const fetchPrimary = async (cfg: CityConfig): Promise<OpenMeteoResponse> => {
  const params = new URLSearchParams({
    latitude: cfg.latitude.toString(),
    longitude: cfg.longitude.toString(),
    current: 'temperature_2m',
    daily: 'temperature_2m_max,temperature_2m_min',
    timezone: 'auto',
    models: 'best_match',
  });
  const res = await fetch(`${OPEN_METEO_BASE}?${params}`, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`Open-Meteo primary HTTP ${res.status}`);
  return res.json();
};

/**
 * Fetch ECMWF-model temperature for cross-validation.
 * Uses the ECMWF IFS model.
 */
const fetchEcmwf = async (cfg: CityConfig): Promise<number | null> => {
  try {
    const params = new URLSearchParams({
      latitude: cfg.latitude.toString(),
      longitude: cfg.longitude.toString(),
      current: 'temperature_2m',
      timezone: 'auto',
      models: 'ecmwf_ifs',
    });
    const res = await fetch(`${OPEN_METEO_BASE}?${params}`, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const data: OpenMeteoResponse = await res.json();
    return data.current?.temperature_2m ?? null;
  } catch {
    return null;
  }
};

// ---------------------------------------------------------------------------
// Previous-temperature tracking (for trend detection)
// ---------------------------------------------------------------------------
const previousTemps = new Map<string, number>();

const determineTrend = (city: string, current: number): 'up' | 'down' | 'stable' => {
  const prev = previousTemps.get(city);
  if (prev === undefined) return 'stable';
  const diff = current - prev;
  if (Math.abs(diff) < 0.3) return 'stable';
  return diff > 0 ? 'up' : 'down';
};

// ---------------------------------------------------------------------------
// Time helpers
// ---------------------------------------------------------------------------
const formatTime = (date: Date, tz?: string): string =>
  date.toLocaleTimeString('en-GB', { timeZone: tz, hour12: false });

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const fetchWeatherData = async (): Promise<WeatherData> => {
  const now = new Date();
  const utcTime = formatTime(now, 'UTC');
  const isoNow = now.toISOString();

  const cities: CityWeather[] = [];
  const errors: CityWeatherError[] = [];
  let primaryOnline = true;
  let ecmwfOnline = true;

  for (const cfg of CITY_CONFIGS) {
    let currentTemp: number | null = null;
    let highTemp: number | null = null;
    let lowTemp: number | null = null;
    let ecmwfTemp: number | null = null;
    let primaryError: string | undefined;
    let ecmwfErr: string | undefined;

    // Fetch primary (best_match)
    try {
      const primaryData = await fetchPrimary(cfg);
      currentTemp = primaryData.current?.temperature_2m ?? null;
      highTemp = primaryData.daily?.temperature_2m_max?.[0] ?? null;
      lowTemp = primaryData.daily?.temperature_2m_min?.[0] ?? null;
      if (currentTemp === null) {
        primaryError = 'No data from primary source';
        primaryOnline = false;
      }
    } catch (err) {
      primaryError = err instanceof Error ? err.message : 'Unknown error';
      primaryOnline = false;
    }

    // Fetch ECMWF cross-reference
    try {
      ecmwfTemp = await fetchEcmwf(cfg);
      if (ecmwfTemp === null) {
        ecmwfErr = 'ECMWF unavailable';
        ecmwfOnline = false;
      }
    } catch {
      ecmwfErr = 'ECMWF unavailable';
      ecmwfOnline = false;
    }

    // Fallback: if primary failed but ECMWF succeeded, use ECMWF as current
    const displayTemp = currentTemp ?? ecmwfTemp ?? NaN;
    const effectiveEcmwf = ecmwfTemp ?? displayTemp;
    const variance = parseFloat((displayTemp - effectiveEcmwf).toFixed(1));
    const trend = determineTrend(cfg.city, displayTemp);
    previousTemps.set(cfg.city, displayTemp);

    cities.push({
      city: cfg.city,
      country: cfg.country,
      latitude: cfg.latitude,
      longitude: cfg.longitude,
      utcTime,
      gmtTime: formatTime(now, cfg.timezone),
      currentTemperature: Number.isFinite(displayTemp) ? displayTemp : NaN,
      ecmwfTemperature: Number.isFinite(effectiveEcmwf) ? effectiveEcmwf : NaN,
      highTemperature: Number.isFinite(highTemp ?? NaN) ? highTemp! : NaN,
      lowTemperature: Number.isFinite(lowTemp ?? NaN) ? lowTemp! : NaN,
      variance,
      trend,
      resolutionSource: cfg.resolutionSource,
      lastUpdated: isoNow,
    });

    if (primaryError || ecmwfErr) {
      errors.push({
        city: cfg.city,
        primaryError,
        ecmwfError: ecmwfErr,
        usingBackup: !!primaryError,
        ecmwfUnavailable: !!ecmwfErr,
      });
    }
  }

  return {
    cities,
    errors,
    status: {
      primaryOnline,
      ecmwfOnline,
      lastUpdated: isoNow,
    },
  };
};
