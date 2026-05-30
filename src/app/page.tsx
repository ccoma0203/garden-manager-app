import {
  CloudSun,
  Grid3x3,
  MessageCircle,
  ShoppingBag,
  Sprout,
} from "lucide-react";

import { SiteHeader } from "@/components/layout/SiteHeader";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DEFAULT_LENGTH_UNIT } from "@/types/garden";

const features = [
  {
    icon: Grid3x3,
    title: "Digitize your space",
    description:
      "Enter width and height in metres or upload a photo, then edit on an interactive grid.",
  },
  {
    icon: Sprout,
    title: "Plan virtually",
    description:
      "Drag plants and tools onto your plot before you buy — see spacing and layout at a glance.",
  },
  {
    icon: CloudSun,
    title: "Care alerts",
    description:
      "Personalised reminders based on plant needs and your regional weather.",
  },
  {
    icon: MessageCircle,
    title: "AI plant assistant",
    description:
      "Ask questions about watering, pests, and seasonal tasks for your garden.",
  },
  {
    icon: ShoppingBag,
    title: "Shop with confidence",
    description:
      "Turn your virtual layout into a purchase list when you are ready to plant.",
  },
] as const;

export default function HomePage() {
  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <p className="mb-3 text-sm font-medium text-emerald-700 dark:text-emerald-400">
              Plan · Plant · Thrive
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Your outdoor space, as an interactive garden
            </h1>
            <p className="mt-4 text-lg text-muted-foreground text-pretty">
              Garden Manager helps you design beds in{" "}
              <strong className="font-medium text-foreground">
                {DEFAULT_LENGTH_UNIT === "m" ? "metres" : DEFAULT_LENGTH_UNIT}
              </strong>
              , place plants virtually, and get care guidance tailored to your
              climate — all before you dig.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ButtonLink href="/gardens/new" size="lg">
                Create your first garden
              </ButtonLink>
              <ButtonLink href="/gardens" size="lg" variant="outline">
                View saved gardens
              </ButtonLink>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Data is stored locally in your browser for now — no account
              required.
            </p>
          </div>
        </section>

        <section className="border-t border-border/60 bg-muted/30 py-16 sm:py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="text-center text-2xl font-semibold tracking-tight">
              Everything in one place
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-muted-foreground">
              Built for beginners: start with a simple grid editor, then add
              weather, alerts, and AI as you grow.
            </p>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, description }) => (
                <li key={title}>
                  <Card size="sm" className="h-full">
                    <CardHeader>
                      <div className="mb-1 flex size-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        <Icon className="size-4" aria-hidden />
                      </div>
                      <CardTitle>{title}</CardTitle>
                      <CardDescription>{description}</CardDescription>
                    </CardHeader>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
          <Card>
            <CardHeader>
              <CardTitle>How it works</CardTitle>
              <CardDescription>Three steps to your first layout</CardDescription>
            </CardHeader>
            <CardContent>
              <ol className="grid gap-6 sm:grid-cols-3">
                <li className="space-y-1">
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    1. Measure
                  </span>
                  <p className="text-sm text-muted-foreground">
                    Enter plot size in metres (e.g. 4 m × 3 m) or trace over a
                    photo background.
                  </p>
                </li>
                <li className="space-y-1">
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    2. Place
                  </span>
                  <p className="text-sm text-muted-foreground">
                    Pick plants from the palette and arrange them on the grid.
                  </p>
                </li>
                <li className="space-y-1">
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    3. Care
                  </span>
                  <p className="text-sm text-muted-foreground">
                    Get watering and seasonal tips, then chat with the AI
                    assistant when you need help.
                  </p>
                </li>
              </ol>
            </CardContent>
          </Card>
        </section>
      </main>

      <footer className="border-t border-border/60 py-6 text-center text-sm text-muted-foreground">
        Garden Manager · measurements in metres (m)
      </footer>
    </div>
  );
}
