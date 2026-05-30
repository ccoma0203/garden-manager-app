import type { GridPosition, PlacedItem } from "@/types/garden";
import type { Plant } from "@/types/plant";

/** Grid cells per metre (each cell = 0.2 m). Coarser grid = larger, readable tiles. */
export const CELLS_PER_METER = 5;

/** Minimum tile footprint so plant names stay readable on the canvas. */
export const MIN_PLANT_SPAN_CELLS = 3;

export function getGridSize(widthM: number, heightM: number) {
  return {
    cols: Math.max(1, Math.round(widthM * CELLS_PER_METER)),
    rows: Math.max(1, Math.round(heightM * CELLS_PER_METER)),
  };
}

/** Footprint in grid cells from spread in metres. */
export function getPlantSpanCells(spreadM: number): number {
  return Math.max(
    MIN_PLANT_SPAN_CELLS,
    Math.ceil(spreadM * CELLS_PER_METER),
  );
}

function occupies(
  col: number,
  row: number,
  span: number,
  occupied: Set<string>,
): boolean {
  for (let r = row; r < row + span; r++) {
    for (let c = col; c < col + span; c++) {
      if (occupied.has(`${c},${r}`)) return true;
    }
  }
  return false;
}

function markOccupied(
  col: number,
  row: number,
  span: number,
  occupied: Set<string>,
): void {
  for (let r = row; r < row + span; r++) {
    for (let c = col; c < col + span; c++) {
      occupied.add(`${c},${r}`);
    }
  }
}

function buildOccupancy(
  items: PlacedItem[],
  spanForItem: (item: PlacedItem) => number,
): Set<string> {
  const occupied = new Set<string>();
  for (const item of items) {
    const span = spanForItem(item);
    markOccupied(item.position.col, item.position.row, span, occupied);
  }
  return occupied;
}

export function canPlaceAt(
  col: number,
  row: number,
  span: number,
  cols: number,
  rows: number,
  occupied: Set<string>,
): boolean {
  if (col < 0 || row < 0 || col + span > cols || row + span > rows) return false;
  return !occupies(col, row, span, occupied);
}

function clampPosition(
  col: number,
  row: number,
  span: number,
  cols: number,
  rows: number,
): GridPosition {
  return {
    col: Math.max(0, Math.min(col, cols - span)),
    row: Math.max(0, Math.min(row, rows - span)),
  };
}

function* candidatePositionsFrom(
  startCol: number,
  startRow: number,
  cols: number,
  rows: number,
  span: number,
): Generator<GridPosition> {
  const maxCol = cols - span;
  const maxRow = rows - span;
  if (maxCol < 0 || maxRow < 0) return;

  const safeStartCol = Math.max(0, Math.min(startCol, maxCol));
  const safeStartRow = Math.max(0, Math.min(startRow, maxRow));
  yield { col: safeStartCol, row: safeStartRow };

  const maxRadius = Math.max(cols, rows);
  for (let radius = 1; radius <= maxRadius; radius++) {
    for (let dc = -radius; dc <= radius; dc++) {
      for (let dr = -radius; dr <= radius; dr++) {
        if (Math.abs(dc) !== radius && Math.abs(dr) !== radius) continue;
        const col = safeStartCol + dc;
        const row = safeStartRow + dr;
        if (col >= 0 && col <= maxCol && row >= 0 && row <= maxRow) {
          yield { col, row };
        }
      }
    }
  }

  for (let row = 0; row <= maxRow; row++) {
    for (let col = 0; col <= maxCol; col++) {
      yield { col, row };
    }
  }
}

export function findNextPlacement(
  cols: number,
  rows: number,
  span: number,
  existingItems: PlacedItem[],
  spanForItem: (item: PlacedItem) => number,
): GridPosition | null {
  const startCol = Math.floor((cols - span) / 2);
  const startRow = Math.floor((rows - span) / 2);
  return findPlacementNear(
    cols,
    rows,
    span,
    existingItems,
    spanForItem,
    { col: startCol, row: startRow },
  );
}

export function findPlacementNear(
  cols: number,
  rows: number,
  span: number,
  existingItems: PlacedItem[],
  spanForItem: (item: PlacedItem) => number,
  preferred: GridPosition,
): GridPosition | null {
  const occupied = buildOccupancy(existingItems, spanForItem);

  for (const position of candidatePositionsFrom(
    preferred.col,
    preferred.row,
    cols,
    rows,
    span,
  )) {
    if (canPlaceAt(position.col, position.row, span, cols, rows, occupied)) {
      return position;
    }
  }

  return null;
}

/** Map pointer position (relative to canvas) to a snapped top-left grid cell. */
export function gridPositionFromPointer(
  pointerX: number,
  pointerY: number,
  canvasWidth: number,
  canvasHeight: number,
  cols: number,
  rows: number,
  span: number,
): GridPosition {
  const cellW = canvasWidth / cols;
  const cellH = canvasHeight / rows;

  const col = Math.floor(pointerX / cellW - span / 2);
  const row = Math.floor(pointerY / cellH - span / 2);

  return clampPosition(col, row, span, cols, rows);
}

/** Resolve a snapped position when moving an existing tile (excludes self from collisions). */
export function resolveMovePosition(
  cols: number,
  rows: number,
  span: number,
  items: PlacedItem[],
  spanForItem: (item: PlacedItem) => number,
  movingItemId: string,
  preferred: GridPosition,
  fallback: GridPosition,
): GridPosition {
  const others = items.filter((item) => item.id !== movingItemId);
  const occupied = buildOccupancy(others, spanForItem);
  const clamped = clampPosition(
    preferred.col,
    preferred.row,
    span,
    cols,
    rows,
  );

  if (canPlaceAt(clamped.col, clamped.row, span, cols, rows, occupied)) {
    return clamped;
  }

  const near = findPlacementNear(
    cols,
    rows,
    span,
    others,
    spanForItem,
    clamped,
  );
  return near ?? fallback;
}

export function spanForPlacedItem(
  item: PlacedItem,
  getPlant: (id: string) => Plant | undefined,
): number {
  if (item.kind === "plant" && item.plantId) {
    const plant = getPlant(item.plantId);
    if (plant) return getPlantSpanCells(plant.spreadM);
  }
  return MIN_PLANT_SPAN_CELLS;
}

export function createPlacedPlant(
  plant: Plant,
  position: GridPosition,
): PlacedItem {
  return {
    id: crypto.randomUUID(),
    kind: "plant",
    plantId: plant.id,
    position,
  };
}
