"use client";

import { useDraggable } from "@dnd-kit/core";
import { X } from "lucide-react";

import { PlantGridTile } from "@/components/garden/PlantGridTile";
import { placedDraggableId } from "@/lib/garden/dnd";
import type { PlacedItem } from "@/types/garden";
import { getPlantById } from "@/types/plant";

type DraggablePlacedPlantProps = {
  item: PlacedItem;
  span: number;
  onRemove?: (itemId: string) => void;
};

export function DraggablePlacedPlant({
  item,
  span,
  onRemove,
}: DraggablePlacedPlantProps) {
  const plant = item.plantId ? getPlantById(item.plantId) : undefined;
  const label = plant?.name ?? (item.kind === "tool" ? "Tool" : "Plant");

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: placedDraggableId(item.id),
    data: { type: "placed-plant", item },
  });

  return (
    <div
      className="group/plant relative z-10 min-h-0 min-w-0"
      style={{
        gridColumn: `${item.position.col + 1} / span ${span}`,
        gridRow: `${item.position.row + 1} / span ${span}`,
      }}
    >
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        title={`${label} — drag to move`}
        aria-label={`Move ${label}`}
        className={`size-full cursor-grab touch-none active:cursor-grabbing ${
          isDragging ? "opacity-30" : ""
        }`}
      >
        <PlantGridTile label={label} plantId={item.plantId} />
      </div>

      <button
        type="button"
        title={`Remove ${label}`}
        aria-label={`Remove ${label}`}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          onRemove?.(item.id);
        }}
        className="absolute top-1 right-1 z-20 flex size-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 shadow-sm transition-opacity group-hover/plant:opacity-100 hover:bg-black/80 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="size-3" strokeWidth={2.5} />
      </button>
    </div>
  );
}
