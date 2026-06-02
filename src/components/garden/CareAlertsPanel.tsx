"use client";

import { useMemo } from "react";

import { generateCareAlerts } from "@/lib/care/alerts";
import { generateCompatibilityAlerts } from "@/lib/care/compatibility-alerts";
import type { WeatherForecast } from "@/lib/weather/open-meteo";
import type { GardenZone, PlacedItem } from "@/types/garden";
import type { SavedRegion } from "@/types/region";

type CareAlertsPanelProps = {
  items: PlacedItem[];
  zones: GardenZone[];
  region: SavedRegion | null;
  weather: WeatherForecast | null;
  weatherLoading: boolean;
};

function AlertList({
  alerts,
  compatHighlight = false,
}: {
  alerts: ReturnType<typeof generateCareAlerts>;
  compatHighlight?: boolean;
}) {
  return (
    <ul className="flex flex-col gap-2">
      {alerts.map((alert) => {
        const isCompat = alert.id.startsWith("compat-");
        return (
          <li
            key={alert.id}
            className={`flex gap-2 rounded-lg border px-3 py-2 text-sm leading-snug ${
              isCompat && compatHighlight
                ? "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950"
                : "border-border bg-card"
            }`}
          >
            <span className="shrink-0 text-base" aria-hidden>
              {alert.emoji}
            </span>
            <span>{alert.message}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function CareAlertsPanel({
  items,
  zones,
  region,
  weather,
  weatherLoading,
}: CareAlertsPanelProps) {
  const compatAlerts = useMemo(
    () => generateCompatibilityAlerts(items, zones),
    [items, zones],
  );

  const weatherAlerts = useMemo(
    () => generateCareAlerts(items, weather),
    [items, weather],
  );

  const alerts = useMemo(
    () => [...compatAlerts, ...weatherAlerts],
    [compatAlerts, weatherAlerts],
  );

  const placedPlantCount = items.filter(
    (item) => item.kind === "plant" && item.plantId,
  ).length;

  if (placedPlantCount === 0) {
    return (
      <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
        Place plants on your garden to receive personalised alerts.
      </p>
    );
  }

  if (compatAlerts.length > 0 && !region) {
    return (
      <div className="flex flex-col gap-2">
        <AlertList alerts={compatAlerts} compatHighlight />
        <p className="text-xs text-muted-foreground">
          Set your region for weather-based care alerts.
        </p>
      </div>
    );
  }

  if (!region) {
    return (
      <p className="rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
        Set your region to get weather-based care alerts.
      </p>
    );
  }

  if (weatherLoading && !weather && compatAlerts.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">Loading care alerts…</p>
    );
  }

  if (alerts.length === 0) {
    return (
      <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
        No urgent alerts — conditions look good for your plants.
      </p>
    );
  }

  return <AlertList alerts={alerts} compatHighlight />;
}
