import { ActionCard } from "@/components/admin/action-card";
import { PageHeader } from "@/components/admin/page-header";

import { ADMIN_NAV_SECTIONS } from "@/config/navigation";

export default function SiteManagementOverviewPage() {
  const siteManagement = ADMIN_NAV_SECTIONS.find(
    (section) => section.id === "site-management",
  );
  const adminFunctions = ADMIN_NAV_SECTIONS.find(
    (section) => section.id === "administrative-functions",
  );

  return (
    <section className="space-y-10">
      <PageHeader
        title="Site Administration"
        subtitle="Kelola jurnal yang di-host dan akses fungsi administratif untuk instalasi OJS Anda."
        showBreadcrumbs={false}
      />

      {siteManagement && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            Site Management
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {siteManagement.items.map((item) => (
              <ActionCard
                key={item.href}
                title={item.label}
                description={item.description}
                href={item.href}
                actionLabel="Buka"
              />
            ))}
          </div>
        </div>
      )}

      {adminFunctions && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            Administrative Functions
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {adminFunctions.items.map((item) => (
              <ActionCard
                key={item.href}
                title={item.label}
                description={item.description}
                href={item.href}
                actionLabel="Kelola"
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

