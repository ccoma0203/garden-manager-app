import { fetchPlantDataFromAI } from "@/lib/plants/ai-lookup";
import {
  PLANT_CATALOG,
  toPlant,
  type CatalogPlant,
} from "@/lib/plants/catalog";
import type { Plant } from "@/types/plant";

function normalize(text: string): string {
  return text.trim().toLowerCase().normalize("NFC");
}

function scoreMatch(query: string, entry: CatalogPlant): number {
  const q = normalize(query);
  if (!q) return 0;

  const name = normalize(entry.name);
  if (name === q) return 100;
  if (name.startsWith(q)) return 80;

  for (const term of entry.searchTerms) {
    const t = normalize(term);
    if (!t) continue;
    if (t === q) return 90;
    if (t.startsWith(q) || q.startsWith(t)) return 70;
    if (t.includes(q) || q.includes(t)) return 50;
  }

  if (entry.scientificName && normalize(entry.scientificName).includes(q)) {
    return 40;
  }

  return 0;
}

/** Search the built-in catalog (50+ plants, incl. Korean aliases). */
export function searchPlantCatalog(
  query: string,
  limit = 8,
): CatalogPlant[] {
  const q = normalize(query);
  if (!q) return [];

  return PLANT_CATALOG.filter((entry) => scoreMatch(q, entry) > 0)
    .sort((a, b) => scoreMatch(q, b) - scoreMatch(q, a))
    .slice(0, limit);
}

export type PlantLookupSource = "ai" | "catalog" | "none";

export type PlantLookupResult = {
  source: PlantLookupSource;
  /** Best single match when source is ai or catalog. */
  plant?: Plant;
  /** Ranked catalog suggestions (catalog or none). */
  suggestions: Plant[];
};

/**
 * Resolve plant data: AI stub first, then catalog search.
 * Used when the user submits a name in smart search.
 */
export async function lookupPlantByName(
  name: string,
): Promise<PlantLookupResult> {
  const trimmed = name.trim();
  if (!trimmed) {
    return { source: "none", suggestions: [] };
  }

  const ai = await fetchPlantDataFromAI(trimmed);
  if (ai) {
    const plant: Plant = {
      id: `lookup-${normalize(trimmed).replace(/\s+/g, "-")}`,
      name: ai.name,
      category: ai.category ?? "vegetable",
      emoji: ai.emoji ?? "🌱",
      sun: ai.sun ?? "partial",
      water: ai.water ?? "medium",
      spreadM: ai.spreadM ?? 0.3,
      heightM: ai.heightM ?? 0.5,
      wateringIntervalDays: ai.wateringIntervalDays ?? 3,
      minTempC: ai.minTempC ?? 5,
      scientificName: ai.scientificName,
    };
    return { source: "ai", plant, suggestions: [plant] };
  }

  const matches = searchPlantCatalog(trimmed, 8);
  const suggestions = matches.map(toPlant);

  if (suggestions.length > 0) {
    const top = suggestions[0];
    const exact =
      normalize(top.name) === normalize(trimmed) ||
      matches[0].searchTerms.some((t) => normalize(t) === normalize(trimmed));

    return {
      source: "catalog",
      plant: exact ? top : undefined,
      suggestions,
    };
  }

  return { source: "none", suggestions: [] };
}
