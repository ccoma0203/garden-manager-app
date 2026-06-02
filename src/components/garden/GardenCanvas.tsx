"use client";

import { forwardRef, useCallback, useMemo, useState } from "react";

import { DraggablePlacedPlant } from "@/components/garden/DraggablePlacedPlant";
import { ResizableGardenZone } from "@/components/garden/ResizableGardenZone";
import {
  conflictingItemIds,
  findBedNeighborConflicts,
} from "@/lib/garden/compatibility";
import { getGridSize, spanForPlacedItem } from "@/lib/garden/grid";
import { MIN_ZONE_CELLS } from "@/lib/garden/zone-resize";
import {
  cellFromPointer,
  rectFromCorners,
} from "@/lib/garden/zones";
import type { Garden, GardenZone, GridPosition } from "@/types/garden";
import { getPlantById } from "@/lib/plants/registry";

type GardenCanvasProps = {
  garden: Garden;
  isDropTarget?: boolean;
  onRemoveItem?: (itemId: string) => void;
  onGrowItem?: (itemId: string) => void;
  zoneDrawMode?: boolean;
  onZoneDrawn?: (
    rect: Pick<GardenZone, "col" | "row" | "widthCells" | "heightCells">,
  ) => void;
  onZoneResize?: (zone: GardenZone) => void;
};

export const GardenCanvas = forwardRef<HTMLDivElement, GardenCanvasProps>(
  function GardenCanvas(
    {
      garden,
      isDropTarget = false,
      onRemoveItem,
      onGrowItem,
      zoneDrawMode = false,
      onZoneDrawn,
      onZoneResize,
    },
    ref,
  ) {
    const { width, height, unit } = garden.dimensions;
    const { cols, rows } = getGridSize(width, height);

    const [drawStart, setDrawStart] = useState<GridPosition | null>(null);
    const [drawEnd, setDrawEnd] = useState<GridPosition | null>(null);

    const gridStyle = {
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gridTemplateRows: `repeat(${rows}, 1fr)`,
    };

    const conflictItemIds = useMemo(() => {
      const conflicts = findBedNeighborConflicts(
        garden.items,
        garden.zones,
        (item) => spanForPlacedItem(item, getPlantById),
      );
      return conflictingItemIds(conflicts);
    }, [garden.items, garden.zones]);

    const previewRect =
      drawStart && drawEnd ? rectFromCorners(drawStart, drawEnd) : null;

    const pointerToCell = useCallback(
      (clientX: number, clientY: number, element: HTMLElement): GridPosition => {
        const rect = element.getBoundingClientRect();
        return cellFromPointer(
          clientX - rect.left,
          clientY - rect.top,
          rect.width,
          rect.height,
          cols,
          rows,
        );
      },
      [cols, rows],
    );

    const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
      if (!zoneDrawMode) return;
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      const cell = pointerToCell(event.clientX, event.clientY, event.currentTarget);
      setDrawStart(cell);
      setDrawEnd(cell);
    };

    const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
      if (!zoneDrawMode || !drawStart) return;
      const cell = pointerToCell(event.clientX, event.clientY, event.currentTarget);
      setDrawEnd(cell);
    };

    const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
      if (!zoneDrawMode || !drawStart || !drawEnd) return;
      event.currentTarget.releasePointerCapture(event.pointerId);

      const rect = rectFromCorners(drawStart, drawEnd);
      setDrawStart(null);
      setDrawEnd(null);

      if (
        rect.widthCells >= MIN_ZONE_CELLS &&
        rect.heightCells >= MIN_ZONE_CELLS
      ) {
        onZoneDrawn?.(rect);
      }
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
          data-garden-grid
          className={`absolute inset-2 transition-colors ${
            isDropTarget
              ? "rounded-lg bg-emerald-500/10 ring-2 ring-emerald-500/50 ring-inset"
              : ""
          } ${zoneDrawMode ? "cursor-crosshair" : ""}`}
          onPointerDown={zoneDrawMode ? handlePointerDown : undefined}
          onPointerMove={zoneDrawMode ? handlePointerMove : undefined}
          onPointerUp={zoneDrawMode ? handlePointerUp : undefined}
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
            {garden.zones.map((zone) => (
              <ResizableGardenZone
                key={zone.id}
                zone={zone}
                gridCols={cols}
                gridRows={rows}
                disabled={zoneDrawMode}
                pointerToCell={pointerToCell}
                onResizeCommit={(updated) => onZoneResize?.(updated)}
              />
            ))}

            {previewRect ? (
              <div
                className="pointer-events-none z-[5] rounded-md border-2 border-dashed border-primary bg-primary/20"
                style={{
                  gridColumn: `${previewRect.col + 1} / span ${previewRect.widthCells}`,
                  gridRow: `${previewRect.row + 1} / span ${previewRect.heightCells}`,
                }}
              />
            ) : null}
          </div>

          <div
            className={`absolute inset-0 grid gap-1 ${zoneDrawMode ? "pointer-events-none" : ""}`}
            style={gridStyle}
          >
            {garden.items.map((item) => {
              const span = spanForPlacedItem(item, getPlantById);
              return (
                <DraggablePlacedPlant
                  key={item.id}
                  item={item}
                  span={span}
                  hasConflict={conflictItemIds.has(item.id)}
                  onRemove={onRemoveItem}
                  onGrow={onGrowItem}
                />
              );
            })}
          </div>
        </div>

        {zoneDrawMode ? (
          <p className="pointer-events-none absolute left-2 top-2 z-20 rounded-md bg-background/90 px-2 py-0.5 text-xs font-medium text-primary">
            Drawing bed… (min {MIN_ZONE_CELLS}×{MIN_ZONE_CELLS} cells)
          </p>
        ) : null}

        <p className="pointer-events-none absolute bottom-2 right-2 z-20 rounded-md bg-background/90 px-2 py-0.5 text-xs text-muted-foreground">
          {width} × {height} {unit}
        </p>
      </div>
    );
  },
);
