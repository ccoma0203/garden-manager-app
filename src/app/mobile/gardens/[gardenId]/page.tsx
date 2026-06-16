"use client";

import { useParams, useRouter } from "next/navigation";
import { useCustomPlants } from "@/hooks/useCustomPlants";
import { useGardenEditor } from "@/hooks/useGardenEditor";
import { GardenEditorWorkspace } from "@/components/garden/GardenEditorWorkspace";
import { IndoorEditorWorkspace } from "@/components/garden/IndoorEditorWorkspace";

export default function MobileGardenPage() {
  const params = useParams<{ gardenId: string }>();
  const router = useRouter();
  const gardenId = params.gardenId;

  const {
    garden,
    isLoading,
    notFound,
    storageError,
    justSaved,
    updateItems,
    updateZones,
    updateGroundCover,
    updateShelves,
  } = useGardenEditor({ gardenId });
  const { customPlants, savePlant, removePlant } = useCustomPlants();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        <div className="flex flex-col items-center gap-3">
          <i className="ti ti-leaf text-4xl text-green-600" aria-hidden="true" />
          <p className="text-sm">불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (notFound || !garden) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <p className="text-lg font-medium">정원을 찾을 수 없어요</p>
        <p className="mt-2 text-sm text-muted-foreground">삭제됐거나 잘못된 링크예요.</p>
        <button
          type="button"
          onClick={() => router.push("/mobile")}
          className="mt-6 rounded-xl bg-green-600 px-6 py-3 text-sm font-medium text-white"
        >
          홈으로
        </button>
      </div>
    );
  }

  const isIndoor = garden.environment === "indoor" || garden.environment === "balcony";

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex items-center gap-3 border-b border-border bg-background px-4 pt-12 pb-3">
        <button
          type="button"
          onClick={() => router.push("/mobile")}
          className="flex items-center justify-center rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
        >
          <i className="ti ti-arrow-left text-xl" aria-hidden="true" />
        </button>
        <h1 className="text-lg font-semibold truncate flex-1">{garden.name}</h1>
        {justSaved && (
          <span className="text-xs text-green-600 font-medium">저장됨</span>
        )}
      </div>

      {storageError ? (
        <p role="alert" className="mx-4 mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {storageError}
        </p>
      ) : null}

      <div className="flex-1 px-4 py-4">
        {isIndoor ? (
          <IndoorEditorWorkspace
            garden={garden}
            onItemsChange={updateItems}
            onShelvesChange={updateShelves}
            justSaved={justSaved}
            customPlants={customPlants}
            onSaveCustomPlant={savePlant}
            onDeleteCustomPlant={removePlant}
          />
        ) : (
          <GardenEditorWorkspace
            garden={garden}
            onItemsChange={updateItems}
            onZonesChange={updateZones}
            onGroundCoverChange={updateGroundCover}
            justSaved={justSaved}
            customPlants={customPlants}
            onSaveCustomPlant={savePlant}
            onDeleteCustomPlant={removePlant}
          />
        )}
      </div>
    </div>
  );
}
