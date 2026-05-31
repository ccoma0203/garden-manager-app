"use client";

import { useCallback, useEffect, useState } from "react";

import { createCustomPlant, type CustomPlantDraft } from "@/lib/plants/custom-plant";
import {
  addCustomPlant,
  deleteCustomPlant,
  loadCustomPlants,
} from "@/lib/storage/custom-plants";
import type { Plant } from "@/types/plant";

export function useCustomPlants() {
  const [customPlants, setCustomPlants] = useState<Plant[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCustomPlants(loadCustomPlants());
    setReady(true);
  }, []);

  const savePlant = useCallback((draft: CustomPlantDraft) => {
    const plant = createCustomPlant(draft);
    const next = addCustomPlant(plant);
    setCustomPlants(next);
    return plant;
  }, []);

  const removePlant = useCallback((id: string) => {
    const next = deleteCustomPlant(id);
    setCustomPlants(next);
  }, []);

  return {
    customPlants,
    ready,
    savePlant,
    removePlant,
  };
}
