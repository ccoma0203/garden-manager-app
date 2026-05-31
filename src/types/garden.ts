import type { PlantId, TreeGrowthStage } from "./plant";

export type { TreeGrowthStage };

/** Default measurement unit for outdoor spaces. */
export const DEFAULT_LENGTH_UNIT = "m" as const;

export type LengthUnit = typeof DEFAULT_LENGTH_UNIT | "cm";

export type GardenShape = "rectangle" | "l-shape" | "custom";

/** Position on the garden grid (top-left cell of a tile or zone). */
export type GridPosition = {
  col: number;
  row: number;
};

export type ZoneColorId =
  | "emerald"
  | "amber"
  | "sky"
  | "rose"
  | "violet"
  | "lime";

export type BedType = "vegetable" | "flower" | "tree";

export type BorderStyle =
  | "default"
  | "wooden_fence"
  | "brick_wall"
  | "stone_edge";

/** Rectangular bed / zone on the garden grid. */
export type GardenZone = {
  id: string;
  name: string;
  /** @deprecated Legacy accent; visuals use bedType. */
  colorId: ZoneColorId;
  bedType: BedType;
  borderStyle: BorderStyle;
  col: number;
  row: number;
  widthCells: number;
  heightCells: number;
};

export type PlacedItemKind = "plant" | "tool";

export type PlacedItem = {
  id: string;
  kind: PlacedItemKind;
  /** Catalog plant id when kind is "plant". */
  plantId?: PlantId;
  /** Catalog tool id when kind is "tool". */
  toolId?: string;
  position: GridPosition;
  rotation?: number;
  /** Set for trees; defaults to mature when loading legacy saves. */
  growthStage?: TreeGrowthStage;
};

export type GardenDimensions = {
  width: number;
  height: number;
  unit: LengthUnit;
};

export type Garden = {
  id: string;
  name: string;
  shape: GardenShape;
  dimensions: GardenDimensions;
  /** Optional background photo (local URL or remote). */
  photoUrl?: string;
  zones: GardenZone[];
  items: PlacedItem[];
  createdAt: string;
  updatedAt: string;
};

export type CreateGardenInput = {
  name: string;
  shape?: GardenShape;
  width: number;
  height: number;
  unit?: LengthUnit;
  photoUrl?: string;
};

export function createGardenId(): string {
  return crypto.randomUUID();
}

export function createGarden(input: CreateGardenInput): Garden {
  const now = new Date().toISOString();
  return {
    id: createGardenId(),
    name: input.name,
    shape: input.shape ?? "rectangle",
    dimensions: {
      width: input.width,
      height: input.height,
      unit: input.unit ?? DEFAULT_LENGTH_UNIT,
    },
    photoUrl: input.photoUrl,
    zones: [],
    items: [],
    createdAt: now,
    updatedAt: now,
  };
}
