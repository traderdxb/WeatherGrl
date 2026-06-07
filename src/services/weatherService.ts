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

const WEATHER_QUERY_KEY = ['weather'] as const;
const REFRESH_INTERVAL = 60_000;
const STALE_TIME = 30_000;
const RETRY_COUNT = 2;
const RETRY_DELAY_MS = 2_000;

export const useWeather = (): UseQueryResult<WeatherData, Error> =>
  useQuery({
    queryKey: WEATHER_QUERY_KEY,
    queryFn: fetchWeatherData,
    refetchInterval: REFRESH_INTERVAL,
    retry: RETRY_COUNT,
    retryDelay: RETRY_DELAY_MS,
    staleTime: STALE_TIME,
    refetchOnWindowFocus: true,
  });

export const useCityWeather = (cityName: string): CityWeather | undefined => {
  const { data } = useWeather();
  return data?.cities.find((c) => c.city === cityName);
};

export const useWeatherStatus = (): {
  primaryOnline: boolean;
  ecmwfOnline: boolean;
  isPending: boolean;
} => {
  const { data, isPending } = useWeather();
  return {
    primaryOnline: data?.status.primaryOnline ?? true,
    ecmwfOnline: data?.status.ecmwfOnline ?? true,
    isPending,
  };
};
