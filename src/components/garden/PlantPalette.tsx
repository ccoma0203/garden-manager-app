"use client";

import { useMemo, useState } from "react";
import { Trash2 } from "lucide-react";

import { CustomPlantCreator } from "@/components/garden/CustomPlantCreator";
import {
  FLOWER_PLANTS,
  TREE_PLANTS,
  VEGETABLE_PLANTS,
} from "@/lib/plants/catalog";
import { getPlantsByCategory, isCustomPlantId } from "@/lib/plants/registry";
import type { CustomPlantDraft } from "@/lib/plants/custom-plant";
import type { Plant, PlantCategory } from "@/types/plant";

type PlantPaletteProps = {
  onSelectPlant?: (plant: Plant) => void;
  disabled?: boolean;
  disabledMessage?: string;
  customPlants: Plant[];
  onSaveCustomPlant: (draft: CustomPlantDraft) => void;
  onDeleteCustomPlant: (id: string) => void;
};

const TABS: { id: PlantCategory; label: string }[] = [
  { id: "vegetable", label: "Vegetables" },
  { id: "flower", label: "Flowers" },
  { id: "tree", label: "Trees" },
];

function builtinForTab(tab: PlantCategory): Plant[] {
  switch (tab) {
    case "flower":
      return FLOWER_PLANTS;
    case "tree":
      return TREE_PLANTS;
    case "vegetable":
    default:
      return VEGETABLE_PLANTS;
  }
}

export function PlantPalette({
  onSelectPlant,
  disabled = false,
  disabledMessage,
  customPlants,
  onSaveCustomPlant,
  onDeleteCustomPlant,
}: PlantPaletteProps) {
  const [tab, setTab] = useState<PlantCategory>("vegetable");

  const plants = useMemo(() => {
    const builtins = builtinForTab(tab);
    const custom = customPlants.filter((plant) => plant.category === tab);
    return [...builtins, ...custom];
  }, [tab, customPlants]);

  const customInTab = customPlants.filter((p) => p.category === tab);

  return (
    <div className="flex flex-col gap-3">
      <CustomPlantCreator
        disabled={disabled}
        onSave={(draft) => {
          onSaveCustomPlant(draft);
          if (draft.category) setTab(draft.category);
        }}
      />

      <div
        className="flex rounded-lg border border-border p-0.5"
        role="tablist"
        aria-label="Plant categories"
      >
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
              tab === id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {disabled && disabledMessage ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-xs text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          {disabledMessage}
        </p>
      ) : null}

      {customInTab.length > 0 ? (
        <p className="text-xs text-muted-foreground">
          Your custom plants ({customInTab.length}) appear below the built-in
          list.
        </p>
      ) : null}

      <ul className="flex max-h-[min(50vh,420px)] flex-col gap-2 overflow-y-auto" role="tabpanel">
        {plants.map((plant) => {
          const isCustom = plant.isCustom ?? isCustomPlantId(plant.id);
          return (
            <li key={plant.id}>
              <div className="flex gap-1">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={() => onSelectPlant?.(plant)}
                  className="flex min-w-0 flex-1 flex-col rounded-lg border border-border bg-card px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <span aria-hidden className="text-xl leading-none">
                      {plant.emoji ?? "🌱"}
                    </span>
                    {plant.name}
                    {isCustom ? (
                      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-normal text-muted-foreground">
                        Custom
                      </span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 text-xs text-muted-foreground">
                    {plant.category === "tree"
                      ? `${plant.sun} sun · ${plant.water} water · up to ${plant.heightM}m · starts 🌱 seedling`
                      : `${plant.sun} sun · ${plant.water} water · ~${plant.spreadM} m spread`}
                  </span>
                </button>
                {isCustom ? (
                  <button
                    type="button"
                    disabled={disabled}
                    title={`Remove ${plant.name} from palette`}
                    aria-label={`Delete custom plant ${plant.name}`}
                    onClick={() => onDeleteCustomPlant(plant.id)}
                    className="flex shrink-0 items-center justify-center rounded-lg border border-border px-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>

      <p className="text-[10px] text-muted-foreground">
        {getPlantsByCategory(tab).length} plants in {tab} tab
        {tab === "vegetable" || tab === "flower" || tab === "tree"
          ? " (built-in + custom)"
          : ""}
      </p>
    </div>
  );
}
