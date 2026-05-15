"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "대시보드" },
  { href: "/workout", label: "운동 기록" },
  { href: "/profile", label: "프로필" },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 sm:hidden bg-background border-t z-30">
      <div className="flex">
        {LINKS.map(({ href, label }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 items-center justify-center py-3 text-sm font-medium transition-colors ${
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
