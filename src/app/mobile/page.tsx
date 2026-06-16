"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { loadGardens } from "@/lib/storage/gardens";
import { useWeather } from "@/hooks/useWeather";
import { useRegion } from "@/hooks/useRegion";
import type { Garden } from "@/types/garden";

function getGardenEmoji(garden: Garden) {
  if (garden.environment === "indoor") return "🏠";
  if (garden.environment === "balcony") return "🪴";
  return "🌳";
}

function getGardenBadge(garden: Garden) {
  if (garden.environment === "indoor") return { label: "실내", className: "bg-teal-50 text-teal-700" };
  if (garden.environment === "balcony") return { label: "베란다", className: "bg-amber-50 text-amber-700" };
  return { label: "야외", className: "bg-green-50 text-green-700" };
}

function getPlantSummary(garden: Garden) {
  const plants = garden.items.filter((item) => item.kind === "plant" && item.plantId);
  if (plants.length === 0) return "식물 없음";
  if (plants.length <= 5) return `식물 ${plants.length}개`;

  const uniquePlantIds = [...new Set(plants.slice(0, 3).map((p) => p.plantId))];
  return `${uniquePlantIds.length}종 외 ${plants.length - 3}개`;
}

export default function MobileHomePage() {
  const [gardens, setGardens] = useState<Garden[]>([]);
  const { region } = useRegion();
  const { weather } = useWeather(region);

  useEffect(() => {
    const { gardens: loaded } = loadGardens();
    setGardens(loaded);
  }, []);

  return (
    <div className="flex flex-col">
      <div className="bg-background px-4 pt-12 pb-4 border-b border-border">
        <h1 className="text-2xl font-semibold text-foreground">내 정원</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{gardens.length}개의 정원</p>
      </div>

      <div className="px-4 py-3">
        {region && weather ? (
          <div className="flex items-center gap-3 rounded-xl bg-green-50 dark:bg-green-950 px-3 py-2.5">
            <i className="ti ti-sun text-xl text-green-700 dark:text-green-400" aria-hidden="true" />
            <div className="flex-1 text-sm text-green-800 dark:text-green-200">
              {region.name} · {weather.days[0]?.tempMaxC !== undefined ? `최고 ${Math.round(weather.days[0].tempMaxC)}°C` : "날씨 로딩 중"}
            </div>
            <span className="text-sm font-medium text-green-800 dark:text-green-200">
              {Math.round(weather.currentTempC)}°C
            </span>
          </div>
        ) : (
          <Link
            href="/mobile/settings"
            className="flex items-center gap-3 rounded-xl border border-dashed border-border px-3 py-2.5"
          >
            <i className="ti ti-map-pin text-xl text-muted-foreground" aria-hidden="true" />
            <span className="text-sm text-muted-foreground">지역 설정하고 날씨 받기</span>
            <i className="ti ti-chevron-right ml-auto text-muted-foreground" aria-hidden="true" />
          </Link>
        )}
      </div>

      <div className="px-4 flex flex-col gap-3 pb-4">
        {gardens.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-16 text-center mt-4">
            <span className="text-4xl mb-3">🌱</span>
            <p className="text-sm font-medium text-muted-foreground">아직 정원이 없어요</p>
            <p className="text-xs text-muted-foreground mt-1">새 정원을 만들어보세요</p>
          </div>
        ) : (
          gardens.map((garden) => {
            const badge = getGardenBadge(garden);
            return (
              <Link
                key={garden.id}
                href={`/mobile/gardens/${garden.id}`}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5 active:bg-muted transition-colors"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-2xl">
                  {getGardenEmoji(garden)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-foreground truncate">{garden.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{getPlantSummary(garden)}</div>
                  <span className={`mt-1 inline-block text-[10px] font-medium px-2 py-0.5 rounded-full ${badge.className}`}>
                    {badge.label}
                  </span>
                </div>
                <i className="ti ti-chevron-right text-muted-foreground shrink-0" aria-hidden="true" />
              </Link>
            );
          })
        )}

        <Link
          href="/gardens/new"
          className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-4 text-sm text-muted-foreground active:bg-muted transition-colors"
        >
          <i className="ti ti-plus" aria-hidden="true" />
          새 정원 만들기
        </Link>
      </div>
    </div>
  );
}
