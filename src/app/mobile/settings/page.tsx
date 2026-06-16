"use client";

import Link from "next/link";
import { RegionSettings } from "@/components/garden/RegionSettings";
import { useRegion } from "@/hooks/useRegion";

export default function MobileSettingsPage() {
  const { region, updateRegion } = useRegion();

  return (
    <div className="flex flex-col">
      <div className="bg-background px-4 pt-12 pb-4 border-b border-border">
        <h1 className="text-2xl font-semibold">설정</h1>
      </div>

      <div className="flex flex-col gap-6 px-4 py-4">
        <section>
          <h2 className="text-sm font-medium mb-3">내 지역</h2>
          <div className="rounded-2xl border border-border bg-card p-4">
            <RegionSettings region={region} onRegionChange={updateRegion} />
          </div>
        </section>

        <section>
          <h2 className="text-sm font-medium mb-3">웹 버전</h2>
          <Link
            href="/"
            className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3.5"
          >
            <i className="ti ti-world text-xl text-muted-foreground" aria-hidden="true" />
            <span className="text-sm">데스크탑 버전으로 이동</span>
            <i className="ti ti-chevron-right ml-auto text-muted-foreground" aria-hidden="true" />
          </Link>
        </section>

        <section>
          <h2 className="text-sm font-medium mb-3">앱 정보</h2>
          <div className="rounded-2xl border border-border bg-card px-4 py-3.5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">버전</span>
              <span className="text-sm font-medium">1.0.0</span>
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
              <span className="text-sm text-muted-foreground">Garden Manager</span>
              <span className="text-sm text-muted-foreground">🌿</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
