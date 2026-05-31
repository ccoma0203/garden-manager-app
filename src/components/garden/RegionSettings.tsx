"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  geocodingResultToRegion,
  searchCities,
} from "@/lib/weather/open-meteo";
import type { GeocodingResult, SavedRegion } from "@/types/region";
import { SUGGESTED_CITIES } from "@/types/region";

type RegionSettingsProps = {
  region: SavedRegion | null;
  onRegionChange: (region: SavedRegion) => void;
};

export function RegionSettings({
  region,
  onRegionChange,
}: RegionSettingsProps) {
  const [query, setQuery] = useState(region?.name ?? "");
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    setQuery(region?.name ?? "");
  }, [region?.name]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setSearchError(null);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const found = await searchCities(trimmed);
        setResults(found);
      } catch (err) {
        setResults([]);
        setSearchError(
          err instanceof Error ? err.message : "Search failed.",
        );
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query]);

  function selectRegion(next: SavedRegion) {
    onRegionChange(next);
    setQuery(next.name);
    setResults([]);
  }

  return (
    <div className="flex flex-col gap-3">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium">Search city</span>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Seoul, Busan, Pohang"
          className="rounded-lg border border-input bg-background px-3 py-2"
        />
      </label>

      {isSearching ? (
        <p className="text-xs text-muted-foreground">Searching…</p>
      ) : null}
      {searchError ? (
        <p className="text-xs text-amber-700 dark:text-amber-400">
          {searchError}
        </p>
      ) : null}

      {results.length > 0 ? (
        <ul className="max-h-36 overflow-y-auto rounded-lg border border-border bg-card">
          {results.map((result) => (
            <li key={result.id}>
              <button
                type="button"
                onClick={() => selectRegion(geocodingResultToRegion(result))}
                className="flex w-full flex-col px-3 py-2 text-left text-sm hover:bg-muted"
              >
                <span className="font-medium">{result.name}</span>
                <span className="text-xs text-muted-foreground">
                  {[result.admin1, result.country].filter(Boolean).join(", ")}
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div>
        <p className="mb-1.5 text-xs text-muted-foreground">Quick picks</p>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_CITIES.map((city) => (
            <Button
              key={city.name}
              type="button"
              variant="outline"
              size="xs"
              onClick={() => selectRegion(city)}
            >
              {city.name}
            </Button>
          ))}
        </div>
      </div>

      {region ? (
        <p className="rounded-lg bg-muted/60 px-2.5 py-2 text-xs text-muted-foreground">
          Selected:{" "}
          <span className="font-medium text-foreground">{region.name}</span>
          {[region.admin1, region.country].filter(Boolean).length > 0
            ? ` · ${[region.admin1, region.country].filter(Boolean).join(", ")}`
            : null}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Set your region to enable weather and care alerts.
        </p>
      )}
    </div>
  );
}
