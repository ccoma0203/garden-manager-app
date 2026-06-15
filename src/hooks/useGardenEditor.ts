"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { spanForPlacedItem } from "@/lib/garden/grid";
import { filterItemsToZones } from "@/lib/garden/zones";
import {
  deleteGarden as deleteStoredGarden,
  loadGardenById,
  saveGarden,
} from "@/lib/storage/gardens";
import type { Garden, GardenZone, PlacedItem } from "@/types/garden";
import { getPlantById } from "@/lib/plants/registry";

const SAVED_INDICATOR_MS = 2500;

type UseGardenEditorOptions = {
  gardenId: string | undefined;
};

export function useGardenEditor({ gardenId }: UseGardenEditorOptions) {
  const [garden, setGarden] = useState<Garden | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [justSaved, setJustSaved] = useState(false);
  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flashSaved = useCallback(() => {
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    setJustSaved(true);
    savedTimerRef.current = setTimeout(() => {
      setJustSaved(false);
    }, SAVED_INDICATOR_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
    };
  }, []);

  useEffect(() => {
    setIsLoading(true);
    setNotFound(false);
    setStorageError(null);

    const id = gardenId?.trim();
    if (!id) {
      setGarden(null);
      setNotFound(true);
      setIsLoading(false);
      return;
    }

    const result = loadGardenById(id);
    setGarden(result.garden);
    setNotFound(!result.garden);
    setStorageError(result.error);
    setIsLoading(false);
  }, [gardenId]);

  const persistGarden = useCallback(
    (updater: (prev: Garden) => Garden) => {
      setGarden((prev) => {
        if (!prev) return prev;
  
        const next = updater(prev);
        const result = saveGarden(next);
  
        if (result.success) {
          setTimeout(() => {
            setStorageError(null);
            flashSaved();
          }, 0);
          return result.garden;
        }
  
        setTimeout(() => {
          setStorageError(result.error);
        }, 0);
        return prev;
      });
    },
    [flashSaved],
  );

  const updateItems = useCallback(
    (items: PlacedItem[]) => {
      persistGarden((prev) => ({ ...prev, items }));
    },
    [persistGarden],
  );

  const updateZones = useCallback(
    (zones: GardenZone[]) => {
      persistGarden((prev) => {
        const items = filterItemsToZones(
          prev.items,
          zones,
          (item) => spanForPlacedItem(item, getPlantById),
          getPlantById,
        );
        return { ...prev, zones, items };
      });
    },
    [persistGarden],
  );

  const updateGroundCover = useCallback(
    (groundCover: import("@/types/garden").GroundCoverType) => {
      persistGarden((prev) => ({ ...prev, groundCover }));
    },
    [persistGarden],
  );

  const updateShelves = useCallback(
    (shelves: import("@/types/garden").IndoorShelf[]) => {
      persistGarden((prev) => ({ ...prev, shelves }));
    },
    [persistGarden],
  );

  const removeGarden = useCallback(() => {
    if (!gardenId?.trim()) return;
    deleteStoredGarden(gardenId.trim());
    setGarden(null);
    setNotFound(true);
  }, [gardenId]);

  return {
    garden,
    isLoading,
    notFound,
    storageError,
    justSaved,
    updateItems,
    updateZones,
    updateGroundCover,
    updateShelves,
    removeGarden,
  };
}
