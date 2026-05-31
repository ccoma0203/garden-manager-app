import type { WeatherForecast } from "@/lib/weather/open-meteo";
import type { PlacedItem } from "@/types/garden";
import { getPlantById, getPlantEmoji } from "@/lib/plants/registry";
import type { Plant } from "@/types/plant";

export type CareAlertIcon = "warning" | "water" | "temp" | "wind";

export type CareAlert = {
  id: string;
  icon: CareAlertIcon;
  emoji: string;
  message: string;
  plantId?: string;
};

const RAIN_THRESHOLD_MM = 1;
const HOT_THRESHOLD_C = 28;
const STRONG_WIND_KMH = 35;

function formatPlantLabel(plant: Plant): string {
  const emoji = plant.emoji ?? getPlantEmoji(plant.id);
  return `${emoji} ${plant.name}`;
}

function uniquePlantIds(items: PlacedItem[]): string[] {
  const ids = new Set<string>();
  for (const item of items) {
    if (item.kind === "plant" && item.plantId) {
      ids.add(item.plantId);
    }
  }
  return [...ids];
}

export function generateCareAlerts(
  items: PlacedItem[],
  weather: WeatherForecast | null,
): CareAlert[] {
  if (!weather) return [];

  const plantIds = uniquePlantIds(items);
  if (plantIds.length === 0) return [];

  const alerts: CareAlert[] = [];
  const today = weather.days[0];
  const tomorrow = weather.days[1];
  const nextThreeDays = weather.days.slice(0, 3);

  const precipNext3Days = nextThreeDays.reduce(
    (sum, day) => sum + day.precipitationMm,
    0,
  );
  const maxWindNext3Days = Math.max(
    0,
    ...nextThreeDays.map((day) => day.windMaxKmh),
  );

  for (const plantId of plantIds) {
    const plant = getPlantById(plantId);
    if (!plant) continue;

    const label = formatPlantLabel(plant);

    if (
      tomorrow &&
      tomorrow.precipitationMm >= RAIN_THRESHOLD_MM &&
      plant.wateringIntervalDays <= 4
    ) {
      alerts.push({
        id: `${plantId}-rain-skip`,
        icon: "water",
        emoji: "💧",
        plantId,
        message: `Rain expected tomorrow — skip watering your ${label}`,
      });
    }

    if (today && today.tempMinC < plant.minTempC) {
      alerts.push({
        id: `${plantId}-cold-tonight`,
        icon: "temp",
        emoji: "🌡️",
        plantId,
        message: `Temperature below ${plant.minTempC}°C tonight — protect your ${label}`,
      });
    }

    const isDrySpell = precipNext3Days < RAIN_THRESHOLD_MM;
    const isHotToday = today && today.tempMaxC >= HOT_THRESHOLD_C;

    if (
      isDrySpell &&
      isHotToday &&
      plant.water !== "low" &&
      plant.wateringIntervalDays <= 4
    ) {
      alerts.push({
        id: `${plantId}-water-hot`,
        icon: "water",
        emoji: "💧",
        plantId,
        message: `No rain in 3 days and hot — water your ${label} today`,
      });
    }

    if (plant.needsSupport && maxWindNext3Days >= STRONG_WIND_KMH) {
      alerts.push({
        id: `${plantId}-wind-support`,
        icon: "wind",
        emoji: "🌬️",
        plantId,
        message: `Strong wind expected — support your ${label}`,
      });
    }

    if (
      plant.wateringIntervalDays >= 5 &&
      isDrySpell &&
      isHotToday &&
      !alerts.some((a) => a.id === `${plantId}-water-hot`)
    ) {
      alerts.push({
        id: `${plantId}-water-drought`,
        icon: "warning",
        emoji: "⚠️",
        plantId,
        message: `Dry and warm week — check moisture for your ${label}`,
      });
    }
  }

  return alerts;
}

export function getAlertIconEmoji(icon: CareAlertIcon): string {
  switch (icon) {
    case "water":
      return "💧";
    case "temp":
      return "🌡️";
    case "wind":
      return "🌬️";
    case "warning":
    default:
      return "⚠️";
  }
}
