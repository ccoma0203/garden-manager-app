"use client";

import { useMemo } from "react";

import { generateCareAlerts } from "@/lib/care/alerts";
import type { WeatherForecast } from "@/lib/weather/open-meteo";
import type { PlacedItem } from "@/types/garden";
import type { SavedRegion } from "@/types/region";

type CareAlertsPanelProps = {
  items: PlacedItem[];
  region: SavedRegion | null;
  weather: WeatherForecast | null;
  weatherLoading: boolean;
};

export function CareAlertsPanel({
  items,
  region,
  weather,
  weatherLoading,
}: CareAlertsPanelProps) {
  const alerts = useMemo(
    () => generateCareAlerts(items, weather),
    [items, weather],
  );

  const placedPlantCount = items.filter(
    (item) => item.kind === "plant" && item.plantId,
  ).length;

  if (!region) {
    return (
      <p className="rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
        Set your region to get weather-based care alerts.
      </p>
    );
  }

  if (weatherLoading && !weather) {
    return (
      <p className="text-xs text-muted-foreground">Loading care alerts…</p>
    );
  }

  if (placedPlantCount === 0) {
    return (
      <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
        Place plants on your garden to receive personalised alerts.
      </p>
    );
  }

  if (alerts.length === 0) {
    return (
      <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
        No urgent alerts — conditions look good for your plants.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {alerts.map((alert) => (
        <li
          key={alert.id}
          className="flex gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm leading-snug"
        >
          <span className="shrink-0 text-base" aria-hidden>
            {alert.emoji}
          </span>
          <span>{alert.message}</span>
        </li>
      ))}
    </ul>
  );
}
