import {
  findBedNeighborConflicts,
  type NeighborConflict,
} from "@/lib/garden/compatibility";
import type { CareAlert } from "@/lib/care/alerts";
import { getPlantById, getPlantEmoji } from "@/lib/plants/registry";
import type { GardenZone, PlacedItem } from "@/types/garden";

function formatConflictMessage(conflict: NeighborConflict): string {
  const plantA = getPlantById(conflict.plantIdA);
  const plantB = getPlantById(conflict.plantIdB);
  if (!plantA || !plantB) return "Some plants in the same bed are incompatible.";

  const emojiA = plantA.emoji ?? getPlantEmoji(plantA.id);
  const emojiB = plantB.emoji ?? getPlantEmoji(plantB.id);

  return `${plantA.name} and ${plantB.name} are bad neighbors — consider separating them ${emojiA}${emojiB}`;
}

export function generateCompatibilityAlerts(
  items: PlacedItem[],
  zones: GardenZone[],
  spanForItem?: (item: PlacedItem) => number,
): CareAlert[] {
  const conflicts = findBedNeighborConflicts(items, zones, spanForItem);
  return conflicts.map((conflict) => ({
    id: `compat-${conflict.zoneId}-${[conflict.plantIdA, conflict.plantIdB].sort().join("-")}`,
    icon: "warning" as const,
    emoji: "⚠️",
    message: formatConflictMessage(conflict),
    plantId: conflict.plantIdA,
  }));
}
