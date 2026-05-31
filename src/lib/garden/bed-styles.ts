import type { CSSProperties } from "react";

import type { BedType, BorderStyle, GardenZone } from "@/types/garden";

export const BED_TYPE_OPTIONS: {
  value: BedType;
  label: string;
  emoji: string;
}[] = [
  { value: "vegetable", label: "Vegetable", emoji: "🥕" },
  { value: "flower", label: "Flower", emoji: "🌸" },
  { value: "tree", label: "Tree", emoji: "🌳" },
];

export const BORDER_STYLE_OPTIONS: {
  value: BorderStyle;
  label: string;
  emoji: string;
}[] = [
  { value: "default", label: "Default", emoji: "▫️" },
  { value: "wooden_fence", label: "Wooden Fence", emoji: "🪵" },
  { value: "brick_wall", label: "Brick Wall", emoji: "🧱" },
  { value: "stone_edge", label: "Stone Edge", emoji: "🪨" },
];

export type BedTypeVisual = {
  soilColor: string;
  soilTexture: string;
  typeLabel: string;
};

export const BED_TYPE_VISUALS: Record<BedType, BedTypeVisual> = {
  vegetable: {
    soilColor: "#8B5E3C",
    soilTexture:
      "repeating-linear-gradient(135deg, rgba(0,0,0,0.06) 0 2px, transparent 2px 6px)",
    typeLabel: "🥕 Vegetable",
  },
  flower: {
    soilColor: "#D4A96A",
    soilTexture:
      "repeating-linear-gradient(90deg, rgba(255,255,255,0.12) 0 3px, transparent 3px 8px)",
    typeLabel: "🌸 Flower",
  },
  tree: {
    soilColor: "#5C3D1E",
    soilTexture:
      "repeating-linear-gradient(45deg, rgba(0,0,0,0.08) 0 1px, transparent 1px 5px)",
    typeLabel: "🌳 Tree",
  },
};

export type BorderStyleVisual = {
  className: string;
  style?: CSSProperties;
};

export function getBedVisual(bedType: BedType): BedTypeVisual {
  return BED_TYPE_VISUALS[bedType] ?? BED_TYPE_VISUALS.vegetable;
}

export function getBorderVisual(borderStyle: BorderStyle): BorderStyleVisual {
  switch (borderStyle) {
    case "wooden_fence":
      return {
        className: "border-[3px] border-dashed",
        style: { borderColor: "#8B6914" },
      };
    case "brick_wall":
      return {
        className: "border-[4px] border-solid",
        style: { borderColor: "#B33A3A" },
      };
    case "stone_edge":
      return {
        className: "border-[3px] border-dotted",
        style: { borderColor: "#6B7280" },
      };
    case "default":
    default:
      return {
        className: "border-2 border-solid border-white/50",
        style: undefined,
      };
  }
}

export function getZoneDisplayLabel(zone: GardenZone): string {
  const typeLabel = getBedVisual(zone.bedType).typeLabel;
  return zone.name ? `${typeLabel} · ${zone.name}` : typeLabel;
}
