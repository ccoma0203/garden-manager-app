"use client";

type SaveIndicatorProps = {
  visible: boolean;
};

export function SaveIndicator({ visible }: SaveIndicatorProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      aria-hidden={!visible}
      className={`inline-flex min-h-6 min-w-[4.5rem] items-center justify-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-300 ${
        visible
          ? "border-emerald-300 bg-emerald-100 text-emerald-800 opacity-100 shadow-sm dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
          : "border-transparent bg-transparent text-transparent opacity-0"
      }`}
    >
      Saved ✓
    </span>
  );
}
