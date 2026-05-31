import type { SavedRegion } from "@/types/region";

const STORAGE_KEY = "garden-manager:region";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function loadRegion(): SavedRegion | null {
  if (!isBrowser()) return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "name" in parsed &&
      "latitude" in parsed &&
      "longitude" in parsed &&
      typeof (parsed as SavedRegion).name === "string" &&
      typeof (parsed as SavedRegion).latitude === "number" &&
      typeof (parsed as SavedRegion).longitude === "number"
    ) {
      return parsed as SavedRegion;
    }

    return null;
  } catch {
    return null;
  }
}

export function saveRegion(region: SavedRegion): void {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(region));
}

export function clearRegion(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEY);
}
