import { DEFAULT_ZONE_COLOR_ID } from "@/lib/garden/zones";
import {
  DEFAULT_LENGTH_UNIT,
  type Garden,
  type GardenDimensions,
  type GardenShape,
  type BedType,
  type BorderStyle,
  type GardenZone,
  type GridPosition,
  type LengthUnit,
  type PlacedItem,
  type PlacedItemKind,
  type ZoneColorId,
} from "@/types/garden";
import type { TreeGrowthStage } from "@/types/plant";

const VALID_TREE_STAGES: TreeGrowthStage[] = ["seedling", "young", "mature"];

const VALID_SHAPES: GardenShape[] = ["rectangle", "l-shape", "custom"];
const VALID_UNITS: LengthUnit[] = ["m", "cm"];
const VALID_KINDS: PlacedItemKind[] = ["plant", "tool"];
const VALID_ZONE_COLORS: ZoneColorId[] = [
  "emerald",
  "amber",
  "sky",
  "rose",
  "violet",
  "lime",
];
const VALID_BED_TYPES: BedType[] = ["vegetable", "flower", "tree"];
const VALID_BORDER_STYLES: BorderStyle[] = [
  "default",
  "wooden_fence",
  "brick_wall",
  "stone_edge",
];

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

  if (value.growthStage !== undefined) {
    if (
      typeof value.growthStage !== "string" ||
      !VALID_TREE_STAGES.includes(value.growthStage as TreeGrowthStage)
    ) {
      return null;
    }
    item.growthStage = value.growthStage as TreeGrowthStage;
  }

  if (typeof value.shelfId === "string") {
    item.shelfId = value.shelfId;
  }

  if (typeof value.slotIndex === "number") {
    item.slotIndex = value.slotIndex;
  }

  return item;
}

function parseGardenZone(value: unknown): GardenZone | null {
  if (!isRecord(value)) return null;
  if (!isNonEmptyString(value.id)) return null;
  if (typeof value.name !== "string") return null;

  const colorId = (value.colorId ?? DEFAULT_ZONE_COLOR_ID) as ZoneColorId;
  if (!VALID_ZONE_COLORS.includes(colorId)) return null;

  const bedType = (value.bedType ?? "vegetable") as BedType;
  if (!VALID_BED_TYPES.includes(bedType)) return null;

  const borderStyle = (value.borderStyle ?? "default") as BorderStyle;
  if (!VALID_BORDER_STYLES.includes(borderStyle)) return null;

  if (
    !isFiniteNumber(value.col) ||
    !isFiniteNumber(value.row) ||
    !isFiniteNumber(value.widthCells) ||
    !isFiniteNumber(value.heightCells)
  ) {
    return null;
  }

  if (
    value.col < 0 ||
    value.row < 0 ||
    value.widthCells < 1 ||
    value.heightCells < 1
  ) {
    return null;
  }

  return {
    id: value.id.trim(),
    name: value.name.trim() || "Bed",
    colorId,
    bedType,
    borderStyle,
    col: Math.floor(value.col),
    row: Math.floor(value.row),
    widthCells: Math.floor(value.widthCells),
    heightCells: Math.floor(value.heightCells),
  };
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

  const zones: GardenZone[] = [];
  if (value.zones !== undefined) {
    if (!Array.isArray(value.zones)) return null;
    for (const rawZone of value.zones) {
      const zone = parseGardenZone(rawZone);
      if (!zone) return null;
      zones.push(zone);
    }
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
    zones,
    items,
    createdAt,
    updatedAt,
  };

  if (typeof value.photoUrl === "string" && value.photoUrl.trim()) {
    garden.photoUrl = value.photoUrl.trim();
  }

  if (typeof value.environment === "string" &&
    ["outdoor", "balcony", "indoor"].includes(value.environment)) {
    garden.environment = value.environment as import("@/types/garden").GardenEnvironment;
  } else {
    garden.environment = "outdoor";
  }

  if (Array.isArray(value.shelves)) {
    garden.shelves = value.shelves
      .filter((s: unknown) => {
        if (typeof s !== "object" || s === null) return false;
        const shelf = s as Record<string, unknown>;
        return typeof shelf.id === "string" && typeof shelf.name === "string";
      })
      .map((s: unknown) => {
        const shelf = s as Record<string, unknown>;
        return {
          id: String(shelf.id),
          name: String(shelf.name),
          shelfType: (["window", "shelf", "table", "floor"].includes(String(shelf.shelfType))
            ? shelf.shelfType
            : "shelf") as import("@/types/garden").IndoorShelf["shelfType"],
          capacity: typeof shelf.capacity === "number" ? shelf.capacity : 4,
        };
      });
  }

  const VALID_GROUND_COVERS = ["bare-soil", "lawn", "weed-mat", "gravel"];
  if (typeof value.groundCover === "string" && VALID_GROUND_COVERS.includes(value.groundCover)) {
    garden.groundCover = value.groundCover as import("@/types/garden").GroundCoverType;
  } else {
    garden.groundCover = "bare-soil";
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
