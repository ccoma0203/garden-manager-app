"use client";

import { forwardRef } from "react";

import { DraggablePlacedPlant } from "@/components/garden/DraggablePlacedPlant";
import { getGridSize, spanForPlacedItem } from "@/lib/garden/grid";
import type { Garden } from "@/types/garden";
import { getPlantById } from "@/types/plant";

type GardenCanvasProps = {
  garden: Garden;
  isDropTarget?: boolean;
  onRemoveItem?: (itemId: string) => void;
};

export const GardenCanvas = forwardRef<HTMLDivElement, GardenCanvasProps>(
  function GardenCanvas({ garden, isDropTarget = false, onRemoveItem }, ref) {
    const { width, height, unit } = garden.dimensions;
    const { cols, rows } = getGridSize(width, height);

    const gridStyle = {
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gridTemplateRows: `repeat(${rows}, 1fr)`,
    };

    return (
      <div
        className="relative min-h-[320px] overflow-hidden rounded-xl border border-border bg-muted/30"
        style={{
          aspectRatio: `${width} / ${height}`,
          maxHeight: "min(75vh, 640px)",
        }}
        aria-label={`Garden plot ${width}×${height} ${unit}`}
      >
        <div
          ref={ref}
          className={`absolute inset-2 transition-colors ${
            isDropTarget
              ? "rounded-lg bg-emerald-500/10 ring-2 ring-emerald-500/50 ring-inset"
              : ""
          }`}
        >
          <div
            className="absolute inset-0 grid gap-1"
            style={gridStyle}
            aria-hidden
          >
            {Array.from({ length: cols * rows }, (_, index) => (
              <div
                key={`cell-${index}`}
                className="rounded-sm border border-border/30 bg-muted/60"
              />
            ))}
          </div>

          <div className="absolute inset-0 grid gap-1" style={gridStyle}>
            {garden.items.map((item) => {
              const span = spanForPlacedItem(item, getPlantById);
              return (
                <DraggablePlacedPlant
                  key={item.id}
                  item={item}
                  span={span}
                  onRemove={onRemoveItem}
                />
              );
            })}
          </div>
        </div>

        <p className="pointer-events-none absolute bottom-2 right-2 z-20 rounded-md bg-background/90 px-2 py-0.5 text-xs text-muted-foreground">
          {width} × {height} {unit}
        </p>
      </div>
    );
  },
);
