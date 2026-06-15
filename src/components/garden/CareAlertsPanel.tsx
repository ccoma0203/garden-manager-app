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
  indoorMode?: boolean;
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

function IndoorCareAlerts({ items }: { items: PlacedItem[] }) {
  const placedPlantCount = items.filter(
    (item) => item.kind === "plant" && item.plantId,
  ).length;

  if (placedPlantCount === 0) {
    return (
      <p className="rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
        식물을 선반에 배치하면 맞춤 케어 알림을 받을 수 있어요.
      </p>
    );
  }

  // 실내 기본 알림
  const indoorAlerts = [
    {
      id: "indoor-light",
      emoji: "☀️",
      message: "실내 식물은 창가 밝은 빛이 필요해요. 주기적으로 화분 위치를 바꿔주세요.",
    },
    {
      id: "indoor-water",
      emoji: "💧",
      message: "실내 식물은 과습에 주의하세요. 흙이 마르면 물을 주세요.",
    },
    {
      id: "indoor-humidity",
      emoji: "🌫️",
      message: "실내 습도를 40~60%로 유지하면 식물이 건강하게 자라요.",
    },
    {
      id: "indoor-temp",
      emoji: "🌡️",
      message: "실내 온도는 18~25°C가 적합해요. 에어컨·난방 바람이 직접 닿지 않게 해주세요.",
    },
  ];

  return (
    <ul className="flex flex-col gap-2">
      {indoorAlerts.map((alert) => (
        <li
          key={alert.id}
          className="flex gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm leading-snug"
        >
          <span className="shrink-0 text-base" aria-hidden>{alert.emoji}</span>
          <span>{alert.message}</span>
        </li>
      ))}
    </ul>
  );
}

export function CareAlertsPanel({
  items,
  zones,
  region,
  weather,
  weatherLoading,
  indoorMode = false,
}: CareAlertsPanelProps) {

  // 실내 모드는 별도 알림
  if (indoorMode) {
    return <IndoorCareAlerts items={items} />;
  }

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
