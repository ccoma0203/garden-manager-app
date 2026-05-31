export type PlantId = string;

export type SunExposure = "full" | "partial" | "shade";

export type WaterNeeds = "low" | "medium" | "high";

export type PlantCategory = "vegetable" | "flower" | "tree";

export type TreeGrowthStage = "seedling" | "young" | "mature";

export type TreeGrowthProfile = {
  seedlingHeightM: { min: number; max: number };
  youngHeightM: { min: number; max: number };
  matureHeightM: number;
  /** Ground footprint in metres — trees grow up, not out. */
  groundSpreadM: number;
};

export type Plant = {
  id: PlantId;
  name: string;
  category: PlantCategory;
  scientificName?: string;
  description?: string;
  sun: SunExposure;
  water: WaterNeeds;
  /** Typical spread in meters. */
  spreadM: number;
  /** Typical height in meters. */
  heightM: number;
  /** USDA-style hardiness zones, e.g. [5, 9]. */
  hardinessZones?: [number, number];
  imageUrl?: string;
  emoji?: string;
  /** Days between watering under normal conditions. */
  wateringIntervalDays: number;
  /** Minimum safe overnight temperature (°C). */
  minTempC: number;
  /** Whether the plant needs staking in wind. */
  needsSupport?: boolean;
  /** Height stages for trees (spread on canvas uses growth stage, not spreadM). */
  growth?: TreeGrowthProfile;
  /** User-created plant stored in localStorage. */
  isCustom?: boolean;
};

export type Tool = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
};

export type CareRule = {
  plantId: PlantId;
  task: string;
  /** Human-readable interval, e.g. "every 3 days". */
  interval: string;
  season?: "spring" | "summer" | "autumn" | "winter" | "year-round";
};
