"use client";

import { useCallback, useEffect, useState } from "react";

import { fetchWeather, type WeatherForecast } from "@/lib/weather/open-meteo";
import type { SavedRegion } from "@/types/region";

export function useWeather(region: SavedRegion | null) {
  const [weather, setWeather] = useState<WeatherForecast | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!region) {
      setWeather(null);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchWeather(region);
      setWeather(data);
    } catch (err) {
      setWeather(null);
      setError(
        err instanceof Error ? err.message : "Could not load weather.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [region]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { weather, isLoading, error, refresh };
}
