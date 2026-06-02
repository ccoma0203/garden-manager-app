"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useCallback, useRef, useState } from "react";

import { CareAlertsPanel } from "@/components/garden/CareAlertsPanel";
import { GardenCanvas } from "@/components/garden/GardenCanvas";
import { RegionSettings } from "@/components/garden/RegionSettings";
import { WeatherWidget } from "@/components/garden/WeatherWidget";
import { PlantGridTile } from "@/components/garden/PlantGridTile";
import { PlantPalette } from "@/components/garden/PlantPalette";
import { SaveIndicator } from "@/components/garden/SaveIndicator";
import {
  ZoneManager,
  buildZoneFromRect,
} from "@/components/garden/ZoneManager";
import {
  CANVAS_DROPPABLE_ID,
  isPlacedDragData,
} from "@/lib/garden/dnd";
import { getBedVisual } from "@/lib/garden/bed-styles";
import {
  canExpandPlacedItemAt,
  createPlacedPlant,
  findNextPlacement,
  getGridSize,
  getPlantSpanCells,
  gridPositionFromPointer,
  resolveMovePosition,
  spanForPlacedItem,
  zonesForCategory,
} from "@/lib/garden/grid";
import {
  getNextTreeStage,
  getTreeGrowthStage,
  getTreeSpanCells,
} from "@/lib/garden/tree-growth";
import {
  canApplyZoneResize,
  MIN_ZONE_CELLS,
} from "@/lib/garden/zone-resize";
import {
  zoneFitsOnGrid,
  zonesOverlap,
} from "@/lib/garden/zones";
import { useRegion } from "@/hooks/useRegion";
import { useWeather } from "@/hooks/useWeather";
import type { BedType, BorderStyle, Garden, GardenZone, PlacedItem } from "@/types/garden";
import { getPlantById } from "@/lib/plants/registry";
import type { CustomPlantDraft } from "@/lib/plants/custom-plant";
import type { Plant } from "@/types/plant";

type GardenEditorWorkspaceProps = {
  garden: Garden;
  onItemsChange: (items: PlacedItem[]) => void;
  onZonesChange: (zones: GardenZone[]) => void;
  justSaved?: boolean;
  customPlants: Plant[];
  onSaveCustomPlant: (draft: CustomPlantDraft) => void;
  onDeleteCustomPlant: (id: string) => void;
};

type ActiveDrag =
  | {
      kind: "placed";
      item: PlacedItem;
      label: string;
      plantId?: string;
      emoji?: string;
      category?: Plant["category"];
    }
  | null;

function CanvasDropZone({
  garden,
  onRemoveItem,
  onGrowItem,
  isDropTarget,
  setCanvasRef,
  zoneDrawMode,
  onZoneDrawn,
  onZoneResize,
}: {
  garden: Garden;
  onRemoveItem: (itemId: string) => void;
  onGrowItem: (itemId: string) => void;
  isDropTarget: boolean;
  setCanvasRef: (node: HTMLDivElement | null) => void;
  zoneDrawMode: boolean;
  onZoneDrawn: (
    rect: Pick<GardenZone, "col" | "row" | "widthCells" | "heightCells">,
  ) => void;
  onZoneResize: (zone: GardenZone) => void;
}) {
  const { setNodeRef } = useDroppable({ id: CANVAS_DROPPABLE_ID });

  const mergeRef = useCallback(
    (node: HTMLDivElement | null) => {
      setNodeRef(node);
      setCanvasRef(node);
    },
    [setNodeRef, setCanvasRef],
  );

  return (
    <GardenCanvas
      ref={mergeRef}
      garden={garden}
      isDropTarget={isDropTarget}
      onRemoveItem={onRemoveItem}
      onGrowItem={onGrowItem}
      zoneDrawMode={zoneDrawMode}
      onZoneDrawn={onZoneDrawn}
      onZoneResize={onZoneResize}
    />
  );
}

