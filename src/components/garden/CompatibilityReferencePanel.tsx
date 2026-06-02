"use client";

import { useMemo, useState } from "react";

import { formatNeighborList } from "@/lib/garden/compatibility";
import { PLANT_CATALOG, toPlant } from "@/lib/plants/catalog";
import type { PlantCategory } from "@/types/plant";

const FILTER_TABS: { id: "all" | PlantCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "vegetable", label: "Vegetables" },
  { id: "flower", label: "Flowers" },
  { id: "tree", label: "Trees" },
];

export function CompatibilityReferencePanel() {
  const [expanded, setExpanded] = useState(false);
  const [filter, setFilter] = useState<"all" | PlantCategory>("all");

  const rows = useMemo(() => {
    return PLANT_CATALOG.map(toPlant)
      .filter((plant) => {
        const hasRules =
          (plant.goodNeighbors?.length ?? 0) > 0 ||
          (plant.badNeighbors?.length ?? 0) > 0;
        if (!hasRules) return false;
        if (filter === "all") return true;
        return plant.category === filter;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [filter]);

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="w-full rounded-lg border border-dashed border-border px-3 py-2 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        📋 Compatibility reference ({PLANT_CATALOG.filter((p) => {
          const plant = toPlant(p);
          return (
            (plant.goodNeighbors?.length ?? 0) > 0 ||
            (plant.badNeighbors?.length ?? 0) > 0
          );
        }).length}{" "}
        plants)
      </button>
    );
  }

  return (
    <section className="rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <h3 className="text-sm font-medium">Compatibility</h3>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-xs text-muted-foreground hover:text-foreground"
        >
          Hide
        </button>
      </div>

      <div className="flex gap-1 border-b border-border p-1">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`rounded-md px-2 py-1 text-[10px] font-medium sm:text-xs ${
              filter === tab.id
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="max-h-56 overflow-auto">
        <table className="w-full text-left text-[11px] sm:text-xs">
          <thead className="sticky top-0 bg-card">
            <tr className="border-b border-border text-muted-foreground">
              <th className="px-3 py-1.5 font-medium">Plant</th>
              <th className="px-2 py-1.5 font-medium">✅ Good</th>
              <th className="px-2 py-1.5 font-medium">❌ Avoid</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((plant) => (
              <tr
                key={plant.id}
                className="border-b border-border/60 align-top last:border-0"
              >
                <td className="px-3 py-2 font-medium whitespace-nowrap">
                  <span aria-hidden>{plant.emoji}</span> {plant.name}
                </td>
                <td className="px-2 py-2 text-muted-foreground">
                  {formatNeighborList(plant.goodNeighbors ?? [])}
                </td>
                <td className="px-2 py-2 text-muted-foreground">
                  {formatNeighborList(plant.badNeighbors ?? [])}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? (
          <p className="px-3 py-4 text-center text-xs text-muted-foreground">
            No compatibility rules for this category.
          </p>
        ) : null}
      </div>
    </section>
  );
}
