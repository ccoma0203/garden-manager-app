"use client";

import { DEFAULT_LENGTH_UNIT } from "@/types/garden";

type DimensionFormProps = {
  width?: number;
  height?: number;
  onSubmit?: (width: number, height: number) => void;
};

/**
 * Form for entering garden dimensions (meters by default).
 * Full implementation coming in the garden creation flow.
 */
export function DimensionForm({
  width = 4,
  height = 3,
  onSubmit,
}: DimensionFormProps) {
  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        const w = Number(data.get("width"));
        const h = Number(data.get("height"));
        if (w > 0 && h > 0) onSubmit?.(w, h);
      }}
    >
      <p className="text-sm text-muted-foreground">
        Dimensions in {DEFAULT_LENGTH_UNIT} (meters)
      </p>
      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1 text-sm">
          Width ({DEFAULT_LENGTH_UNIT})
          <input
            name="width"
            type="number"
            min={0.5}
            step={0.1}
            defaultValue={width}
            className="rounded-lg border border-input bg-background px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Height ({DEFAULT_LENGTH_UNIT})
          <input
            name="height"
            type="number"
            min={0.5}
            step={0.1}
            defaultValue={height}
            className="rounded-lg border border-input bg-background px-3 py-2"
          />
        </label>
      </div>
      <button
        type="submit"
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        Continue to editor
      </button>
    </form>
  );
}
