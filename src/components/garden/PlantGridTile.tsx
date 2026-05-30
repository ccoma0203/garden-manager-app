import { cn } from "@/lib/utils";
import { getPlantTileColor } from "@/lib/garden/plant-tiles";
import type { PlantId } from "@/types/plant";

type PlantGridTileProps = {
  label: string;
  plantId?: PlantId;
  className?: string;
};

export function PlantGridTile({
  label,
  plantId,
  className,
}: PlantGridTileProps) {
  const colorClass = plantId
    ? getPlantTileColor(plantId)
    : "bg-primary text-primary-foreground";

  return (
    <div
      className={cn(
        "flex size-full min-h-0 min-w-0 items-center justify-center overflow-hidden rounded-lg border-2 border-white/40 px-2 py-1.5 text-center shadow-md",
        colorClass,
        className,
      )}
    >
      <span className="text-sm font-semibold leading-snug tracking-tight sm:text-base">
        {label}
      </span>
    </div>
  );
}
