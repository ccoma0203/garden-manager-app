"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/mobile", label: "홈", icon: "ti-home" },
  { href: "/mobile/plants", label: "식물", icon: "ti-plant" },
  { href: "/mobile/shop", label: "쇼핑", icon: "ti-shopping-cart" },
  { href: "/mobile/settings", label: "설정", icon: "ti-settings" },
];

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="flex-1 overflow-y-auto pb-20">{children}</div>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background">
        <div className="flex justify-around py-2 pb-safe">
          {TABS.map((tab) => {
            const isActive =
              tab.href === "/mobile"
                ? pathname === "/mobile"
                : pathname.startsWith(tab.href);
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex flex-col items-center gap-1 px-4 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "text-green-700 dark:text-green-400"
                    : "text-muted-foreground"
                }`}
              >
                <i
                  className={`ti ${tab.icon} text-2xl`}
                  aria-hidden="true"
                />
                <span>{tab.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
