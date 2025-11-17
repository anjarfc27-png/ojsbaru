"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const NAV_SECTIONS = [
  {
    label: "Workflow",
    items: [
      { label: "Dashboard", href: "/editor/dashboard" },
      { label: "My Queue", href: "/editor/submissions?queue=my" },
      { label: "All Active", href: "/editor/submissions" },
      { label: "Archived", href: "/editor/submissions?queue=archived" },
    ],
  },
  {
    label: "Monitoring",
    items: [
      { label: "Production", href: "/editor/submissions?stage=production" },
      { label: "Copyediting", href: "/editor/submissions?stage=copyediting" },
      { label: "Review", href: "/editor/submissions?stage=review" },
    ],
  },
];

export function EditorSideNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <aside className="hidden w-72 flex-col border-r border-[var(--border)] bg-[#102940] text-white lg:flex">
      <div className="px-6 py-6">
        <div className="text-lg font-semibold tracking-wide">Editorial Workflow</div>
        <p className="text-sm text-white/70">Kelola submission lintas tahap.</p>
      </div>
      <nav className="flex-1 space-y-6 px-6 pb-8">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            <p className="text-xs font-semibold uppercase tracking-wide text-white/60">{section.label}</p>
            <div className="mt-2 space-y-1">
              {section.items.map((item) => {
                const active = isActive(pathname, searchParams?.toString() ?? "", item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block rounded-md px-3 py-2 text-sm font-semibold transition ${
                      active ? "bg-white text-[#102940]" : "text-white/80 hover:bg-white/10"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

function isActive(pathname: string, queryString: string, targetHref: string) {
  const [targetPath, targetQuery] = targetHref.split("?");
  if (pathname !== targetPath) {
    return false;
  }
  if (!targetQuery) {
    return true;
  }
  const current = new URLSearchParams(queryString);
  const target = new URLSearchParams(targetQuery);
  for (const [key, value] of target.entries()) {
    if (current.get(key) !== value) {
      return false;
    }
  }
  return true;
}

