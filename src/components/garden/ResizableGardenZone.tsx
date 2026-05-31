"use client";

import { useCallback, useState } from "react";

import {
  getBedVisual,
  getBorderVisual,
  getZoneDisplayLabel,
} from "@/lib/garden/bed-styles";
import {
  RESIZE_HANDLES,
  resizeZoneFromPointer,
  type ResizeHandle,
} from "@/lib/garden/zone-resize";
import type { GardenZone, GridPosition } from "@/types/garden";

type ResizableGardenZoneProps = {
  zone: GardenZone;
  gridCols: number;
  gridRows: number;
  disabled?: boolean;
  pointerToCell: (
    clientX: number,
    clientY: number,
    element: HTMLElement,
  ) => GridPosition;
  onResizeCommit: (zone: GardenZone) => void;
};

export function ResizableGardenZone({
  zone,
  gridCols,
  gridRows,
  disabled = false,
  pointerToCell,
  onResizeCommit,
}: ResizableGardenZoneProps) {
  const [preview, setPreview] = useState<GardenZone | null>(null);
  const [activeHandle, setActiveHandle] = useState<ResizeHandle | null>(null);

  const display = preview ?? zone;
  const bedVisual = getBedVisual(display.bedType);
  const borderVisual = getBorderVisual(display.borderStyle);

  const handleResizePointerDown = useCallback(
    (handle: ResizeHandle) => (event: React.PointerEvent<HTMLDivElement>) => {
      if (disabled) return;
      event.preventDefault();
      event.stopPropagation();

      const gridEl = event.currentTarget.closest("[data-garden-grid]") as
        | HTMLElement
        | null;
      if (!gridEl) return;

      event.currentTarget.setPointerCapture(event.pointerId);
      setActiveHandle(handle);

      const onMove = (moveEvent: PointerEvent) => {
        const cell = pointerToCell(
          moveEvent.clientX,
          moveEvent.clientY,
          gridEl,
        );
        setPreview(
          resizeZoneFromPointer(
            zone,
            handle,
            cell.col,
            cell.row,
            gridCols,
            gridRows,
          ),
        );
      };

      const onUp = (upEvent: PointerEvent) => {
        gridEl.removeEventListener("pointermove", onMove);
        gridEl.removeEventListener("pointerup", onUp);
        gridEl.removeEventListener("pointercancel", onUp);

        const cell = pointerToCell(upEvent.clientX, upEvent.clientY, gridEl);
        const finalZone = resizeZoneFromPointer(
          zone,
          handle,
          cell.col,
          cell.row,
          gridCols,
          gridRows,
        );

        setPreview(null);
        setActiveHandle(null);
        onResizeCommit(finalZone);
      };

      gridEl.addEventListener("pointermove", onMove);
      gridEl.addEventListener("pointerup", onUp);
      gridEl.addEventListener("pointercancel", onUp);

      const cell = pointerToCell(event.clientX, event.clientY, gridEl);
      setPreview(
        resizeZoneFromPointer(
          zone,
          handle,
          cell.col,
          cell.row,
          gridCols,
          gridRows,
        ),
      );
    },
    [disabled, gridCols, gridRows, onResizeCommit, pointerToCell, zone],
  );

  return (
    <div
      className="relative z-[8] min-h-0 min-w-0"
      style={{
        gridColumn: `${display.col + 1} / span ${display.widthCells}`,
        gridRow: `${display.row + 1} / span ${display.heightCells}`,
      }}
    >
      <div
        className={`pointer-events-none absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-md p-2 ${borderVisual.className} ${
          activeHandle ? "ring-2 ring-primary ring-offset-1" : ""
        }`}
        style={{
          backgroundColor: bedVisual.soilColor,
          backgroundImage: bedVisual.soilTexture,
          ...borderVisual.style,
        }}
      >
        <span className="rounded-md bg-black/25 px-2 py-1 text-center text-xs font-semibold leading-tight text-white shadow-sm sm:text-sm">
          {getZoneDisplayLabel(display)}
        </span>
      </div>

      {!disabled
        ? RESIZE_HANDLES.map(({ handle, className, cursor, title }) => (
            <div
              key={handle}
              role="separator"
              aria-orientation={
                handle === "n" || handle === "s" ? "horizontal" : "vertical"
              }
              title={title}
              onPointerDown={handleResizePointerDown(handle)}
              className={`absolute z-20 size-3 rounded-sm border-2 border-background bg-foreground/80 shadow-md touch-none hover:scale-110 hover:bg-primary ${className} ${cursor}`}
            />
          ))
        : null}
    </div>
  );
}
