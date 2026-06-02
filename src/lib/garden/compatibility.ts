import { spanForPlacedItem } from "@/lib/garden/grid";
import { itemIntersectsZone } from "@/lib/garden/zones";
import { getPlantById } from "@/lib/plants/registry";
import type { GardenZone, PlacedItem } from "@/types/garden";
import type { Plant, PlantId } from "@/types/plant";

export type NeighborConflict = {
  zoneId: string;
  zoneName: string;
  itemIdA: string;
  itemIdB: string;
  plantIdA: PlantId;
  plantIdB: PlantId;
};

export function areBadNeighbors(plantA: Plant, plantB: Plant): boolean {
  const aRejectsB = plantA.badNeighbors?.includes(plantB.id) ?? false;
  const bRejectsA = plantB.badNeighbors?.includes(plantA.id) ?? false;
  return aRejectsB || bRejectsA;
}

export function formatNeighborList(plantIds: PlantId[]): string {
  const labels = plantIds
    .map((id) => {
      const plant = getPlantById(id);
      if (!plant) return null;
      const emoji = plant.emoji ?? "🌱";
      return `${emoji} ${plant.name}`;
    })
    .filter((label): label is string => Boolean(label));

  return labels.length > 0 ? labels.join(", ") : "None";
}

export function findBedNeighborConflicts(
  items: PlacedItem[],
  zones: GardenZone[],
  spanForItem: (item: PlacedItem) => number = (item) =>
    spanForPlacedItem(item, getPlantById),
): NeighborConflict[] {
  const conflicts: NeighborConflict[] = [];
  const seen = new Set<string>();

  for (const zone of zones) {
    const inBed = items.filter(
      (item) =>
        item.kind === "plant" &&
        item.plantId &&
        itemIntersectsZone(item, spanForItem(item), zone),
    );

    for (let i = 0; i < inBed.length; i++) {
      for (let j = i + 1; j < inBed.length; j++) {
        const itemA = inBed[i];
        const itemB = inBed[j];
        if (!itemA.plantId || !itemB.plantId) continue;

        const plantA = getPlantById(itemA.plantId);
        const plantB = getPlantById(itemB.plantId);
        if (!plantA || !plantB) continue;
        if (!areBadNeighbors(plantA, plantB)) continue;

        const pairKey = [itemA.id, itemB.id].sort().join(":");
        if (seen.has(pairKey)) continue;
        seen.add(pairKey);

        conflicts.push({
          zoneId: zone.id,
          zoneName: zone.name,
          itemIdA: itemA.id,
          itemIdB: itemB.id,
          plantIdA: plantA.id,
          plantIdB: plantB.id,
        });
      }
    }
  }

  return conflicts;
}

export function conflictingItemIds(
  conflicts: NeighborConflict[],
): Set<string> {
  const ids = new Set<string>();
  for (const conflict of conflicts) {
    ids.add(conflict.itemIdA);
    ids.add(conflict.itemIdB);
  }
  return ids;
}
