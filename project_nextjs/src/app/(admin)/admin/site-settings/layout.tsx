"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { SITE_SETTING_TAB_LABELS, SITE_SETTING_TABS } from "@/config/navigation";

type Props = {
  children: ReactNode;
};

export default function SiteSettingsLayout({ children }: Props) {
  const pathname = usePathname();

  return (
    <section className="space-y-10">
      <header className="space-y-4">
        <nav className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          <Link href="/admin/dashboard" className="hover:text-[var(--primary-dark)]">
            HOME
          </Link>{" "}
          /{" "}
          <Link href="/admin/dashboard" className="hover:text-[var(--primary-dark)]">
            ADMINISTRATION
          </Link>{" "}
          / SITE SETTINGS
        </nav>
        <h1 className="text-3xl font-semibold text-[var(--foreground)]">
          Site Settings
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Atur konfigurasi global untuk seluruh instalasi OJS.
        </p>
      </header>

      <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-white shadow-sm">
        <div className="border-b border-[var(--border)] bg-[var(--surface-muted)]">
          <nav className="flex gap-1 px-4">
            {SITE_SETTING_TABS.map((tab) => {
              const isActive = pathname.endsWith(tab);
              return (
                <Link
                  key={tab}
                  href={`/admin/site-settings/${tab}`}
                  className={`px-4 py-3 text-sm font-semibold transition-colors ${
                    isActive
                      ? "border-b-2 border-[var(--primary)] bg-white text-[var(--primary)]"
                      : "text-[var(--muted)] hover:bg-white/50 hover:text-[var(--foreground)]"
                  }`}
                >
                  {SITE_SETTING_TAB_LABELS[tab]}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </section>
  );
}

