import type { PlacedItem } from "@/types/garden";

export const CANVAS_DROPPABLE_ID = "garden-canvas";

export type PlacedDragData = {
  type: "placed-plant";
  item: PlacedItem;
};

export function placedDraggableId(itemId: string): string {
  return `placed-plant-${itemId}`;
}

export function isPlacedDragData(
  data: Record<string, unknown> | undefined,
): data is PlacedDragData {
  return data?.type === "placed-plant" && data.item != null;
}
