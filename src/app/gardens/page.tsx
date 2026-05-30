"use client";

import { useCallback, useEffect, useState } from "react";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  countGardenPlants,
  deleteGarden,
  loadGardens,
} from "@/lib/storage/gardens";
import type { Garden } from "@/types/garden";

function formatGardenSize(garden: Garden): string {
  const { width, height, unit } = garden.dimensions;
  return `${width} × ${height} ${unit}`;
}

function formatPlantCount(garden: Garden): string {
  const count = countGardenPlants(garden);
  if (count === 0) return "No plants yet";
  if (count === 1) return "1 plant";
  return `${count} plants`;
}

export default function GardensPage() {
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const refreshGardens = useCallback(() => {
    const result = loadGardens();
    setGardens(result.gardens);
    setStorageError(result.error);
  }, []);

  useEffect(() => {
    refreshGardens();
  }, [refreshGardens]);

  function handleDelete(garden: Garden) {
    const confirmed = window.confirm(
      `Delete "${garden.name}"? This cannot be undone.`,
    );
    if (!confirmed) return;

    setDeletingId(garden.id);
    const result = deleteGarden(garden.id);
    setDeletingId(null);

    if (!result.success) {
      setStorageError(result.error);
      return;
    }

    refreshGardens();
  }

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">My gardens</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Saved in this browser only.
            </p>
          </div>
          <ButtonLink href="/gardens/new">New garden</ButtonLink>
        </div>

        {storageError ? (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
          >
            {storageError}
          </p>
        ) : null}

        {gardens.length === 0 ? (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>No gardens yet</CardTitle>
              <CardDescription>
                Create your first plot to start placing plants on the grid. Empty
                gardens are saved automatically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ButtonLink href="/gardens/new">
                Create your first garden
              </ButtonLink>
            </CardContent>
          </Card>
        ) : (
          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {gardens.map((garden) => (
              <li key={garden.id}>
                <Card>
                  <CardHeader>
                    <CardTitle>{garden.name}</CardTitle>
                    <CardDescription>
                      {formatGardenSize(garden)} · {formatPlantCount(garden)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap items-center gap-2">
                    <ButtonLink
                      href={`/gardens/${garden.id}`}
                      variant="outline"
                      size="sm"
                    >
                      Open editor
                    </ButtonLink>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={deletingId === garden.id}
                      onClick={() => handleDelete(garden)}
                    >
                      {deletingId === garden.id ? "Deleting…" : "Delete garden"}
                    </Button>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
