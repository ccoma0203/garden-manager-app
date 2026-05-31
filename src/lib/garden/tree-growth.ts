import type { PlacedItem } from "@/types/garden";
import type { Plant, TreeGrowthStage } from "@/types/plant";

export const TREE_STAGE_SPAN_CELLS: Record<TreeGrowthStage, number> = {
  seedling: 2,
  young: 4,
  mature: 8,
};

export const TREE_STAGE_ORDER: TreeGrowthStage[] = [
  "seedling",
  "young",
  "mature",
];

const STAGE_META: Record<
  TreeGrowthStage,
  { emoji: string; label: string }
> = {
  seedling: { emoji: "🌱", label: "Seedling" },
  young: { emoji: "🌿", label: "Young" },
  mature: { emoji: "🌳", label: "Mature" },
};

export function getTreeSpanCells(stage: TreeGrowthStage): number {
  return TREE_STAGE_SPAN_CELLS[stage];
}

export function getTreeGrowthStage(
  item: PlacedItem,
  plant?: Plant,
): TreeGrowthStage | undefined {
  if (plant?.category !== "tree") return undefined;
  return item.growthStage ?? "mature";
}

export function getNextTreeStage(
  stage: TreeGrowthStage,
): TreeGrowthStage | null {
  const index = TREE_STAGE_ORDER.indexOf(stage);
  if (index < 0 || index >= TREE_STAGE_ORDER.length - 1) return null;
  return TREE_STAGE_ORDER[index + 1] ?? null;
}

export function formatHeightM(m: number): string {
  const rounded = Math.round(m * 10) / 10;
  return Number.isInteger(rounded) ? `${rounded}m` : `${rounded.toFixed(1)}m`;
}

/** Human-readable height for the tile subtitle. */
export function formatTreeHeight(plant: Plant, stage: TreeGrowthStage): string {
  const growth = plant.growth;
  if (!growth) return "—";

  if (stage === "seedling") {
    const { min, max } = growth.seedlingHeightM;
    if (min === max) return formatHeightM(min);
    return `${formatHeightM(max)}`;
  }

  if (stage === "young") {
    const { min, max } = growth.youngHeightM;
    if (min === max) return formatHeightM(min);
    return `${formatHeightM(min)}–${formatHeightM(max)}`;
  }

  return formatHeightM(growth.matureHeightM);
}

export function formatTreeStageLine(plant: Plant, stage: TreeGrowthStage): string {
  const meta = STAGE_META[stage];
  return `${meta.emoji} ${meta.label} · ${formatTreeHeight(plant, stage)}`;
}

export function treeGroundSpreadM(plant: Plant): number {
  return plant.growth?.groundSpreadM ?? plant.spreadM;
}
