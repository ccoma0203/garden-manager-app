import {
  DEFAULT_LENGTH_UNIT,
  type Garden,
  type GardenDimensions,
  type GardenShape,
  type GridPosition,
  type LengthUnit,
  type PlacedItem,
  type PlacedItemKind,
} from "@/types/garden";

const VALID_SHAPES: GardenShape[] = ["rectangle", "l-shape", "custom"];
const VALID_UNITS: LengthUnit[] = ["m", "cm"];
const VALID_KINDS: PlacedItemKind[] = ["plant", "tool"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function parseGridPosition(value: unknown): GridPosition | null {
  if (!isRecord(value)) return null;
  if (!isFiniteNumber(value.col) || !isFiniteNumber(value.row)) return null;
  if (value.col < 0 || value.row < 0) return null;
  return {
    col: Math.floor(value.col),
    row: Math.floor(value.row),
  };
}

function parsePlacedItem(value: unknown): PlacedItem | null {
  if (!isRecord(value)) return null;
  if (!isNonEmptyString(value.id)) return null;
  if (typeof value.kind !== "string" || !VALID_KINDS.includes(value.kind as PlacedItemKind)) {
    return null;
  }

  const position = parseGridPosition(value.position);
  if (!position) return null;

  const item: PlacedItem = {
    id: value.id.trim(),
    kind: value.kind as PlacedItemKind,
    position,
  };

  if (value.plantId !== undefined) {
    if (!isNonEmptyString(value.plantId)) return null;
    item.plantId = value.plantId.trim();
  }

  if (value.toolId !== undefined) {
    if (!isNonEmptyString(value.toolId)) return null;
    item.toolId = value.toolId.trim();
  }

  if (value.rotation !== undefined) {
    if (!isFiniteNumber(value.rotation)) return null;
    item.rotation = value.rotation;
  }

  return item;
}

function parseDimensions(value: unknown): GardenDimensions | null {
  if (!isRecord(value)) return null;
  if (!isFiniteNumber(value.width) || !isFiniteNumber(value.height)) return null;
  if (value.width <= 0 || value.height <= 0) return null;

  const unit = value.unit ?? DEFAULT_LENGTH_UNIT;
  if (typeof unit !== "string" || !VALID_UNITS.includes(unit as LengthUnit)) {
    return null;
  }

  return {
    width: value.width,
    height: value.height,
    unit: unit as LengthUnit,
  };
}

/** Validate and normalize a raw object from localStorage into a Garden. */
export function parseGarden(value: unknown): Garden | null {
  if (!isRecord(value)) return null;
  if (!isNonEmptyString(value.id)) return null;
  if (typeof value.name !== "string") return null;

  const dimensions = parseDimensions(value.dimensions);
  if (!dimensions) return null;

  const shape = (value.shape ?? "rectangle") as GardenShape;
  if (!VALID_SHAPES.includes(shape)) return null;

  if (!Array.isArray(value.items)) return null;

  const items: PlacedItem[] = [];
  for (const rawItem of value.items) {
    const item = parsePlacedItem(rawItem);
    if (!item) return null;
    items.push(item);
  }

  const now = new Date().toISOString();
  const createdAt =
    typeof value.createdAt === "string" ? value.createdAt : now;
  const updatedAt =
    typeof value.updatedAt === "string" ? value.updatedAt : createdAt;

  const garden: Garden = {
    id: value.id.trim(),
    name: value.name.trim() || "Untitled garden",
    shape,
    dimensions,
    items,
    createdAt,
    updatedAt,
  };

  if (typeof value.photoUrl === "string" && value.photoUrl.trim()) {
    garden.photoUrl = value.photoUrl.trim();
  }

  return garden;
}

export function parseGardenList(value: unknown): Garden[] {
  if (!Array.isArray(value)) return [];

  const gardens: Garden[] = [];
  for (const entry of value) {
    const garden = parseGarden(entry);
    if (garden) gardens.push(garden);
  }

  return gardens;
}

export function countGardenPlants(garden: Garden): number {
  return garden.items.filter((item) => item.kind === "plant").length;
}
