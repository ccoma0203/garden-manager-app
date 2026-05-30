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

import { GardenCanvas } from "@/components/garden/GardenCanvas";
import { PlantGridTile } from "@/components/garden/PlantGridTile";
import { PlantPalette } from "@/components/garden/PlantPalette";
import { SaveIndicator } from "@/components/garden/SaveIndicator";
import {
  CANVAS_DROPPABLE_ID,
  isPlacedDragData,
} from "@/lib/garden/dnd";
import {
  createPlacedPlant,
  findNextPlacement,
  getGridSize,
  getPlantSpanCells,
  gridPositionFromPointer,
  resolveMovePosition,
  spanForPlacedItem,
} from "@/lib/garden/grid";
import type { Garden, PlacedItem } from "@/types/garden";
import { getPlantById, type Plant } from "@/types/plant";

type GardenEditorWorkspaceProps = {
  garden: Garden;
  onItemsChange: (items: PlacedItem[]) => void;
  justSaved?: boolean;
};

type ActiveDrag =
  | { kind: "placed"; item: PlacedItem; label: string; plantId?: string }
  | null;

function CanvasDropZone({
  garden,
  onRemoveItem,
  isDropTarget,
  setCanvasRef,
}: {
  garden: Garden;
  onRemoveItem: (itemId: string) => void;
  isDropTarget: boolean;
  setCanvasRef: (node: HTMLDivElement | null) => void;
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
    />
  );
}

export function GardenEditorWorkspace({
  garden,
  onItemsChange,
  justSaved = false,
}: GardenEditorWorkspaceProps) {
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const [activeDrag, setActiveDrag] = useState<ActiveDrag>(null);
  const [isOverCanvas, setIsOverCanvas] = useState(false);

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
      const { cols, rows } = getGridSize(
        garden.dimensions.width,
        garden.dimensions.height,
      );
      const span = getPlantSpanCells(plant.spreadM);
      const position = findNextPlacement(
        cols,
        rows,
        span,
        garden.items,
        spanForItem,
      );

      if (!position) return;

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
      );

      onItemsChange(
        garden.items.map((item) =>
          item.id === movingItem.id
            ? { ...item, position: nextPosition }
            : item,
        ),
      );
    },
    [garden.dimensions.height, garden.dimensions.width, garden.items, onItemsChange, spanForItem],
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
            Click a plant in the palette to add it, then drag tiles on the grid
            to reposition. Hover a tile and click ✕ to remove.
          </p>
          <div className="mt-6">
            <CanvasDropZone
              garden={garden}
              onRemoveItem={handleRemoveItem}
              isDropTarget={isOverCanvas}
              setCanvasRef={(node) => {
                canvasRef.current = node;
              }}
            />
          </div>
        </div>
        <aside className="w-full shrink-0 lg:w-72">
          <h2 className="mb-1 text-sm font-medium">Plant palette</h2>
          <p className="mb-3 text-xs text-muted-foreground">
            Click to add at the centre of the plot.
          </p>
          <PlantPalette onSelectPlant={handleSelectPlant} />
        </aside>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDrag ? (
          <div className="w-32 cursor-grabbing">
            <PlantGridTile
              label={activeDrag.label}
              plantId={activeDrag.plantId}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
