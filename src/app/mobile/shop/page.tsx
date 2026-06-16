"use client";

import { TOOLS_CATALOG } from "@/lib/plants/tools-catalog";

const CATEGORY_LABELS: Record<string, string> = {
  water: "🚿 물주기",
  fertilizer: "🌱 비료",
  structure: "🏗️ 구조물",
  pot: "🪴 화분",
};

export default function MobileShopPage() {
  const categories = [...new Set(TOOLS_CATALOG.map((t) => t.category))];

  return (
    <div className="flex flex-col">
      <div className="bg-background px-4 pt-12 pb-4 border-b border-border">
        <h1 className="text-2xl font-semibold">쇼핑</h1>
        <p className="text-sm text-muted-foreground mt-0.5">가드닝 도구 & 식물 구매</p>
      </div>

      <div className="flex flex-col gap-6 px-4 py-4">
        {categories.map((cat) => (
          <div key={cat}>
            <h2 className="text-sm font-medium mb-2">
              {CATEGORY_LABELS[cat] ?? cat}
            </h2>
            <div className="flex flex-col gap-2">
              {TOOLS_CATALOG.filter((t) => t.category === cat).map((tool) => (
                <div
                  key={tool.id}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3"
                >
                  <span className="text-2xl">{tool.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{tool.name}</div>
                    {tool.description ? (
                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {tool.description}
                      </div>
                    ) : null}
                  </div>
                  {tool.buyUrl ? (
                    <a
                      href={tool.buyUrl}
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
        ))}
      </div>
    </div>
  );
}
