"use client";

type SaveIndicatorProps = {
  visible: boolean;
};

export function SaveIndicator({ visible }: SaveIndicatorProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={`inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 transition-all duration-300 dark:bg-emerald-950 dark:text-emerald-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none -translate-y-0.5 opacity-0"
      }`}
    >
      Saved ✓
    </span>
  );
}
