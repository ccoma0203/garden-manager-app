import type { PlantCategory, PlantId } from "@/types/plant";

/** Category-based tile styling (vegetables green, flowers pink/purple, trees earthy). */
export const CATEGORY_TILE_COLORS: Record<PlantCategory, string> = {
  vegetable:
    "bg-gradient-to-br from-green-600 to-green-800 text-white shadow-green-900/30",
  flower:
    "bg-gradient-to-br from-fuchsia-500 to-purple-700 text-white shadow-fuchsia-900/30",
  tree: "bg-gradient-to-br from-amber-800 to-stone-900 text-amber-50 shadow-stone-900/40",
};

/** Optional per-plant accents within category tones. */
export const PLANT_TILE_ACCENT: Partial<Record<PlantId, string>> = {
  tomato: "from-lime-600 to-green-800",
  carrot: "from-orange-500 to-amber-700",
  rose: "from-rose-500 to-pink-700",
  sunflower: "from-yellow-400 to-amber-600 text-amber-950",
};

export function getPlantTileColor(
  plantId: PlantId,
  category: PlantCategory,
): string {
  const accent = PLANT_TILE_ACCENT[plantId];
  if (accent) {
    return `bg-gradient-to-br ${accent} text-white shadow-lg`;
  }
  return `${CATEGORY_TILE_COLORS[category]} shadow-lg`;
}
