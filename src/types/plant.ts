export type PlantId = string;

export type SunExposure = "full" | "partial" | "shade";

export type WaterNeeds = "low" | "medium" | "high";

export type Plant = {
  id: PlantId;
  name: string;
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

/** Starter catalog for local development (no API yet). */
export const SAMPLE_PLANTS: Plant[] = [
  {
    id: "tomato",
    name: "Tomato",
    scientificName: "Solanum lycopersicum",
    sun: "full",
    water: "high",
    spreadM: 0.6,
    heightM: 1.2,
    hardinessZones: [5, 9],
  },
  {
    id: "basil",
    name: "Basil",
    scientificName: "Ocimum basilicum",
    sun: "full",
    water: "medium",
    spreadM: 0.3,
    heightM: 0.5,
    hardinessZones: [5, 10],
  },
  {
    id: "lavender",
    name: "Lavender",
    scientificName: "Lavandula",
    sun: "full",
    water: "low",
    spreadM: 0.5,
    heightM: 0.6,
    hardinessZones: [5, 9],
  },
  {
    id: "fern",
    name: "Fern",
    sun: "shade",
    water: "high",
    spreadM: 0.4,
    heightM: 0.5,
    hardinessZones: [3, 8],
  },
  {
    id: "carrot",
    name: "Carrot",
    scientificName: "Daucus carota",
    sun: "full",
    water: "medium",
    spreadM: 0.15,
    heightM: 0.3,
    hardinessZones: [3, 10],
  },
];

export function getPlantById(id: PlantId): Plant | undefined {
  return SAMPLE_PLANTS.find((plant) => plant.id === id);
}
