"use client";

import { useState, useCallback } from "react";
import { Plus, Trash2 } from "lucide-react";
import { SaveIndicator } from "@/components/garden/SaveIndicator";
import { PlantPalette } from "@/components/garden/PlantPalette";
import { CareAlertsPanel } from "@/components/garden/CareAlertsPanel";
import { RegionSettings } from "@/components/garden/RegionSettings";
import { useRegion } from "@/hooks/useRegion";
import { useWeather } from "@/hooks/useWeather";
import type { Garden, IndoorShelf, PlacedItem } from "@/types/garden";
import type { CustomPlantDraft } from "@/lib/plants/custom-plant";
import type { Plant } from "@/types/plant";
import { getPlantById } from "@/lib/plants/registry";

const SHELF_TYPES: { id: IndoorShelf["shelfType"]; label: string; emoji: string }[] = [
  { id: "window", label: "창가", emoji: "🪟" },
  { id: "shelf", label: "선반", emoji: "🗄️" },
  { id: "table", label: "테이블", emoji: "🪵" },
  { id: "floor", label: "바닥", emoji: "⬜" },
];

type IndoorEditorWorkspaceProps = {
  garden: Garden;
  onItemsChange: (items: PlacedItem[]) => void;
  onShelvesChange: (shelves: IndoorShelf[]) => void;
  justSaved?: boolean;
  customPlants: Plant[];
  onSaveCustomPlant: (draft: CustomPlantDraft) => void;
  onDeleteCustomPlant: (id: string) => void;
};

