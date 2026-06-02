import type { AIPlantLookupResult } from "@/lib/plants/ai-lookup";
import { toPlant, type CatalogPlant } from "@/lib/plants/catalog";
import type {
  Plant,
  PlantCategory,
  SunExposure,
  WaterNeeds,
} from "@/types/plant";

const TREE_GROWTH_BASE = {
  seedlingHeightM: { min: 0.3, max: 0.5 },
  youngHeightM: { min: 1, max: 3 },
} as const;

export const EMOJI_PICKER_OPTIONS = [
  "🌱",
  "🌿",
  "🍅",
  "🥕",
  "🥬",
  "🌶️",
  "🍆",
  "🥒",
  "🧅",
  "🌽",
  "🍓",
  "🌹",
  "🌻",
  "🌷",
  "🌸",
  "🌺",
  "💐",
  "🌼",
  "🪷",
  "🌳",
  "🍎",
  "🍋",
  "🌲",
  "🎋",
  "🌴",
  "🍁",
  "🫒",
  "🌵",
  "🪴",
  "🥦",
] as const;

export type CustomPlantDraft = {
  name: string;
  emoji?: string;
  category?: PlantCategory;
  wateringIntervalDays?: number;
  sun?: SunExposure;
  minTempC?: number;
  water?: WaterNeeds;
  spreadM?: number;
  heightM?: number;
};

const CATEGORY_DEFAULTS: Record<
  PlantCategory,
  Pick<Plant, "spreadM" | "heightM" | "sun" | "water" | "wateringIntervalDays" | "minTempC">
> = {
  vegetable: {
    spreadM: 0.35,
    heightM: 0.5,
    sun: "full",
    water: "medium",
    wateringIntervalDays: 3,
    minTempC: 5,
  },
  flower: {
    spreadM: 0.3,
    heightM: 0.5,
    sun: "full",
    water: "medium",
    wateringIntervalDays: 4,
    minTempC: 0,
  },
  tree: {
    spreadM: 0.45,
    heightM: 6,
    sun: "full",
    water: "medium",
    wateringIntervalDays: 5,
    minTempC: 0,
  },
};

export function draftFromCatalog(entry: CatalogPlant): CustomPlantDraft {
  const plant = toPlant(entry);
  return {
    name: plant.name,
    emoji: plant.emoji,
    category: plant.category,
    wateringIntervalDays: plant.wateringIntervalDays,
    sun: plant.sun,
    minTempC: plant.minTempC,
    water: plant.water,
    spreadM: plant.spreadM,
    heightM: plant.heightM,
  };
}

export function draftFromAI(result: NonNullable<AIPlantLookupResult>): CustomPlantDraft {
  return {
    name: result.name,
    emoji: result.emoji,
    category: result.category,
    wateringIntervalDays: result.wateringIntervalDays,
    sun: result.sun,
    minTempC: result.minTempC,
    water: result.water,
    spreadM: result.spreadM,
    heightM: result.heightM,
  };
}

export function createCustomPlant(draft: CustomPlantDraft): Plant {
  const name = draft.name.trim();
  if (!name) {
    throw new Error("Plant name is required");
  }

  const category = draft.category ?? "vegetable";
  const defaults = CATEGORY_DEFAULTS[category];

  const plant: Plant = {
    id: `custom-${crypto.randomUUID()}`,
    name,
    category,
    emoji: draft.emoji?.trim() || "🌱",
    sun: draft.sun ?? defaults.sun,
    water: draft.water ?? defaults.water,
    spreadM: draft.spreadM ?? defaults.spreadM,
    heightM: draft.heightM ?? defaults.heightM,
    wateringIntervalDays:
      draft.wateringIntervalDays ?? defaults.wateringIntervalDays,
    minTempC: draft.minTempC ?? defaults.minTempC,
    isCustom: true,
    goodNeighbors: [],
    badNeighbors: [],
  };

  if (category === "tree") {
    plant.growth = {
      ...TREE_GROWTH_BASE,
      matureHeightM: plant.heightM,
      groundSpreadM: plant.spreadM,
    };
  }

  return plant;
}
