import { PageHeader } from "@/components/admin/page-header";

import { HostedJournalsTable } from "@/features/journals/components/hosted-journals-table";
import type { HostedJournal } from "@/features/journals/types";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function HostedJournalsPage() {
  // Using admin client for read operations to avoid cookies issue
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("journals")
    .select("id, title, path, description, is_public")
    .order("created_at", { ascending: true });

  const journals: HostedJournal[] =
    data?.map((item) => ({
      id: item.id,
      name: item.title,
      path: item.path,
      description: item.description ?? undefined,
      isPublic: item.is_public ?? true,
    })) ?? [];

  const loadError = error ? error.message : null;

  return (
    <section className="space-y-10">
      <PageHeader
        title="Hosted Journals"
        subtitle={
          <span>
            Kelola jurnal di instalasi OJS Anda. Gunakan panel di bawah untuk menambah,
            memperbarui, atau menghapus jurnal yang di-host.
          </span>
        }
        crumbs={[
          { label: "HOME", href: "/admin/dashboard" },
          { label: "ADMINISTRATION", href: "/admin/dashboard" },
          { label: "HOSTED JOURNALS" },
        ]}
      />

      {loadError ? (
        <div className="rounded-lg border border-[var(--border)] bg-[#fef2f2] px-6 py-4 text-sm text-[#b91c1c]">
          Gagal memuat daftar jurnal: {loadError}
        </div>
      ) : (
        <HostedJournalsTable journals={journals} />
      )}
    </section>
  );
}

