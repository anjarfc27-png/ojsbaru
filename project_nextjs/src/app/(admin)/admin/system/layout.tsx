"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const SYSTEM_LINKS = [
  { href: "/admin/system/system-information", label: "System Information" },
  { href: "/admin/system/expire-sessions", label: "Expire User Sessions" },
  { href: "/admin/system/clear-data-caches", label: "Clear Data Caches" },
  { href: "/admin/system/clear-template-cache", label: "Clear Template Cache" },
  {
    href: "/admin/system/clear-scheduled-tasks",
    label: "Clear Scheduled Task Logs",
  },
];

type Props = {
  children: ReactNode;
};

export default function SystemLayout({ children }: Props) {
  const pathname = usePathname();

  return (
    <section className="space-y-8">
      <header className="space-y-4">
        <nav className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          <Link href="/admin/dashboard" className="hover:text-[var(--primary-dark)]">
            Home
          </Link>{" "}
          /{" "}
          <Link href="/admin/dashboard" className="hover:text-[var(--primary-dark)]">
            Administration
          </Link>{" "}
          / Administrative Functions
        </nav>
        <h1 className="text-3xl font-semibold text-[var(--foreground)]">
          Administrative Functions
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Akses informasi sistem dan jalankan utilitas pemeliharaan.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-[250px_1fr]">
        <aside className="space-y-2 rounded-lg border border-[var(--border)] bg-white p-4 shadow-sm">
          {SYSTEM_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`block rounded-md px-3 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-[var(--primary)] text-white shadow-sm"
                    : "text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </aside>
        <div className="rounded-lg border border-[var(--border)] bg-white p-8 shadow-sm">
          {children}
        </div>
      </div>
    </section>
  );
}

