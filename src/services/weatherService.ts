/**
 * weatherService.ts — React Query hooks for the TempVeritas dashboard.
 *
 * Provides:
 *  - useWeather()       — full weather data with 60 s auto-refresh
 *  - useCityWeather()   — single-city weather (derived from the main query)
 *  - useWeatherStatus() — just the source-availability status
 */

import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { WeatherData, CityWeather } from '../types/weather';
import { fetchWeatherData } from './weatherApi';

// ---------------------------------------------------------------------------
// Key constants
// ---------------------------------------------------------------------------
const WEATHER_QUERY_KEY = ['weather'] as const;
const REFRESH_INTERVAL = 60_000;  // 60 s
const STALE_TIME = 30_000;        // 30 s — don't show stale data if fresh is near
const RETRY_COUNT = 2;
const RETRY_DELAY_MS = 2_000;
const SIMULATED_NETWORK_BASE = 600;   // ms — minimum simulated latency
const SIMULATED_NETWORK_JITTER = 400; // ms — extra random latency

// ---------------------------------------------------------------------------
// Simulated network delay (replaces real HTTP round-trip)
// ---------------------------------------------------------------------------
const simulatedLatency = (): Promise<void> =>
  new Promise((r) => setTimeout(r, SIMULATED_NETWORK_BASE + Math.random() * SIMULATED_NETWORK_JITTER));

// ---------------------------------------------------------------------------
// Data-fetching function (passed to React Query)
// ---------------------------------------------------------------------------
const fetchData = async (): Promise<WeatherData> => {
  // Simulate real API latency
  await simulatedLatency();
  return fetchWeatherData();
};

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/**
 * Subscribe to the full weather data set.
 * Auto-refreshes every 60 seconds unless the browser tab is backgrounded.
 */
export const useWeather = (): UseQueryResult<WeatherData, Error> =>
  useQuery({
    queryKey: WEATHER_QUERY_KEY,
    queryFn: fetchData,
    refetchInterval: REFRESH_INTERVAL,
    retry: RETRY_COUNT,
    retryDelay: RETRY_DELAY_MS,
    staleTime: STALE_TIME,
    // Keep showing the previous successful data while a refresh runs so the
    // dashboard never flashes empty.
    refetchOnWindowFocus: false,
  });

/**
 * Returns a single city's weather, or `undefined` while data is loading.
 *
 * Use this for detail views — it avoids an extra API call by deriving from
 * the already-cached `useWeather` result.
 */
export const useCityWeather = (cityName: string): CityWeather | undefined => {
  const { data } = useWeather();
  return data?.cities.find((c: CityWeather) => c.city === cityName);
};

/**
 * Lightweight hook that returns only the source availability status.
 * Useful for header badges that don't need full city data.
 */
export const useWeatherStatus = (): {
  wcOnline: boolean;
  ecmwfOnline: boolean;
  isPending: boolean;
} => {
  const { data, isPending } = useWeather();
  return {
    wcOnline: data?.status.wcOnline ?? true,
    ecmwfOnline: data?.status.ecmwfOnline ?? true,
    isPending,
  };
};