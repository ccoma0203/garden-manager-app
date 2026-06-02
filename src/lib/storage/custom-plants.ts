import { setCustomPlantsRegistry } from "@/lib/plants/registry";
import type { Plant, PlantCategory, PlantId } from "@/types/plant";
import type { SunExposure, WaterNeeds } from "@/types/plant";

const STORAGE_KEY = "garden-manager:custom-plants";

const VALID_CATEGORIES: PlantCategory[] = ["vegetable", "flower", "tree"];
const VALID_SUN: SunExposure[] = ["full", "partial", "shade"];
const VALID_WATER: WaterNeeds[] = ["low", "medium", "high"];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parsePlant(value: unknown): Plant | null {
  if (!isRecord(value)) return null;
  if (typeof value.id !== "string" || !value.id.startsWith("custom-")) {
    return null;
  }
  if (typeof value.name !== "string" || !value.name.trim()) return null;
  if (
    typeof value.category !== "string" ||
    !VALID_CATEGORIES.includes(value.category as PlantCategory)
  ) {
    return null;
  }
  if (typeof value.sun !== "string" || !VALID_SUN.includes(value.sun as SunExposure)) {
    return null;
  }
  if (
    typeof value.water !== "string" ||
    !VALID_WATER.includes(value.water as WaterNeeds)
  ) {
    return null;
  }
  if (typeof value.spreadM !== "number" || !Number.isFinite(value.spreadM)) {
    return null;
  }
  if (typeof value.heightM !== "number" || !Number.isFinite(value.heightM)) {
    return null;
  }
  if (
    typeof value.wateringIntervalDays !== "number" ||
    !Number.isFinite(value.wateringIntervalDays)
  ) {
    return null;
  }
  if (typeof value.minTempC !== "number" || !Number.isFinite(value.minTempC)) {
    return null;
  }

  const plant: Plant = {
    id: value.id,
    name: value.name.trim(),
    category: value.category as PlantCategory,
    sun: value.sun as SunExposure,
    water: value.water as WaterNeeds,
    spreadM: value.spreadM,
    heightM: value.heightM,
    wateringIntervalDays: Math.max(1, Math.floor(value.wateringIntervalDays)),
    minTempC: value.minTempC,
    isCustom: true,
  };

  if (typeof value.emoji === "string" && value.emoji.trim()) {
    plant.emoji = value.emoji.trim();
  }

  if (Array.isArray(value.goodNeighbors)) {
    plant.goodNeighbors = value.goodNeighbors.filter(
      (id): id is string => typeof id === "string",
    );
  } else {
    plant.goodNeighbors = [];
  }

  if (Array.isArray(value.badNeighbors)) {
    plant.badNeighbors = value.badNeighbors.filter(
      (id): id is string => typeof id === "string",
    );
  } else {
    plant.badNeighbors = [];
  }

  if (value.growth !== undefined && isRecord(value.growth)) {
    const g = value.growth;
    if (
      isRecord(g.seedlingHeightM) &&
      isRecord(g.youngHeightM) &&
      typeof g.matureHeightM === "number" &&
      typeof g.groundSpreadM === "number"
    ) {
      plant.growth = {
        seedlingHeightM: {
          min: Number(g.seedlingHeightM.min),
          max: Number(g.seedlingHeightM.max),
        },
        youngHeightM: {
          min: Number(g.youngHeightM.min),
          max: Number(g.youngHeightM.max),
        },
        matureHeightM: g.matureHeightM,
        groundSpreadM: g.groundSpreadM,
      };
    }
  }

  if (plant.category === "tree" && !plant.growth) {
    plant.growth = {
      seedlingHeightM: { min: 0.3, max: 0.5 },
      youngHeightM: { min: 1, max: 3 },
      matureHeightM: plant.heightM,
      groundSpreadM: plant.spreadM,
    };
  }

  return plant;
}

export function loadCustomPlants(): Plant[] {
  if (!isBrowser()) return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.removeItem(STORAGE_KEY);
      return [];
    }

    const plants: Plant[] = [];
    for (const entry of parsed) {
      const plant = parsePlant(entry);
      if (plant) plants.push(plant);
    }

    setCustomPlantsRegistry(plants);
    return plants;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  }
}

export function saveCustomPlants(plants: Plant[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plants));
  setCustomPlantsRegistry(plants);
}

export function addCustomPlant(plant: Plant): Plant[] {
  const existing = loadCustomPlants();
  const next = [...existing, plant];
  saveCustomPlants(next);
  return next;
}

export function deleteCustomPlant(id: PlantId): Plant[] {
  const existing = loadCustomPlants();
  const next = existing.filter((plant) => plant.id !== id);
  saveCustomPlants(next);
  return next;
}
