"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  BED_TYPE_OPTIONS,
  BORDER_STYLE_OPTIONS,
  getBedVisual,
} from "@/lib/garden/bed-styles";
import {
  createZoneId,
  nextDefaultZoneName,
  nextZoneColorId,
} from "@/lib/garden/zones";
import type { BedType, BorderStyle, GardenZone } from "@/types/garden";

type ZoneManagerProps = {
  zones: GardenZone[];
  isDrawing: boolean;
  pendingBedType: BedType;
  pendingBorderStyle: BorderStyle;
  onPendingBedTypeChange: (bedType: BedType) => void;
  onPendingBorderStyleChange: (style: BorderStyle) => void;
  onStartDraw: () => void;
  onCancelDraw: () => void;
  onZonesChange: (zones: GardenZone[]) => void;
};

export function ZoneManager({
  zones,
  isDrawing,
  pendingBedType,
  pendingBorderStyle,
  onPendingBedTypeChange,
  onPendingBorderStyleChange,
  onStartDraw,
  onCancelDraw,
  onZonesChange,
}: ZoneManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  function startRename(zone: GardenZone) {
    setEditingId(zone.id);
    setEditName(zone.name);
  }

  function commitRename(zoneId: string) {
    const name = editName.trim();
    if (name) {
      onZonesChange(
        zones.map((zone) =>
          zone.id === zoneId ? { ...zone, name } : zone,
        ),
      );
    }
    setEditingId(null);
  }

  function updateZone(zoneId: string, patch: Partial<GardenZone>) {
    onZonesChange(
      zones.map((zone) => (zone.id === zoneId ? { ...zone, ...patch } : zone)),
    );
  }

  function handleDelete(zone: GardenZone) {
    const confirmed = window.confirm(
      `Delete "${zone.name}"? Plants in this bed will also be removed.`,
    );
    if (!confirmed) return;
    onZonesChange(zones.filter((z) => z.id !== zone.id));
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/30 p-3">
        <label className="text-xs font-medium">Bed type</label>
        <div className="grid grid-cols-3 gap-1">
          {BED_TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onPendingBedTypeChange(option.value)}
              className={`rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                pendingBedType === option.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-background hover:bg-muted"
              }`}
            >
              {option.emoji} {option.label}
            </button>
          ))}
        </div>

        <label className="mt-1 text-xs font-medium">Border style</label>
        <select
          value={pendingBorderStyle}
          onChange={(e) =>
            onPendingBorderStyleChange(e.target.value as BorderStyle)
          }
          className="rounded-lg border border-input bg-background px-2 py-1.5 text-sm"
        >
          {BORDER_STYLE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.emoji} {option.label}
            </option>
          ))}
        </select>

        <div
          className="mt-1 h-8 rounded-md border-2"
          style={{
            backgroundColor: getBedVisual(pendingBedType).soilColor,
            backgroundImage: getBedVisual(pendingBedType).soilTexture,
          }}
          aria-hidden
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {isDrawing ? (
          <Button type="button" variant="outline" size="sm" onClick={onCancelDraw}>
            Cancel drawing
          </Button>
        ) : (
          <Button type="button" size="sm" onClick={onStartDraw}>
            Draw bed
          </Button>
        )}
      </div>

      {isDrawing ? (
        <p className="text-xs text-muted-foreground">
          Drag on the grid to draw a {getBedVisual(pendingBedType).typeLabel}{" "}
          bed (min 2×2 cells).
        </p>
      ) : null}

      {zones.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground">
          No beds yet. Choose type and border, then draw on the grid.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {zones.map((zone) => {
            const bedVisual = getBedVisual(zone.bedType);
            const isEditing = editingId === zone.id;

            return (
              <li
                key={zone.id}
                className="rounded-lg border border-border p-3"
                style={{ backgroundColor: `${bedVisual.soilColor}33` }}
              >
                <div className="flex items-start justify-between gap-2">
                  {isEditing ? (
                    <input
                      autoFocus
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      onBlur={() => commitRename(zone.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRename(zone.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      className="min-w-0 flex-1 rounded border border-input bg-background px-2 py-0.5 text-sm"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => startRename(zone)}
                      className="text-left text-sm font-medium hover:underline"
                      title="Click to rename"
                    >
                      {zone.name}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(zone)}
                    className="shrink-0 text-xs text-muted-foreground hover:text-destructive"
                  >
                    Delete
                  </button>
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  {bedVisual.typeLabel} · {zone.widthCells}×{zone.heightCells}{" "}
                  cells
                </p>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <label className="flex flex-col gap-0.5 text-[0.65rem]">
                    Type
                    <select
                      value={zone.bedType}
                      onChange={(e) =>
                        updateZone(zone.id, {
                          bedType: e.target.value as BedType,
                        })
                      }
                      className="rounded border border-input bg-background px-1.5 py-1 text-xs"
                    >
                      {BED_TYPE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.emoji} {o.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-0.5 text-[0.65rem]">
                    Border
                    <select
                      value={zone.borderStyle}
                      onChange={(e) =>
                        updateZone(zone.id, {
                          borderStyle: e.target.value as BorderStyle,
                        })
                      }
                      className="rounded border border-input bg-background px-1.5 py-1 text-xs"
                    >
                      {BORDER_STYLE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.emoji} {o.label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Build a new zone from a drawn rectangle (caller validates fit / overlap). */
export function buildZoneFromRect(
  rect: Pick<GardenZone, "col" | "row" | "widthCells" | "heightCells">,
  existingZones: GardenZone[],
  bedType: BedType,
  borderStyle: BorderStyle,
): GardenZone {
  return {
    id: createZoneId(),
    name: nextDefaultZoneName(existingZones, bedType),
    colorId: nextZoneColorId(existingZones),
    bedType,
    borderStyle,
    ...rect,
  };
}
