"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/releases", label: "Release Radar" },
  { href: "/vault", label: "The Vault" },
  { href: "/anime", label: "Anime" },
  { href: "/shelf", label: "My Shelf" },
  { href: "/quiz", label: "Quiz" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/60 bg-[#fbf8f3]/85 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-6 sm:px-8">
        <Logo />

        <nav className="flex items-center gap-1.5 rounded-full border border-stone-300/40 bg-stone-200/50 p-1.5 backdrop-blur-sm">
          {LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-5 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? "bg-stone-900 text-white shadow-sm hover:bg-stone-800"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
