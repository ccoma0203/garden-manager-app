"use client";

import { useState } from "react";
import { PLANT_CATALOG } from "@/lib/plants/catalog";

const CATEGORIES = [
  { id: "vegetable", label: "채소", emoji: "🥕" },
  { id: "flower", label: "꽃", emoji: "🌸" },
  { id: "tree", label: "나무", emoji: "🌳" },
] as const;

export default function MobilePlantsPage() {
  const [category, setCategory] = useState<"vegetable" | "flower" | "tree">("vegetable");

  const plants = PLANT_CATALOG.filter((p) => p.category === category);

  return (
    <div className="flex flex-col">
      <div className="bg-background px-4 pt-12 pb-4 border-b border-border">
        <h1 className="text-2xl font-semibold">식물 도감</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{PLANT_CATALOG.length}종의 식물</p>
      </div>

      <div className="flex gap-2 px-4 py-3 border-b border-border">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setCategory(cat.id)}
            className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${
              category === cat.id
                ? "bg-green-600 text-white"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {cat.emoji} {cat.label}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2 px-4 py-3">
        {plants.map((plant) => (
          <div
            key={plant.id}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3"
          >
            <span className="text-2xl">{plant.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{plant.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {plant.sun === "full" ? "양지" : plant.sun === "partial" ? "반양지" : "음지"} ·{" "}
                {plant.water === "high" ? "물 많이" : plant.water === "medium" ? "물 보통" : "물 적게"}
              </div>
            </div>
            {plant.buyUrl ? (
              <a
                href={plant.buyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-lg bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700"
              >
                구매
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
