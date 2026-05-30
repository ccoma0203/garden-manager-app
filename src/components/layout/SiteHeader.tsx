import Link from "next/link";

import { ButtonLink } from "@/components/ui/button-link";

export function SiteHeader() {
  return (
    <header className="border-b border-border/60 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span aria-hidden className="text-lg">
            🌿
          </span>
          Garden Manager
        </Link>
        <nav className="flex items-center gap-2">
          <ButtonLink href="/gardens" variant="ghost" size="sm">
            My gardens
          </ButtonLink>
          <ButtonLink href="/gardens/new" size="sm">
            New garden
          </ButtonLink>
        </nav>
      </div>
    </header>
  );
}
