/**
 * weatherApi.ts — Simulated Weather Company (WC) and ECMWF API integration.
 *
 * Generates realistic city-level temperature data that varies per refresh cycle.
 * Includes occasional source-failure simulation for testing fallback logic.
 */

// ---------------------------------------------------------------------------
// City Configuration
// ---------------------------------------------------------------------------
// Base temperatures reflect typical spring-time values; each refresh adds
// random noise so the dashboard feels alive.
interface CityConfig {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  /** High temperature for the day (°C) */
  highTemp: number;
  /** Low temperature for the day (°C) */
  lowTemp: number;
  /** Typical WC → ECMWF offset (can be negative). Small by design. */
  ecmwfOffset: number;
}

const CITY_CONFIGS: CityConfig[] = [
  // European cities (June summer)
  { city: 'Munich',         country: 'Germany',         latitude: 48.1351,  longitude: 11.5820,  timezone: 'Europe/Berlin',       highTemp: 26, lowTemp: 16, ecmwfOffset:  0.3 },
  { city: 'London',         country: 'United Kingdom',  latitude: 51.5074,  longitude: -0.1278, timezone: 'Europe/London',       highTemp: 23, lowTemp: 15, ecmwfOffset: -0.9 },
  { city: 'Paris',          country: 'France',          latitude: 48.8566,  longitude: 2.3522,  timezone: 'Europe/Paris',        highTemp: 27, lowTemp: 17, ecmwfOffset: -2.3 },
  // US East Coast (June summer)
  { city: 'New York City',  country: 'USA',             latitude: 40.7128,  longitude: -74.0060,timezone: 'America/New_York',    highTemp: 29, lowTemp: 20, ecmwfOffset:  1.3 },
  { city: 'Washington DC',  country: 'USA',             latitude: 38.9072,  longitude: -77.0369,timezone: 'America/New_York',    highTemp: 31, lowTemp: 21, ecmwfOffset:  0.8 },
  // Asian cities (monsoon/summer)
  { city: 'Hong Kong',      country: 'China',           latitude: 22.3193,  longitude: 114.1694, timezone: 'Asia/Hong_Kong',     highTemp: 32, lowTemp: 27, ecmwfOffset: -0.7 },
  { city: 'Taipei',         country: 'Taiwan',          latitude: 25.0330,  longitude: 121.5654, timezone: 'Asia/Taipei',        highTemp: 33, lowTemp: 26, ecmwfOffset:  0.3 },
  { city: 'Shanghai',       country: 'China',           latitude: 31.2304,  longitude: 121.4737, timezone: 'Asia/Shanghai',      highTemp: 30, lowTemp: 23, ecmwfOffset: -0.4 },
  { city: 'Shenzhen',       country: 'China',           latitude: 22.5431,  longitude: 114.0579, timezone: 'Asia/Shanghai',      highTemp: 32, lowTemp: 27, ecmwfOffset:  0.5 },
];

// ---------------------------------------------------------------------------
// Types — imported from the canonical location
// ---------------------------------------------------------------------------

import type { CityWeather, CityWeatherError, WeatherData } from '../types/weather';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Calculate the diurnal temperature at a given hour in a 24-hour cycle.
 * Peaks at 14:00 (2 PM), lowest at 02:00 (2 AM), using a cosine curve.
 */
const diurnalTemp = (hour: number, high: number, low: number): number => {
  const mean = (high + low) / 2;
  const amp = (high - low) / 2;
  // Peak at hour 14 (2 PM), trough at hour 2 (2 AM)
  return mean + amp * Math.cos(((hour - 14) * 2 * Math.PI) / 24);
};

/** Parse the hour from a formatted time string like "14:32:05" */
const getHourFromTime = (timeStr: string): number => {
  const parts = timeStr.split(':');
  return parseInt(parts[0], 10);
};

/** Return a random offset in the range [-range, +range). */
const randomOffset = (range: number): number => (Math.random() * 2 - 1) * range;

/** Format a date object to HH:mm:ss (24-hour). */
const formatTime = (date: Date, tz?: string): string =>
  date.toLocaleTimeString('en-GB', { timeZone: tz, hour12: false });

/** Determine whether a source should be simulated as "offline" for this cycle. */
const shouldFail = (probability: number): boolean => Math.random() < probability;

/** Per-city failure probabilities (near-zero for clean production use). */
const WC_FAIL_PROB = 0.001;     // 0.1 % — almost never
const ECMWF_FAIL_PROB = 0.001;  // 0.1 % — almost never

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
// Public API
// ---------------------------------------------------------------------------

/**
 * Simulate fetching weather data from both sources.
 * Respects per-city failure probabilities so the dashboard's fallback and
 * error-badge UIs can be verified.
 */
export const fetchWeatherData = (): WeatherData => {
  const now = new Date();
  const utcTime = formatTime(now, 'UTC');
  const isoNow = now.toISOString();

  // Per-source overall status (near-zero for clean production use)
  const wcOnline = !shouldFail(0.001);       // 0.1 % — almost never
  const ecmwfOnline = !shouldFail(0.001);     // 0.1 % — almost never

  const cities: CityWeather[] = [];
  const errors: CityWeatherError[] = [];

  for (const cfg of CITY_CONFIGS) {
    // Get local hour for diurnal temperature calculation
    const localTime = formatTime(now, cfg.timezone);
    const localHour = getHourFromTime(localTime);

    // WC temperature based on diurnal cycle + small random variation
    const baseTemp = diurnalTemp(localHour, cfg.highTemp, cfg.lowTemp);
    const wcTemp = parseFloat((baseTemp + randomOffset(0.8)).toFixed(1));

    // ECMWF temperature with model offset + variation
    const ecmwfTemp = parseFloat((baseTemp + cfg.ecmwfOffset + randomOffset(1.0)).toFixed(1));

    // Per-city failures (near-zero probability)
    const wcFails = !wcOnline || shouldFail(WC_FAIL_PROB);
    const ecmwfFails = !ecmwfOnline || shouldFail(ECMWF_FAIL_PROB);

    // Fallback: if WC is down, use ECMWF as display temperature
    const effectiveWcTemp = wcFails ? ecmwfTemp : wcTemp;

    const variance = parseFloat((effectiveWcTemp - ecmwfTemp).toFixed(1));
    const trend = determineTrend(cfg.city, effectiveWcTemp);

    // Update previous temp *after* reading it for trend (store the value used
    // for comparison so the *next* refresh can compare against it).
    previousTemps.set(cfg.city, effectiveWcTemp);

    cities.push({
      city: cfg.city,
      country: cfg.country,
      latitude: cfg.latitude,
      longitude: cfg.longitude,
      utcTime,
      gmtTime: formatTime(now, cfg.timezone),
      wcTemperature: wcFails ? NaN : wcTemp,
      ecmwfTemperature: ecmwfFails ? NaN : ecmwfTemp,
      variance,
      trend,
      lastUpdated: isoNow,
    });

    // Track per-city error info
    if (wcFails || ecmwfFails) {
      errors.push({
        city: cfg.city,
        wcError: wcFails ? 'Data delayed' : undefined,
        ecmwfError: ecmwfFails ? 'Unavailable' : undefined,
        usingBackup: wcFails,
        ecmwfUnavailable: ecmwfFails,
      });
    }
  }

  return {
    cities,
    errors,
    status: {
      wcOnline,
      ecmwfOnline,
      lastUpdated: isoNow,
    },
  };
};
