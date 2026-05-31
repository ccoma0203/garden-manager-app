"use client";

import { useCallback, useEffect, useState } from "react";

import { loadRegion, saveRegion } from "@/lib/storage/region";
import type { SavedRegion } from "@/types/region";

export function useRegion() {
  const [region, setRegion] = useState<SavedRegion | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setRegion(loadRegion());
    setIsLoaded(true);
  }, []);

  const updateRegion = useCallback((next: SavedRegion) => {
    saveRegion(next);
    setRegion(next);
  }, []);

  return { region, isLoaded, updateRegion };
}
