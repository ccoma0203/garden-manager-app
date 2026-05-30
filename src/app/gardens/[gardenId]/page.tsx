"use client";

import { useParams } from "next/navigation";

import { GardenEditorWorkspace } from "@/components/garden/GardenEditorWorkspace";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { ButtonLink } from "@/components/ui/button-link";
import { useGardenEditor } from "@/hooks/useGardenEditor";

export default function GardenEditorPage() {
  const params = useParams<{ gardenId: string }>();
  const gardenId = params.gardenId;
  const {
    garden,
    isLoading,
    notFound,
    storageError,
    justSaved,
    updateItems,
  } = useGardenEditor({ gardenId });

  if (isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center text-muted-foreground">
        Loading garden…
      </div>
    );
  }

  if (notFound || !garden) {
    return (
      <div className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="mx-auto max-w-lg px-4 py-16 text-center">
          <h1 className="text-lg font-medium">Garden not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {gardenId?.trim()
              ? "This garden may have been deleted or the link is invalid."
              : "No garden ID was provided."}
          </p>
          {storageError ? (
            <p role="alert" className="mt-3 text-sm text-amber-700 dark:text-amber-400">
              {storageError}
            </p>
          ) : null}
          <ButtonLink href="/gardens" className="mt-6">
            Back to my gardens
          </ButtonLink>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6">
        {storageError ? (
          <p
            role="alert"
            className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
          >
            {storageError}
          </p>
        ) : null}
        <GardenEditorWorkspace
          garden={garden}
          onItemsChange={updateItems}
          justSaved={justSaved}
        />
      </main>
    </div>
  );
}
