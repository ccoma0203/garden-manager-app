"use client";

import { Button } from "@/components/ui/button";
import type { WeatherForecast } from "@/lib/weather/open-meteo";
import type { SavedRegion } from "@/types/region";

type WeatherWidgetProps = {
  region: SavedRegion | null;
  weather: WeatherForecast | null;
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void;
};

function formatDayLabel(dateIso: string, index: number): string {
  if (index === 0) return "Today";
  if (index === 1) return "Tomorrow";
  const date = new Date(dateIso);
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

export function WeatherWidget({
  region,
  weather,
  isLoading,
  error,
  onRefresh,
}: WeatherWidgetProps) {
  if (!region) {
    return (
      <p className="rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
        Select a region to see local weather.
      </p>
    );
  }

  if (isLoading && !weather) {
    return (
      <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
        Loading weather for {region.name}…
      </p>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs dark:border-amber-900 dark:bg-amber-950">
        <p className="text-amber-900 dark:text-amber-200">{error}</p>
        <Button
          type="button"
          variant="outline"
          size="xs"
          className="mt-2"
          onClick={onRefresh}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (!weather) return null;

  const forecastDays = weather.days.slice(0, 3);

  return (
    <div className="rounded-lg border border-border bg-card p-3 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium">{weather.locationLabel}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Open-Meteo</p>
        </div>
        <Button type="button" variant="ghost" size="xs" onClick={onRefresh}>
          Refresh
        </Button>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-semibold tabular-nums">
          {Math.round(weather.currentTempC)}°C
        </span>
        <span className="text-xs text-muted-foreground">
          now · {weather.currentPrecipitationMm.toFixed(1)} mm rain ·{" "}
          {Math.round(weather.currentWindKmh)} km/h wind
        </span>
      </div>

      <ul className="mt-3 grid grid-cols-3 gap-2">
        {forecastDays.map((day, index) => (
          <li
            key={day.date}
            className="rounded-md bg-muted/50 px-2 py-1.5 text-center text-xs"
          >
            <p className="font-medium">{formatDayLabel(day.date, index)}</p>
            <p className="mt-0.5 tabular-nums">
              {Math.round(day.tempMaxC)}° / {Math.round(day.tempMinC)}°
            </p>
            <p className="mt-0.5 text-muted-foreground">
              {day.precipitationMm.toFixed(0)} mm
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
