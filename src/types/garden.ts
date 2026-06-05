import type { PlantId, TreeGrowthStage } from "./plant";

export type { TreeGrowthStage };

export const DEFAULT_LENGTH_UNIT = "m" as const;

export type LengthUnit = typeof DEFAULT_LENGTH_UNIT | "cm";

export type GardenShape = "rectangle" | "l-shape" | "custom";

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

export type GroundCoverType = "bare-soil" | "lawn" | "weed-mat" | "gravel";

export type GardenZone = {
  id: string;
  name: string;
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
  plantId?: PlantId;
  toolId?: string;
  position: GridPosition;
  rotation?: number;
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
  photoUrl?: string;
  groundCover?: GroundCoverType;
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
    groundCover: "bare-soil",
    zones: [],
    items: [],
    createdAt: now,
    updatedAt: now,
  };
}
