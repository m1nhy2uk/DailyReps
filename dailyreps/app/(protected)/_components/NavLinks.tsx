"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/dashboard", label: "대시보드" },
  { href: "/workout", label: "운동 기록" },
  { href: "/profile", label: "프로필" },
] as const;

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-5">
      {LINKS.map(({ href, label }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`text-sm transition-colors ${
              active
                ? "font-semibold text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
