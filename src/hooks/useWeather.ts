"use client";

import { useCallback, useEffect, useState } from "react";

import { fetchWeather, type WeatherForecast } from "@/lib/weather/open-meteo";
import type { SavedRegion } from "@/types/region";

export function useWeather(region: SavedRegion | null) {
  const [weather, setWeather] = useState<WeatherForecast | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedRegion, setLastFetchedRegion] = useState<string | null>(null);

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
      setLastFetchedRegion(region.name);
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
    // region이 있고, 아직 날씨를 안 불러왔거나 다른 지역으로 바뀌었을 때만 불러오기
    if (region && region.name !== lastFetchedRegion) {
      refresh();
    }
    if (!region) {
      setWeather(null);
      setLastFetchedRegion(null);
    }
  }, [region, refresh, lastFetchedRegion]);

  return { weather, isLoading, error, refresh };
}