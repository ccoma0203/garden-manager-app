import type { PlantId } from "@/types/plant";

/** Tailwind classes for placed plant tiles on the grid. */
export const PLANT_TILE_COLORS: Record<PlantId, string> = {
  tomato: "bg-red-600 text-white hover:bg-red-700",
  basil: "bg-green-600 text-white hover:bg-green-700",
  lavender: "bg-purple-600 text-white hover:bg-purple-700",
  fern: "bg-emerald-700 text-white hover:bg-emerald-800",
  carrot: "bg-orange-500 text-white hover:bg-orange-600",
};

export function getPlantTileColor(plantId: PlantId): string {
  return (
    PLANT_TILE_COLORS[plantId] ??
    "bg-primary text-primary-foreground hover:bg-primary/90"
  );
}
