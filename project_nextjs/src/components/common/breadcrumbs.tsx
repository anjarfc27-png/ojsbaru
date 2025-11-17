import Link from "next/link";

type Crumb = {
  label: string;
  href?: string;
};

type Props = {
  crumbs: Crumb[];
};

export function Breadcrumbs({ crumbs }: Props) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]"
    >
      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        return (
          <span key={crumb.label}>
            {crumb.href && !isLast ? (
              <Link
                href={crumb.href}
                className="hover:text-[var(--primary-dark)]"
              >
                {crumb.label}
              </Link>
            ) : (
              <span>{crumb.label}</span>
            )}
            {!isLast && <span className="mx-1">/</span>}
          </span>
        );
      })}
    </nav>
  );
}