export function GardenEditorWorkspace({
  garden,
  onItemsChange,
  onZonesChange,
  justSaved = false,
  customPlants,
  onSaveCustomPlant,
  onDeleteCustomPlant,
}: GardenEditorWorkspaceProps) {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [activeDrag, setActiveDrag] = useState<ActiveDrag>(null);
  const [isOverCanvas, setIsOverCanvas] = useState(false);
  const [zoneDrawMode, setZoneDrawMode] = useState(false);
  const [pendingBedType, setPendingBedType] = useState<BedType>("vegetable");
  const [pendingBorderStyle, setPendingBorderStyle] =
    useState<BorderStyle>("default");
  const [placementHint, setPlacementHint] = useState<string | null>(null);

  const { region, updateRegion } = useRegion();
  const {
    weather,
    isLoading: weatherLoading,
    error: weatherError,
    refresh: refreshWeather,
  } = useWeather(region);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const spanForItem = useCallback(
    (item: PlacedItem) => spanForPlacedItem(item, getPlantById),
    [],
  );

  const handleSelectPlant = useCallback(
    (plant: Plant) => {
      if (garden.zones.length === 0) {
        setPlacementHint("Draw a bed on the grid before placing plants.");
        return;
      }

      const { cols, rows } = getGridSize(
        garden.dimensions.width,
        garden.dimensions.height,
      );
      const matchingBeds = zonesForCategory(garden.zones, plant.category);
      if (matchingBeds.length === 0) {
        setPlacementHint(
          `Draw a ${getBedVisual(plant.category).typeLabel} bed before placing this plant.`,
        );
        return;
      }

      const span =
        plant.category === "tree"
          ? getPlantSpanCells(plant.spreadM, "tree", "seedling")
          : getPlantSpanCells(plant.spreadM, plant.category);
      const position = findNextPlacement(
        cols,
        rows,
        span,
        garden.items,
        spanForItem,
        garden.zones,
        plant.category,
      );

      if (!position) {
        setPlacementHint(
          `No room for this plant in a ${getBedVisual(plant.category).typeLabel} bed.`,
        );
        return;
      }

      setPlacementHint(null);
      onItemsChange([...garden.items, createPlacedPlant(plant, position)]);
    },
    [garden, onItemsChange, spanForItem],
  );

  const handleRemoveItem = useCallback(
    (itemId: string) => {
      onItemsChange(garden.items.filter((item) => item.id !== itemId));
    },
    [garden.items, onItemsChange],
  );

  const handleGrowItem = useCallback(
    (itemId: string) => {
      const item = garden.items.find((entry) => entry.id === itemId);
      if (!item?.plantId) return;

      const plant = getPlantById(item.plantId);
      if (!plant || plant.category !== "tree") return;

      const stage = getTreeGrowthStage(item, plant);
      if (!stage) return;

      const nextStage = getNextTreeStage(stage);
      if (!nextStage) return;

      const { cols, rows } = getGridSize(
        garden.dimensions.width,
        garden.dimensions.height,
      );
      const nextSpan = getTreeSpanCells(nextStage);

      if (
        !canExpandPlacedItemAt(
          item,
          nextSpan,
          cols,
          rows,
          garden.items,
          spanForItem,
          garden.zones,
          plant.category,
        )
      ) {
        setPlacementHint(
          "Not enough space in this bed to grow the tree — move it or clear nearby plants.",
        );
        return;
      }

      setPlacementHint(null);
      onItemsChange(
        garden.items.map((entry) =>
          entry.id === itemId ? { ...entry, growthStage: nextStage } : entry,
        ),
      );
    },
    [garden, onItemsChange, spanForItem],
  );

  const handleZoneDrawn = useCallback(
    (rect: Pick<GardenZone, "col" | "row" | "widthCells" | "heightCells">) => {
      const { cols, rows } = getGridSize(
        garden.dimensions.width,
        garden.dimensions.height,
      );

      if (!zoneFitsOnGrid(rect, cols, rows, MIN_ZONE_CELLS)) {
        setPlacementHint(
          `Bed must fit on the grid (minimum ${MIN_ZONE_CELLS}×${MIN_ZONE_CELLS} cells).`,
        );
        setZoneDrawMode(false);
        return;
      }

      const candidate = buildZoneFromRect(
        rect,
        garden.zones,
        pendingBedType,
        pendingBorderStyle,
      );
      const overlaps = garden.zones.some((zone) => zonesOverlap(zone, candidate));

      if (overlaps) {
        setPlacementHint("Beds cannot overlap. Try a different area.");
        setZoneDrawMode(false);
        return;
      }

      setPlacementHint(null);
      onZonesChange([...garden.zones, candidate]);
      setZoneDrawMode(false);
    },
    [
      garden.dimensions.height,
      garden.dimensions.width,
      garden.zones,
      onZonesChange,
      pendingBedType,
      pendingBorderStyle,
    ],
  );

  const handleZoneResize = useCallback(
    (updatedZone: GardenZone) => {
      const { cols, rows } = getGridSize(
        garden.dimensions.width,
        garden.dimensions.height,
      );

      if (!canApplyZoneResize(updatedZone, garden.zones, cols, rows)) {
        setPlacementHint(
          `Cannot resize here — beds must stay at least ${MIN_ZONE_CELLS}×${MIN_ZONE_CELLS} and not overlap.`,
        );
        return;
      }

      setPlacementHint(null);
      onZonesChange(
        garden.zones.map((zone) =>
          zone.id === updatedZone.id ? updatedZone : zone,
        ),
      );
    },
    [
      garden.dimensions.height,
      garden.dimensions.width,
      garden.zones,
      onZonesChange,
    ],
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current;
    if (!isPlacedDragData(data)) return;

    const plant = data.item.plantId
      ? getPlantById(data.item.plantId)
      : undefined;

    setActiveDrag({
      kind: "placed",
      item: data.item,
      label: plant?.name ?? "Plant",
      plantId: data.item.plantId,
      emoji: plant?.emoji,
      category: plant?.category,
    });
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDrag(null);
      setIsOverCanvas(false);

      const { active, over } = event;
      const data = active.data.current;

      if (!isPlacedDragData(data)) return;

      const movingItem = data.item;
      const plant = movingItem.plantId
        ? getPlantById(movingItem.plantId)
        : undefined;
      const span = spanForItem(movingItem);

      if (!over || over.id !== CANVAS_DROPPABLE_ID) {
        return;
      }

      const canvasEl = canvasRef.current;
      const translated = active.rect.current.translated;
      if (!canvasEl || !translated) return;

      const rect = canvasEl.getBoundingClientRect();
      const pointerX = translated.left + translated.width / 2 - rect.left;
      const pointerY = translated.top + translated.height / 2 - rect.top;

      const { cols, rows } = getGridSize(
        garden.dimensions.width,
        garden.dimensions.height,
      );

      const preferred = gridPositionFromPointer(
        pointerX,
        pointerY,
        rect.width,
        rect.height,
        cols,
        rows,
        span,
      );

      const nextPosition = resolveMovePosition(
        cols,
        rows,
        span,
        garden.items,
        spanForItem,
        movingItem.id,
        preferred,
        movingItem.position,
        garden.zones,
        plant?.category,
      );

      if (
        nextPosition.col === movingItem.position.col &&
        nextPosition.row === movingItem.position.row
      ) {
        return;
      }

      onItemsChange(
        garden.items.map((item) =>
          item.id === movingItem.id
            ? { ...item, position: nextPosition }
            : item,
        ),
      );
    },
    [
      garden.dimensions.height,
      garden.dimensions.width,
      garden.items,
      garden.zones,
      onItemsChange,
      spanForItem,
    ],
  );

  const handleDragOver = useCallback(
    (event: { over: DragEndEvent["over"] }) => {
      setIsOverCanvas(event.over?.id === CANVAS_DROPPABLE_ID);
    },
    [],
  );

  const clearDrag = useCallback(() => {
    setActiveDrag(null);
    setIsOverCanvas(false);
  }, []);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={clearDrag}
    >
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              {garden.name}
            </h1>
            <SaveIndicator visible={justSaved} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Draw beds on the grid, drag corner/edge handles to resize them,
            click plants to add inside beds, then drag tiles to reposition. Trees
            grow via the Grow button on hover.
          </p>
          {placementHint ? (
            <p
              role="status"
              className="mt-2 text-sm text-amber-700 dark:text-amber-400"
            >
              {placementHint}
            </p>
          ) : null}
          <div className="mt-6">
            <CanvasDropZone
              garden={garden}
              onRemoveItem={handleRemoveItem}
              onGrowItem={handleGrowItem}
              isDropTarget={isOverCanvas}
              zoneDrawMode={zoneDrawMode}
              onZoneDrawn={handleZoneDrawn}
              onZoneResize={handleZoneResize}
              setCanvasRef={(node) => {
                canvasRef.current = node;
              }}
            />
          </div>
        </div>

        <aside className="flex w-full shrink-0 flex-col gap-6 lg:w-80">
          <section>
            <h2 className="mb-1 text-sm font-medium">My Region</h2>
            <p className="mb-3 text-xs text-muted-foreground">
              Used for weather forecasts and care alerts.
            </p>
            <RegionSettings region={region} onRegionChange={updateRegion} />
          </section>

          <section>
            <h2 className="mb-1 text-sm font-medium">Weather</h2>
            <WeatherWidget
              region={region}
              weather={weather}
              isLoading={weatherLoading}
              error={weatherError}
              onRefresh={refreshWeather}
            />
          </section>

          <section>
            <h2 className="mb-1 text-sm font-medium">Care alerts</h2>
            <p className="mb-3 text-xs text-muted-foreground">
              Based on your plants and local forecast.
            </p>
            <CareAlertsPanel
              items={garden.items}
              zones={garden.zones}
              region={region}
              weather={weather}
              weatherLoading={weatherLoading}
            />
          </section>

          <section>
            <h2 className="mb-1 text-sm font-medium">Garden beds</h2>
            <p className="mb-3 text-xs text-muted-foreground">
              Pick bed type and border, draw on the grid, then resize with
              handles (min 2×2 cells).
            </p>
            <ZoneManager
              zones={garden.zones}
              isDrawing={zoneDrawMode}
              pendingBedType={pendingBedType}
              pendingBorderStyle={pendingBorderStyle}
              onPendingBedTypeChange={setPendingBedType}
              onPendingBorderStyleChange={setPendingBorderStyle}
              onStartDraw={() => {
                setZoneDrawMode(true);
                setPlacementHint(null);
              }}
              onCancelDraw={() => setZoneDrawMode(false)}
              onZonesChange={onZonesChange}
            />
          </section>

          <section>
            <h2 className="mb-1 text-sm font-medium">Plant palette</h2>
            <p className="mb-3 text-xs text-muted-foreground">
              Plants must match bed type. Trees start small — hover and tap Grow
              to advance stages.
            </p>
            <PlantPalette
              onSelectPlant={handleSelectPlant}
              disabled={garden.zones.length === 0}
              disabledMessage="Draw at least one bed before adding plants."
              customPlants={customPlants}
              onSaveCustomPlant={onSaveCustomPlant}
              onDeleteCustomPlant={onDeleteCustomPlant}
            />
          </section>
        </aside>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDrag ? (
          <div className="w-36 cursor-grabbing">
            <PlantGridTile
              label={activeDrag.label}
              plantId={activeDrag.plantId}
              category={activeDrag.category}
              emoji={activeDrag.emoji}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