export function IndoorEditorWorkspace({
  garden,
  onItemsChange,
  onShelvesChange,
  justSaved = false,
  customPlants,
  onSaveCustomPlant,
  onDeleteCustomPlant,
}: IndoorEditorWorkspaceProps) {
  const shelves = garden.shelves ?? [];
  const items = garden.items ?? [];

  const [selectedShelfId, setSelectedShelfId] = useState<string | null>(
    shelves[0]?.id ?? null,
  );
  const [addingShelf, setAddingShelf] = useState(false);
  const [newShelfName, setNewShelfName] = useState("");
  const [newShelfType, setNewShelfType] = useState<IndoorShelf["shelfType"]>("window");
  const [newShelfCapacity, setNewShelfCapacity] = useState(4);

  const { region, updateRegion } = useRegion();
  const { weather } = useWeather(region);

  const plantsOnShelf = useCallback(
    (shelfId: string) =>
      items.filter((item) => item.kind === "plant" && (item as any).shelfId === shelfId),
    [items],
  );

  const handleAddShelf = () => {
    const shelf: IndoorShelf = {
      id: crypto.randomUUID(),
      name: newShelfName.trim() || "새 선반",
      shelfType: newShelfType,
      capacity: newShelfCapacity,
    };
    const updated = [...shelves, shelf];
    onShelvesChange(updated);
    setSelectedShelfId(shelf.id);
    setAddingShelf(false);
    setNewShelfName("");
  };

  const handleDeleteShelf = (shelfId: string) => {
    onShelvesChange(shelves.filter((s) => s.id !== shelfId));
    onItemsChange(items.filter((item) => (item as any).shelfId !== shelfId));
    if (selectedShelfId === shelfId) setSelectedShelfId(shelves[0]?.id ?? null);
  };

  const handlePlacePlant = (plant: Plant) => {
    if (!selectedShelfId) return;
    const shelf = shelves.find((s) => s.id === selectedShelfId);
    if (!shelf) return;
    const onShelf = plantsOnShelf(selectedShelfId);
    if (onShelf.length >= shelf.capacity) {
      alert(`이 선반은 최대 ${shelf.capacity}개의 화분만 놓을 수 있어요!`);
      return;
    }
    const newItem: PlacedItem & { shelfId: string; slotIndex: number } = {
      id: crypto.randomUUID(),
      kind: "plant",
      plantId: plant.id,
      position: { col: onShelf.length, row: 0 },
      shelfId: selectedShelfId,
      slotIndex: onShelf.length,
    };
    onItemsChange([...items, newItem as any]);
  };

  const handleRemovePlant = (itemId: string) => {
    onItemsChange(items.filter((item) => item.id !== itemId));
  };

  const selectedShelf = shelves.find((s) => s.id === selectedShelfId);

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{garden.name}</h1>
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
            {garden.environment === "indoor" ? "🏠 실내" : "🪴 베란다"}
          </span>
          <SaveIndicator visible={justSaved} />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          선반이나 창가를 추가하고 화분을 배치해보세요.
        </p>

        <div className="mt-6 flex flex-col gap-4">
          {shelves.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-16 text-center">
              <p className="text-2xl mb-2">🪴</p>
              <p className="text-sm font-medium text-muted-foreground">
                아직 선반이 없어요
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                오른쪽에서 선반을 추가해보세요
              </p>
            </div>
          ) : (
            shelves.map((shelf) => {
              const shelfType = SHELF_TYPES.find((t) => t.id === shelf.shelfType);
              const plants = plantsOnShelf(shelf.id);
              const isSelected = selectedShelfId === shelf.id;

              return (
                <div
                  key={shelf.id}
                  onClick={() => setSelectedShelfId(shelf.id)}
                  className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
                    isSelected
                      ? "border-green-500 bg-green-50"
                      : "border-border bg-card hover:border-green-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{shelfType?.emoji}</span>
                      <span className="font-medium text-sm">{shelf.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {plants.length}/{shelf.capacity} 화분
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleDeleteShelf(shelf.id); }}
                      className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 min-h-[60px]">
                    {Array.from({ length: shelf.capacity }).map((_, i) => {
                      const plant = plants[i];
                      const plantData = plant?.plantId ? getPlantById(plant.plantId) : undefined;
                      return (
                        <div
                          key={i}
                          className="relative flex flex-col items-center justify-center w-14 h-14 rounded-xl border-2 border-dashed border-border bg-background"
                        >
                          {plantData ? (
                            <>
                              <span className="text-2xl">{plantData.emoji ?? "🌱"}</span>
                              <span className="text-[9px] text-center leading-tight text-muted-foreground truncate w-full px-0.5">
                                {plantData.name}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleRemovePlant(plant.id); }}
                                className="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                              >
                                <span className="text-[10px]">×</span>
                              </button>
                            </>
                          ) : (
                            <span className="text-muted-foreground/30 text-2xl">🪴</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <aside className="flex w-full shrink-0 flex-col gap-6 lg:w-80">
        <section>
          <h2 className="mb-1 text-sm font-medium">선반 추가</h2>
          {addingShelf ? (
            <div className="flex flex-col gap-3 rounded-xl border border-border p-3">
              <input
                value={newShelfName}
                onChange={(e) => setNewShelfName(e.target.value)}
                placeholder="선반 이름 (예: 거실 창가)"
                className="rounded-lg border border-input bg-background px-3 py-2 text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                {SHELF_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setNewShelfType(t.id)}
                    className={`flex items-center gap-1.5 rounded-lg border px-2 py-1.5 text-xs font-medium transition-all ${
                      newShelfType === t.id
                        ? "border-green-600 bg-green-50 text-green-800"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <span>{t.emoji}</span> {t.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">화분 수:</span>
                {[2, 4, 6, 8].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setNewShelfCapacity(n)}
                    className={`rounded-md px-2 py-0.5 text-xs font-medium transition-all ${
                      newShelfCapacity === n
                        ? "bg-green-600 text-white"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAddShelf}
                  className="flex-1 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  추가
                </button>
                <button
                  type="button"
                  onClick={() => setAddingShelf(false)}
                  className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:bg-muted"
                >
                  취소
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setAddingShelf(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3 text-sm text-muted-foreground hover:border-green-400 hover:text-green-700 transition-colors"
            >
              <Plus className="size-4" />
              새 선반 추가
            </button>
          )}
        </section>

        <section>
          <h2 className="mb-1 text-sm font-medium">식물 팔레트</h2>
          <p className="mb-3 text-xs text-muted-foreground">
            {selectedShelf
              ? `"${selectedShelf.name}"에 식물을 추가해요`
              : "선반을 먼저 선택해주세요"}
          </p>
          <PlantPalette
            onSelectPlant={handlePlacePlant}
            disabled={!selectedShelfId}
            disabledMessage="선반을 먼저 선택하거나 추가해주세요."
            customPlants={customPlants}
            onSaveCustomPlant={onSaveCustomPlant}
            onDeleteCustomPlant={onDeleteCustomPlant}
          />
        </section>

        <section>
          <h2 className="mb-1 text-sm font-medium">내 지역</h2>
          <RegionSettings region={region} onRegionChange={updateRegion} />
        </section>

        <section>
          <h2 className="mb-1 text-sm font-medium">케어 알림</h2>
          <p className="mb-3 text-xs text-muted-foreground">
            실내 식물 기반 맞춤 알림이에요.
          </p>
          <CareAlertsPanel
            items={items}
            zones={[]}
            region={region}
            weather={weather}
            weatherLoading={false}
            indoorMode={true}
          />
        </section>
      </aside>
    </div>
  );
}
