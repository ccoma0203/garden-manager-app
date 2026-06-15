"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { DimensionForm } from "@/components/garden/DimensionForm";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { saveGarden } from "@/lib/storage/gardens";
import { createGarden, type GardenEnvironment } from "@/types/garden";

const ENVIRONMENT_OPTIONS: {
  id: GardenEnvironment;
  label: string;
  emoji: string;
  description: string;
}[] = [
  {
    id: "outdoor",
    label: "야외 정원",
    emoji: "🌳",
    description: "마당, 뒷정원 등 외부 공간",
  },
  {
    id: "balcony",
    label: "베란다",
    emoji: "🪴",
    description: "아파트 베란다, 테라스",
  },
  {
    id: "indoor",
    label: "실내 정원",
    emoji: "🏠",
    description: "거실, 방 등 실내 공간",
  },
];

export default function NewGardenPage() {
  const router = useRouter();
  const [name, setName] = useState("My garden");
  const [environment, setEnvironment] = useState<GardenEnvironment>("outdoor");

  function handleCreate(width: number, height: number) {
    const garden = createGarden({
      name: name.trim() || "My garden",
      width,
      height,
      environment,
    });
    const result = saveGarden(garden);
    if (!result.success) {
      window.alert(result.error);
      return;
    }
    router.push(`/gardens/${garden.id}`);
  }

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>New garden</CardTitle>
            <CardDescription>
              정원 환경과 크기를 설정해주세요. 환경에 따라 식물 추천과 케어 알림이 달라져요.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <label className="flex flex-col gap-1 text-sm">
              Garden name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-lg border border-input bg-background px-3 py-2"
                placeholder="Backyard bed"
              />
            </label>

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium">정원 환경</p>
              <div className="grid grid-cols-3 gap-2">
                {ENVIRONMENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setEnvironment(opt.id)}
                    className={`flex flex-col items-center gap-1 rounded-xl border-2 px-2 py-3 text-xs font-medium transition-all ${
                      environment === opt.id
                        ? "border-green-600 bg-green-50 text-green-800"
                        : "border-border bg-card text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="text-2xl">{opt.emoji}</span>
                    <span className="font-semibold">{opt.label}</span>
                    <span className="text-center text-[10px] leading-tight opacity-70">
                      {opt.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <DimensionForm onSubmit={handleCreate} />
            <Button
              type="button"
              className="w-full"
              onClick={() => handleCreate(4, 3)}
            >
              Use defaults (4 m × 3 m)
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
