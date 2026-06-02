"use client";

import { useDraggable } from "@dnd-kit/core";
import { AlertTriangle, Sprout, X } from "lucide-react";
import { useState } from "react";

import { PlantCompatibilityTooltip } from "@/components/garden/PlantCompatibilityTooltip";
import { PlantGridTile } from "@/components/garden/PlantGridTile";
import { placedDraggableId } from "@/lib/garden/dnd";
import {
  formatTreeStageLine,
  getNextTreeStage,
  getTreeGrowthStage,
} from "@/lib/garden/tree-growth";
import type { PlacedItem } from "@/types/garden";
import { getPlantById } from "@/lib/plants/registry";

type DraggablePlacedPlantProps = {
  item: PlacedItem;
  span: number;
  hasConflict?: boolean;
  onRemove?: (itemId: string) => void;
  onGrow?: (itemId: string) => void;
};

export function DraggablePlacedPlant({
  item,
  span,
  hasConflict = false,
  onRemove,
  onGrow,
}: DraggablePlacedPlantProps) {
  const plant = item.plantId ? getPlantById(item.plantId) : undefined;
  const label = plant?.name ?? (item.kind === "tool" ? "Tool" : "Plant");
  const stage = getTreeGrowthStage(item, plant);
  const subtitle =
    plant && stage ? formatTreeStageLine(plant, stage) : undefined;
  const canGrow = stage ? getNextTreeStage(stage) !== null : false;

  const [showCompat, setShowCompat] = useState(false);
  const [pinnedCompat, setPinnedCompat] = useState(false);

  const compatVisible =
    plant &&
    (showCompat || pinnedCompat) &&
    ((plant.goodNeighbors?.length ?? 0) > 0 ||
      (plant.badNeighbors?.length ?? 0) > 0);

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
      onMouseEnter={() => plant && setShowCompat(true)}
      onMouseLeave={() => {
        if (!pinnedCompat) setShowCompat(false);
      }}
    >
      {hasConflict ? (
        <span
          className="absolute -top-1 -left-1 z-30 flex size-5 items-center justify-center rounded-full bg-amber-500 text-white shadow-md"
          title="Bad neighbor in this bed"
          aria-label="Companion planting warning"
        >
          <AlertTriangle className="size-3" strokeWidth={2.5} aria-hidden />
        </span>
      ) : null}

      {plant &&
      ((plant.goodNeighbors?.length ?? 0) > 0 ||
        (plant.badNeighbors?.length ?? 0) > 0) ? (
        <PlantCompatibilityTooltip plant={plant} visible={!!compatVisible} />
      ) : null}

      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        onClick={() => {
          if (plant) setPinnedCompat((value) => !value);
        }}
        title={`${label} — drag to move`}
        aria-label={`Move ${label}`}
        className={`size-full cursor-grab touch-none active:cursor-grabbing ${
          isDragging ? "opacity-30" : ""
        } ${hasConflict ? "ring-2 ring-amber-500/80 ring-offset-1 ring-offset-transparent rounded-2xl" : ""}`}
      >
        <PlantGridTile
          label={label}
          plantId={item.plantId}
          category={plant?.category}
          emoji={plant?.emoji}
          subtitle={subtitle}
        />
      </div>

      {canGrow ? (
        <button
          type="button"
          title={`Grow ${label}`}
          aria-label={`Grow ${label} to next stage`}
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onGrow?.(item.id);
          }}
          className="absolute bottom-1.5 left-1/2 z-20 flex -translate-x-1/2 items-center gap-1 rounded-full bg-emerald-700/90 px-2 py-0.5 text-[10px] font-semibold text-white opacity-0 shadow-sm transition-opacity group-hover/plant:opacity-100 hover:bg-emerald-800 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:text-xs"
        >
          <Sprout className="size-3" strokeWidth={2.5} aria-hidden />
          Grow
        </button>
      ) : null}

      <button
        type="button"
        title={`Remove ${label}`}
        aria-label={`Remove ${label}`}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          onRemove?.(item.id);
        }}
        className="absolute top-1.5 right-1.5 z-20 flex size-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 shadow-sm transition-opacity group-hover/plant:opacity-100 hover:bg-black/80 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <X className="size-3.5" strokeWidth={2.5} />
      </button>
    </div>
  );
}
