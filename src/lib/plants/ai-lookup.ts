import type { Plant, SunExposure, WaterNeeds } from "@/types/plant";

/** Partial plant fields returned by AI (no id). */
export type AIPlantLookupResult = {
  name: string;
  category?: Plant["category"];
  emoji?: string;
  sun?: SunExposure;
  water?: WaterNeeds;
  wateringIntervalDays?: number;
  minTempC?: number;
  spreadM?: number;
  heightM?: number;
  scientificName?: string;
} | null;

/**
 * Look up plant care data by name via Claude API.
 *
 * Currently returns `null` so the UI falls back to the built-in catalog search.
 * To activate later: set `ANTHROPIC_API_KEY` and implement the API call here.
 */
export async function fetchPlantDataFromAI(
  name: string,
): Promise<AIPlantLookupResult> {
  void name;
  // const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;
  // if (!apiKey) return null;
  // … call Claude with structured output …
  return null;
}
