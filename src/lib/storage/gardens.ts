import {
  countGardenPlants,
  parseGarden,
  parseGardenList,
} from "@/lib/storage/parse-garden";
import type { Garden } from "@/types/garden";

export { countGardenPlants } from "@/lib/storage/parse-garden";

const STORAGE_KEY = "garden-manager:gardens";
const STORAGE_VERSION_KEY = "garden-manager:storage-version";
const CURRENT_STORAGE_VERSION = 1;

export type SaveResult =
  | { success: true; garden: Garden }
  | { success: false; error: string };

export type LoadGardenResult = {
  garden: Garden | null;
  error: string | null;
};

export type LoadGardensResult = {
  gardens: Garden[];
  error: string | null;
  hadCorruption: boolean;
};

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readRawStorage(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(STORAGE_KEY);
}

/** Load all gardens, skipping invalid entries and self-healing corrupted data. */
export function loadGardens(): LoadGardensResult {
  if (!isBrowser()) {
    return { gardens: [], error: null, hadCorruption: false };
  }

  const raw = readRawStorage();
  if (!raw) {
    return { gardens: [], error: null, hadCorruption: false };
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      localStorage.removeItem(STORAGE_KEY);
      return {
        gardens: [],
        error: "Saved garden data was corrupted and has been reset.",
        hadCorruption: true,
      };
    }

    const valid = parseGardenList(parsed);
    const hadCorruption = valid.length !== parsed.length;

    if (hadCorruption) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(valid));
    }

    return {
      gardens: valid.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
      error: hadCorruption
        ? "Some saved gardens were invalid and were removed."
        : null,
      hadCorruption,
    };
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return {
      gardens: [],
      error: "Could not read saved gardens — storage was reset.",
      hadCorruption: true,
    };
  }
}

/** @deprecated Prefer loadGardens() for corruption handling. */
export function getGardens(): Garden[] {
  return loadGardens().gardens;
}

export function loadGardenById(id: string): LoadGardenResult {
  if (!id.trim()) {
    return { garden: null, error: "Missing garden ID." };
  }

  const { gardens, error } = loadGardens();
  const garden = gardens.find((entry) => entry.id === id.trim()) ?? null;

  return {
    garden,
    error: garden ? error : null,
  };
}

/** @deprecated Prefer loadGardenById() for explicit not-found handling. */
export function getGardenById(id: string): Garden | undefined {
  return loadGardenById(id).garden ?? undefined;
}

export function saveGarden(garden: Garden): SaveResult {
  if (!isBrowser()) {
    return { success: false, error: "Storage is only available in the browser." };
  }

  const normalized = parseGarden(garden);
  if (!normalized) {
    return { success: false, error: "Garden data is invalid and could not be saved." };
  }

  const updated: Garden = {
    ...normalized,
    updatedAt: new Date().toISOString(),
  };

  const { gardens } = loadGardens();
  const index = gardens.findIndex((entry) => entry.id === updated.id);

  if (index >= 0) {
    gardens[index] = updated;
  } else {
    gardens.push(updated);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gardens));
    localStorage.setItem(STORAGE_VERSION_KEY, String(CURRENT_STORAGE_VERSION));
    return { success: true, garden: updated };
  } catch {
    return {
      success: false,
      error: "Could not save — browser storage may be full or disabled.",
    };
  }
}

export function deleteGarden(id: string): SaveResult {
  if (!isBrowser()) {
    return { success: false, error: "Storage is only available in the browser." };
  }

  if (!id.trim()) {
    return { success: false, error: "Missing garden ID." };
  }

  const { gardens } = loadGardens();
  const next = gardens.filter((entry) => entry.id !== id.trim());

  if (next.length === gardens.length) {
    return { success: false, error: "Garden not found." };
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return { success: true, garden: gardens.find((g) => g.id === id.trim())! };
  } catch {
    return {
      success: false,
      error: "Could not delete — browser storage may be disabled.",
    };
  }
}
