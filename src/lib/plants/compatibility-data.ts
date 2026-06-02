import type { PlantId } from "@/types/plant";

export type PlantCompatibility = {
  goodNeighbors: PlantId[];
  badNeighbors: PlantId[];
};

/** Companion planting rules keyed by plant id. */
export const PLANT_COMPATIBILITY: Record<string, PlantCompatibility> = {
  tomato: { goodNeighbors: ["basil", "marigold"], badNeighbors: ["carrot", "fennel"] },
  basil: { goodNeighbors: ["tomato", "rose", "pepper", "daisy"], badNeighbors: [] },
  carrot: { goodNeighbors: ["rose", "onion", "lettuce"], badNeighbors: ["tomato", "dill"] },
  rose: { goodNeighbors: ["basil", "lavender", "garlic", "carrot"], badNeighbors: [] },
  lavender: { goodNeighbors: ["rose", "daisy", "rosemary"], badNeighbors: [] },
  sunflower: { goodNeighbors: ["cucumber", "corn"], badNeighbors: ["potato"] },
  daisy: { goodNeighbors: ["lavender", "basil", "rose"], badNeighbors: [] },
  cucumber: { goodNeighbors: ["sunflower", "bean", "corn", "pea"], badNeighbors: ["potato"] },
  potato: { goodNeighbors: ["bean", "corn"], badNeighbors: ["sunflower", "cucumber", "tomato"] },
  onion: { goodNeighbors: ["carrot", "lettuce", "tomato"], badNeighbors: ["bean", "pea"] },
  garlic: { goodNeighbors: ["tomato", "rose", "carrot"], badNeighbors: ["bean", "pea"] },
  lettuce: { goodNeighbors: ["carrot", "onion", "radish", "strawberry"], badNeighbors: [] },
  pepper: { goodNeighbors: ["basil", "tomato", "onion"], badNeighbors: ["fennel"] },
  marigold: { goodNeighbors: ["tomato", "pepper", "cucumber"], badNeighbors: [] },
  bean: { goodNeighbors: ["corn", "cucumber", "potato"], badNeighbors: ["onion", "garlic"] },
  pea: { goodNeighbors: ["carrot", "corn", "cucumber"], badNeighbors: ["onion", "garlic"] },
  corn: { goodNeighbors: ["bean", "cucumber", "sunflower"], badNeighbors: [] },
  spinach: { goodNeighbors: ["strawberry", "pea"], badNeighbors: [] },
  strawberry: { goodNeighbors: ["spinach", "lettuce", "bean"], badNeighbors: ["cabbage"] },
  cabbage: { goodNeighbors: ["onion", "potato"], badNeighbors: ["strawberry", "tomato"] },
  broccoli: { goodNeighbors: ["onion", "basil"], badNeighbors: ["strawberry"] },
  zucchini: { goodNeighbors: ["bean", "corn", "marigold"], badNeighbors: ["potato"] },
  eggplant: { goodNeighbors: ["bean", "marigold"], badNeighbors: [] },
  pumpkin: { goodNeighbors: ["corn", "bean"], badNeighbors: ["potato"] },
  radish: { goodNeighbors: ["lettuce", "carrot", "cucumber"], badNeighbors: [] },
  mint: { goodNeighbors: ["cabbage", "tomato"], badNeighbors: ["parsley"] },
  parsley: { goodNeighbors: ["tomato", "asparagus"], badNeighbors: ["mint"] },
  rosemary: { goodNeighbors: ["lavender", "sage", "carrot"], badNeighbors: [] },
  thyme: { goodNeighbors: ["strawberry", "cabbage"], badNeighbors: [] },
  dill: { goodNeighbors: ["cabbage", "onion"], badNeighbors: ["carrot", "tomato"] },
  fennel: { goodNeighbors: [], badNeighbors: ["tomato", "pepper", "bean"] },
  chrysanthemum: { goodNeighbors: ["rose", "lavender"], badNeighbors: [] },
  petunia: { goodNeighbors: ["tomato", "basil"], badNeighbors: [] },
  nasturtium: { goodNeighbors: ["tomato", "cucumber"], badNeighbors: [] },
};

const EMPTY: PlantCompatibility = {
  goodNeighbors: [],
  badNeighbors: [],
};

export function getCompatibilityForPlant(plantId: string): PlantCompatibility {
  return PLANT_COMPATIBILITY[plantId] ?? EMPTY;
}
