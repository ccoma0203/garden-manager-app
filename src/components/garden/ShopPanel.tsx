"use client";

import {
  TOOL_CATEGORY_LABELS,
  TOOLS_CATALOG,
  type ToolCategory,
} from "@/lib/plants/tools-catalog";

const CATEGORIES: ToolCategory[] = ["water", "fertilizer", "structure", "pot"];

function ShopPanel() {
  return (
    <div className="space-y-6 p-2">
      <p className="text-xs text-gray-400">
        🛒 링크는 새 탭에서 열립니다 · 쿠팡 파트너스 활동의 일환으로 수익이 발생할 수 있습니다
      </p>

      {CATEGORIES.map((cat) => {
        const { label, emoji } = TOOL_CATEGORY_LABELS[cat];
        const items = TOOLS_CATALOG.filter((t) => t.category === cat);
        return (
          <div key={cat}>
            <h3 className="text-sm font-bold text-gray-700 mb-2">
              {emoji} {label}
            </h3>
            <div className="space-y-2">
              {items.map((tool) => (
                <div
                  key={tool.id}
                  className="flex items-center justify-between bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{tool.emoji}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">
                        {tool.nameKo}
                        <span className="text-xs text-gray-400 font-normal ml-1">
                          {tool.name}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">{tool.description}</p>
                    </div>
                  </div>
                  <a
                    href={tool.buyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-3 shrink-0 text-xs bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    구매 →
                  </a>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default ShopPanel;
