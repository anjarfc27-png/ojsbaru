import Link from "next/link";

import { AdminActionLink } from "@/components/admin/admin-action-link";

const SITE_MANAGEMENT_LINKS = [
  {
    label: "Jurnal yang Dikelola",
    href: "/admin/site-management/hosted-journals",
  },
  {
    label: "Pengaturan Situs",
    href: "/admin/site-settings/site-setup",
  },
];

const ADMIN_FUNCTIONS_LINKS = [
  {
    label: "Informasi Sistem",
    href: "/admin/system/system-information",
    actionType: "link" as const,
  },
  {
    label: "Akhiri Sesi Pengguna",
    href: "/admin/system/expire-sessions",
    actionType: "form" as const,
    confirmMessage: "Tindakan ini akan mengeluarkan seluruh pengguna. Lanjutkan?",
  },
  {
    label: "Hapus Data Cache",
    href: "/admin/system/clear-data-caches",
    actionType: "form" as const,
  },
  {
    label: "Hapus Template Cache",
    href: "/admin/system/clear-template-cache",
    actionType: "form" as const,
  },
  {
    label: "Bersihkan Log Eksekusi Tugas Terjadwal",
    href: "/admin/system/clear-scheduled-tasks",
    actionType: "form" as const,
  },
];

export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <div className="rounded-md border border-[var(--border)] bg-white px-6 py-5 shadow-sm">
        <div className="space-y-6">
          <div>
            <h2 className="mb-3 text-base font-bold text-[var(--foreground)]">Manajemen Situs</h2>
            <div className="space-y-1">
              {SITE_MANAGEMENT_LINKS.map((link) => (
                <div key={link.href}>
                  <Link href={link.href} className="text-sm text-[var(--primary)] underline hover:no-underline">
                    {link.label}
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-base font-bold text-[var(--foreground)]">Fungsi Administratif</h2>
            <div className="space-y-1">
              {ADMIN_FUNCTIONS_LINKS.map((link) => (
                <div key={link.href}>
                  {link.actionType === "form" ? (
                    <AdminActionLink href={link.href} confirmMessage={link.confirmMessage}>
                      {link.label}
                    </AdminActionLink>
                  ) : (
                    <Link href={link.href} className="text-sm text-[var(--primary)] underline hover:no-underline">
                      {link.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}