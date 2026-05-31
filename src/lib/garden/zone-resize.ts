import type { GardenZone } from "@/types/garden";

import { zoneFitsOnGrid, zonesOverlap } from "./zones";

export const MIN_ZONE_CELLS = 2;

export type ResizeHandle =
  | "n"
  | "s"
  | "e"
  | "w"
  | "ne"
  | "nw"
  | "se"
  | "sw";

export const RESIZE_HANDLES: {
  handle: ResizeHandle;
  className: string;
  cursor: string;
  title: string;
}[] = [
  { handle: "nw", className: "left-0 top-0 -translate-x-1/2 -translate-y-1/2", cursor: "cursor-nwse-resize", title: "Resize top-left" },
  { handle: "n", className: "left-1/2 top-0 -translate-x-1/2 -translate-y-1/2", cursor: "cursor-ns-resize", title: "Resize top" },
  { handle: "ne", className: "right-0 top-0 translate-x-1/2 -translate-y-1/2", cursor: "cursor-nesw-resize", title: "Resize top-right" },
  { handle: "e", className: "right-0 top-1/2 translate-x-1/2 -translate-y-1/2", cursor: "cursor-ew-resize", title: "Resize right" },
  { handle: "se", className: "right-0 bottom-0 translate-x-1/2 translate-y-1/2", cursor: "cursor-nwse-resize", title: "Resize bottom-right" },
  { handle: "s", className: "left-1/2 bottom-0 -translate-x-1/2 translate-y-1/2", cursor: "cursor-ns-resize", title: "Resize bottom" },
  { handle: "sw", className: "left-0 bottom-0 -translate-x-1/2 translate-y-1/2", cursor: "cursor-nesw-resize", title: "Resize bottom-left" },
  { handle: "w", className: "left-0 top-1/2 -translate-x-1/2 -translate-y-1/2", cursor: "cursor-ew-resize", title: "Resize left" },
];

export function resizeZoneFromPointer(
  zone: GardenZone,
  handle: ResizeHandle,
  cellCol: number,
  cellRow: number,
  gridCols: number,
  gridRows: number,
): GardenZone {
  const min = MIN_ZONE_CELLS;
  let { col, row, widthCells, heightCells } = zone;
  const right = col + widthCells - 1;
  const bottom = row + heightCells - 1;

  const clampCol = (c: number) => Math.max(0, Math.min(gridCols - 1, c));
  const clampRow = (r: number) => Math.max(0, Math.min(gridRows - 1, r));
  const pointerCol = clampCol(cellCol);
  const pointerRow = clampRow(cellRow);

  switch (handle) {
    case "e":
      widthCells = Math.max(min, pointerCol - col + 1);
      break;
    case "w": {
      const newCol = Math.min(pointerCol, right - min + 1);
      widthCells = right - newCol + 1;
      col = newCol;
      break;
    }
    case "s":
      heightCells = Math.max(min, pointerRow - row + 1);
      break;
    case "n": {
      const newRow = Math.min(pointerRow, bottom - min + 1);
      heightCells = bottom - newRow + 1;
      row = newRow;
      break;
    }
    case "se":
      widthCells = Math.max(min, pointerCol - col + 1);
      heightCells = Math.max(min, pointerRow - row + 1);
      break;
    case "sw": {
      const newCol = Math.min(pointerCol, right - min + 1);
      widthCells = right - newCol + 1;
      col = newCol;
      heightCells = Math.max(min, pointerRow - row + 1);
      break;
    }
    case "ne":
      widthCells = Math.max(min, pointerCol - col + 1);
      row = Math.min(pointerRow, bottom - min + 1);
      heightCells = bottom - row + 1;
      break;
    case "nw": {
      const newCol = Math.min(pointerCol, right - min + 1);
      widthCells = right - newCol + 1;
      col = newCol;
      row = Math.min(pointerRow, bottom - min + 1);
      heightCells = bottom - row + 1;
      break;
    }
  }

  if (col + widthCells > gridCols) {
    widthCells = Math.max(min, gridCols - col);
  }
  if (row + heightCells > gridRows) {
    heightCells = Math.max(min, gridRows - row);
  }
  if (col + widthCells > gridCols) {
    col = Math.max(0, gridCols - widthCells);
  }
  if (row + heightCells > gridRows) {
    row = Math.max(0, gridRows - heightCells);
  }

  widthCells = Math.max(min, widthCells);
  heightCells = Math.max(min, heightCells);

  return { ...zone, col, row, widthCells, heightCells };
}

export function canApplyZoneResize(
  resized: GardenZone,
  allZones: GardenZone[],
  gridCols: number,
  gridRows: number,
): boolean {
  if (
    resized.widthCells < MIN_ZONE_CELLS ||
    resized.heightCells < MIN_ZONE_CELLS
  ) {
    return false;
  }
  if (!zoneFitsOnGrid(resized, gridCols, gridRows)) return false;
  return !allZones.some(
    (other) => other.id !== resized.id && zonesOverlap(resized, other),
  );
}
