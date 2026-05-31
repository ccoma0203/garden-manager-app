import { PLANT_CATALOG, toPlant } from "@/lib/plants/catalog";
import type { Plant, PlantCategory, PlantId } from "@/types/plant";

const BUILTIN_PLANTS: Plant[] = PLANT_CATALOG.map(toPlant);

const builtinById = new Map<string, Plant>(
  BUILTIN_PLANTS.map((plant) => [plant.id, plant]),
);

let customPlants: Plant[] = [];

export function setCustomPlantsRegistry(plants: Plant[]): void {
  customPlants = plants;
}

export function getCustomPlantsRegistry(): Plant[] {
  return customPlants;
}

export function getBuiltinPlants(): Plant[] {
  return BUILTIN_PLANTS;
}

export function getPlantById(id: PlantId): Plant | undefined {
  return (
    customPlants.find((plant) => plant.id === id) ?? builtinById.get(id)
  );
}

export function getPlantsByCategory(category: PlantCategory): Plant[] {
  const builtins = BUILTIN_PLANTS.filter((plant) => plant.category === category);
  const custom = customPlants.filter((plant) => plant.category === category);
  return [...builtins, ...custom];
}

export function isCustomPlantId(id: PlantId): boolean {
  return id.startsWith("custom-");
}

export function getPlantEmoji(plantId: PlantId): string {
  return getPlantById(plantId)?.emoji ?? "🌱";
}
