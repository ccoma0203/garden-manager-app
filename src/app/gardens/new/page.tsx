"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { DimensionForm } from "@/components/garden/DimensionForm";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { saveGarden } from "@/lib/storage/gardens";
import { createGarden } from "@/types/garden";

export default function NewGardenPage() {
  const router = useRouter();
  const [name, setName] = useState("My garden");

  function handleCreate(width: number, height: number) {
    const garden = createGarden({
      name: name.trim() || "My garden",
      width,
      height,
    });
    const result = saveGarden(garden);
    if (!result.success) {
      window.alert(result.error);
      return;
    }
    router.push(`/gardens/${garden.id}`);
  }

  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-10 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>New garden</CardTitle>
            <CardDescription>
              Set your outdoor space size in metres. You can refine the layout in
              the editor next.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <label className="flex flex-col gap-1 text-sm">
              Garden name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-lg border border-input bg-background px-3 py-2"
                placeholder="Backyard bed"
              />
            </label>
            <DimensionForm onSubmit={handleCreate} />
            <Button
              type="button"
              className="w-full"
              onClick={() => handleCreate(4, 3)}
            >
              Use defaults (4 m × 3 m)
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
