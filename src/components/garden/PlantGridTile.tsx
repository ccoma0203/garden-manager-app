import { cn } from "@/lib/utils";
import { getPlantTileColor } from "@/lib/garden/plant-tiles";
import { getPlantEmoji } from "@/lib/plants/registry";
import type { PlantCategory, PlantId } from "@/types/plant";

type PlantGridTileProps = {
  label: string;
  plantId?: PlantId;
  category?: PlantCategory;
  emoji?: string;
  /** e.g. "🌱 Seedling · 0.5m" for trees */
  subtitle?: string;
  className?: string;
};

export function PlantGridTile({
  label,
  plantId,
  category = "vegetable",
  emoji,
  subtitle,
  className,
}: PlantGridTileProps) {
  const colorClass = getPlantTileColor(plantId ?? "tomato", category);
  const displayEmoji = emoji ?? (plantId ? getPlantEmoji(plantId) : "🌱");

  return (
    <div
      className={cn(
        "flex size-full min-h-0 min-w-0 flex-col items-center justify-center gap-1.5 overflow-hidden rounded-2xl border border-white/30 px-2 py-2 text-center shadow-xl",
        colorClass,
        className,
      )}
    >
      <span
        className="text-4xl leading-none drop-shadow-sm sm:text-5xl"
        aria-hidden
      >
        {displayEmoji}
      </span>
      <span className="w-full text-xs font-semibold leading-tight sm:text-sm">
        {label}
      </span>
      {subtitle ? (
        <span className="w-full text-[10px] font-medium leading-tight text-white/90 sm:text-xs">
          {subtitle}
        </span>
      ) : null}
    </div>
  );
}
