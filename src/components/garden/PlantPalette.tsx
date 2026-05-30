"use client";

import { SAMPLE_PLANTS, type Plant } from "@/types/plant";
import { getPlantTileColor } from "@/lib/garden/plant-tiles";

type PlantPaletteProps = {
  plants?: Plant[];
  onSelectPlant?: (plant: Plant) => void;
};

export function PlantPalette({
  plants = SAMPLE_PLANTS,
  onSelectPlant,
}: PlantPaletteProps) {
  return (
    <ul className="flex flex-col gap-2">
      {plants.map((plant) => {
        const swatchColor = getPlantTileColor(plant.id).split(" ")[0];

        return (
          <li key={plant.id}>
            <button
              type="button"
              onClick={() => onSelectPlant?.(plant)}
              className="flex w-full flex-col rounded-lg border border-border bg-card px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted"
            >
              <span className="flex items-center gap-2 font-medium">
                <span
                  className={`size-3 shrink-0 rounded-sm ${swatchColor}`}
                  aria-hidden
                />
                {plant.name}
              </span>
              <span className="mt-0.5 text-xs text-muted-foreground">
                {plant.sun} sun · {plant.water} water · ~{plant.spreadM} m spread
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
