"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  deleteGarden as deleteStoredGarden,
  loadGardenById,
  saveGarden,
} from "@/lib/storage/gardens";
import type { Garden, PlacedItem } from "@/types/garden";

const SAVED_INDICATOR_MS = 2000;

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
    setJustSaved(true);
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
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

  const updateItems = useCallback(
    (items: PlacedItem[]) => {
      setGarden((prev) => {
        if (!prev) return prev;

        const next: Garden = { ...prev, items };
        const result = saveGarden(next);

        if (result.success) {
          flashSaved();
          setStorageError(null);
          return result.garden;
        }

        setStorageError(result.error);
        return prev;
      });
    },
    [flashSaved],
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
    removeGarden,
  };
}
