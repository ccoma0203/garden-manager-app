import type { PlacedItem } from "@/types/garden";

export const CANVAS_DROPPABLE_ID = "garden-canvas";

export type PlacedDragData = {
  type: "placed-plant";
  item: PlacedItem;
};

/** @deprecated Palette drag was removed; kept for stale imports. */
export type PaletteDragData = {
  type: "palette-plant";
  plant: { id: string };
};

export function placedDraggableId(itemId: string): string {
  return `placed-plant-${itemId}`;
}

export function isPlacedDragData(
  data: Record<string, unknown> | undefined,
): data is PlacedDragData {
  return data?.type === "placed-plant" && data.item != null;
}

/** @deprecated Palette drag was removed; always returns false. */
export function isPaletteDragData(
  data: Record<string, unknown> | undefined,
): data is PaletteDragData {
  return data?.type === "palette-plant";
}
