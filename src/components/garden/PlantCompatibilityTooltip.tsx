"use client";

import { formatNeighborList } from "@/lib/garden/compatibility";
import type { Plant } from "@/types/plant";

type PlantCompatibilityTooltipProps = {
  plant: Plant;
  visible: boolean;
  className?: string;
  /** 0~1 사이 값. 0이면 상단, 1이면 하단. 기본값 0.5 */
  gridRowRatio?: number;
};

export function PlantCompatibilityTooltip({
  plant,
  visible,
  className = "",
  gridRowRatio = 0.5,
}: PlantCompatibilityTooltipProps) {
  if (!visible) return null;

  const good = plant.goodNeighbors ?? [];
  const bad = plant.badNeighbors ?? [];

  // 상단 40% 이내면 아래로, 그 외엔 위로 표시
  const showBelow = gridRowRatio < 0.4;

  return (
    <div
      role="tooltip"
      className={`pointer-events-none absolute left-1/2 z-40 w-max max-w-[min(16rem,90vw)] -translate-x-1/2 rounded-lg border border-border bg-popover px-3 py-2 text-left text-xs shadow-lg ${
        showBelow ? "top-full mt-2" : "bottom-full mb-2"
      } ${className}`}
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
        className={`absolute left-1/2 -translate-x-1/2 size-2 rotate-45 border-border bg-popover ${
          showBelow
            ? "bottom-full -mb-px border-l border-t"
            : "top-full -mt-px border-r border-b"
        }`}
        aria-hidden
      />
    </div>
  );
}
