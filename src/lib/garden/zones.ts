import type { BedType, GardenZone, GridPosition, PlacedItem } from "@/types/garden";
import type { Plant } from "@/types/plant";

export const ZONE_COLOR_PRESETS: Record<
  GardenZone["colorId"],
  { bg: string; border: string; label: string }
> = {
  emerald: {
    bg: "bg-emerald-500/25",
    border: "border-emerald-600",
    label: "Green",
  },
  amber: {
    bg: "bg-amber-500/25",
    border: "border-amber-600",
    label: "Amber",
  },
  sky: {
    bg: "bg-sky-500/25",
    border: "border-sky-600",
    label: "Blue",
  },
  rose: {
    bg: "bg-rose-500/25",
    border: "border-rose-600",
    label: "Rose",
  },
  violet: {
    bg: "bg-violet-500/25",
    border: "border-violet-600",
    label: "Violet",
  },
  lime: {
    bg: "bg-lime-500/25",
    border: "border-lime-600",
    label: "Lime",
  },
};

export const DEFAULT_ZONE_COLOR_ID: GardenZone["colorId"] = "emerald";

export function createZoneId(): string {
  return crypto.randomUUID();
}

export function cellInZone(
  col: number,
  row: number,
  zone: GardenZone,
): boolean {
  return (
    col >= zone.col &&
    col < zone.col + zone.widthCells &&
    row >= zone.row &&
    row < zone.row + zone.heightCells
  );
}

export function footprintFitsInZones(
  col: number,
  row: number,
  span: number,
  zones: GardenZone[],
): boolean {
  if (zones.length === 0) return false;

  for (let r = row; r < row + span; r++) {
    for (let c = col; c < col + span; c++) {
      const inZone = zones.some((zone) => cellInZone(c, r, zone));
      if (!inZone) return false;
    }
  }

  return true;
}

export function cellFromPointer(
  pointerX: number,
  pointerY: number,
  canvasWidth: number,
  canvasHeight: number,
  cols: number,
  rows: number,
): GridPosition {
  const cellW = canvasWidth / cols;
  const cellH = canvasHeight / rows;

  return {
    col: Math.max(0, Math.min(cols - 1, Math.floor(pointerX / cellW))),
    row: Math.max(0, Math.min(rows - 1, Math.floor(pointerY / cellH))),
  };
}

export function rectFromCorners(
  start: GridPosition,
  end: GridPosition,
): Pick<GardenZone, "col" | "row" | "widthCells" | "heightCells"> {
  const col = Math.min(start.col, end.col);
  const row = Math.min(start.row, end.row);
  return {
    col,
    row,
    widthCells: Math.abs(start.col - end.col) + 1,
    heightCells: Math.abs(start.row - end.row) + 1,
  };
}

export function zonesOverlap(a: GardenZone, b: GardenZone): boolean {
  if (a.id === b.id) return false;
  return !(
    a.col + a.widthCells <= b.col ||
    b.col + b.widthCells <= a.col ||
    a.row + a.heightCells <= b.row ||
    b.row + b.heightCells <= a.row
  );
}

export function zoneFitsOnGrid(
  zone: Pick<GardenZone, "col" | "row" | "widthCells" | "heightCells">,
  cols: number,
  rows: number,
  minCells = 1,
): boolean {
  return (
    zone.col >= 0 &&
    zone.row >= 0 &&
    zone.col + zone.widthCells <= cols &&
    zone.row + zone.heightCells <= rows &&
    zone.widthCells >= minCells &&
    zone.heightCells >= minCells
  );
}

export function itemIntersectsZone(
  item: PlacedItem,
  span: number,
  zone: GardenZone,
): boolean {
  const itemEndCol = item.position.col + span;
  const itemEndRow = item.position.row + span;
  const zoneEndCol = zone.col + zone.widthCells;
  const zoneEndRow = zone.row + zone.heightCells;

  return !(
    itemEndCol <= zone.col ||
    zoneEndCol <= item.position.col ||
    itemEndRow <= zone.row ||
    zoneEndRow <= item.position.row
  );
}

export function removeItemsInZone(
  items: PlacedItem[],
  zone: GardenZone,
  spanForItem: (item: PlacedItem) => number,
): PlacedItem[] {
  return items.filter((item) => {
    const span = spanForItem(item);
    return !itemIntersectsZone(item, span, zone);
  });
}

export function filterItemsToZones(
  items: PlacedItem[],
  zones: GardenZone[],
  spanForItem: (item: PlacedItem) => number,
  getPlant?: (id: string) => Plant | undefined,
): PlacedItem[] {
  if (zones.length === 0) return [];

  return items.filter((item) => {
    const span = spanForItem(item);
    let eligible = zones;

    if (item.kind === "plant" && item.plantId && getPlant) {
      const plant = getPlant(item.plantId);
      if (!plant) return false;
      eligible = zones.filter((zone) => zone.bedType === plant.category);
      if (eligible.length === 0) return false;
    }

    return footprintFitsInZones(
      item.position.col,
      item.position.row,
      span,
      eligible,
    );
  });
}

export function nextDefaultZoneName(
  zones: GardenZone[],
  bedType: BedType = "vegetable",
): string {
  const names = new Set(zones.map((z) => z.name.toLowerCase()));
  const byType: Record<BedType, string[]> = {
    vegetable: ["Vegetable Bed", "Herb Patch", "Kitchen Garden"],
    flower: ["Flower Bed", "Bloom Border", "Pollinator Patch"],
    tree: ["Tree Grove", "Orchard", "Shade Garden"],
  };

  for (const name of byType[bedType]) {
    if (!names.has(name.toLowerCase())) return name;
  }
  return `Bed ${zones.length + 1}`;
}

export function nextZoneColorId(zones: GardenZone[]): GardenZone["colorId"] {
  const ids = Object.keys(ZONE_COLOR_PRESETS) as GardenZone["colorId"][];
  return ids[zones.length % ids.length] ?? DEFAULT_ZONE_COLOR_ID;
}
