import type { ReactNode } from "react";

import { Breadcrumbs } from "@/components/common/breadcrumbs";

type Props = {
  title: string;
  subtitle?: ReactNode;
  crumbs?: { label: string; href?: string }[];
  actions?: ReactNode;
  showBreadcrumbs?: boolean;
};

export function PageHeader({ title, subtitle, crumbs = [], actions, showBreadcrumbs = true }: Props) {
  return (
    <header className="mb-8 space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-3">
          {showBreadcrumbs && crumbs.length > 0 && <Breadcrumbs crumbs={crumbs} />}
          <h1 className="text-3xl font-semibold text-[var(--foreground)]">
            {title}
          </h1>
          {subtitle && (
            <div className="text-sm leading-relaxed text-[var(--muted)]">
              {subtitle}
            </div>
          )}
        </div>
        {actions}
      </div>
    </header>
  );
}

