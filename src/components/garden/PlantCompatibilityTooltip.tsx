"use client";

import { formatNeighborList } from "@/lib/garden/compatibility";
import type { Plant } from "@/types/plant";

type PlantCompatibilityTooltipProps = {
  plant: Plant;
  visible: boolean;
  className?: string;
};

export function PlantCompatibilityTooltip({
  plant,
  visible,
  className = "",
}: PlantCompatibilityTooltipProps) {
  if (!visible) return null;

  const good = plant.goodNeighbors ?? [];
  const bad = plant.badNeighbors ?? [];

  return (
    <div
      role="tooltip"
      className={`pointer-events-none absolute bottom-full left-1/2 z-40 mb-2 w-max max-w-[min(16rem,90vw)] -translate-x-1/2 rounded-lg border border-border bg-popover px-3 py-2 text-left text-xs shadow-lg ${className}`}
    >
      <p className="mb-1.5 font-semibold text-foreground">
        {plant.emoji} {plant.name}
      </p>
      <p className="leading-relaxed text-muted-foreground">
        <span className="text-emerald-700 dark:text-emerald-400">✅ Good:</span>{" "}
        {formatNeighborList(good)}
      </p>
      <p className="mt-1 leading-relaxed text-muted-foreground">
        <span className="text-amber-700 dark:text-amber-400">❌ Avoid:</span>{" "}
        {formatNeighborList(bad)}
      </p>
      <span
        className="absolute top-full left-1/2 -mt-px size-2 -translate-x-1/2 rotate-45 border-r border-b border-border bg-popover"
        aria-hidden
      />
    </div>
  );
}
