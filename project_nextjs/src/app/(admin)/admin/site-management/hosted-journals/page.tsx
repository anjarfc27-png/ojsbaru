import Link from "next/link";

import { HostedJournalsTable } from "@/features/journals/components/hosted-journals-table";
import type { HostedJournal } from "@/features/journals/types";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export default async function HostedJournalsPage() {
  // Using admin client for read operations to avoid cookies issue
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("journals")
    .select("*")
    .order("created_at", { ascending: true });

  let journals: HostedJournal[] =
    (data ?? []).map((item) => {
      const anyItem = item as Record<string, any>;
      return {
        id: anyItem.id,
        name: anyItem.title ?? anyItem.name ?? anyItem.journal_title ?? "",
        path: anyItem.path ?? anyItem.slug ?? anyItem.journal_path ?? "",
        description: anyItem.description ?? anyItem.desc ?? undefined,
        isPublic: anyItem.is_public ?? anyItem.public ?? true,
      } as HostedJournal;
    });

  const missingNameIds = journals.filter((j) => !j.name || j.name.trim().length === 0).map((j) => j.id);
  if (missingNameIds.length) {
    const { data: js } = await supabase
      .from("journal_settings")
      .select("journal_id, setting_value")
      .eq("setting_name", "name")
      .in("journal_id", missingNameIds);
    const nameMap = new Map<string, string>();
    (js ?? []).forEach((row: any) => {
      if (row.setting_value) nameMap.set(row.journal_id, row.setting_value as string);
    });
    journals = journals.map((j) => ({ ...j, name: j.name || nameMap.get(j.id) || j.path }));
  }

  const loadError = error && typeof error === 'object' && 'message' in error ? String(error.message) : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Header Bar - Light Gray */}
      <div className="bg-gray-200 px-6 py-4" style={{
        backgroundColor: '#e5e5e5',
        padding: '1rem 1.5rem'
      }}>
        {/* Breadcrumb */}
        <div className="mb-2" style={{ marginBottom: '0.5rem' }}>
          <Link 
            href="/admin" 
            style={{
              color: '#006798',
              textDecoration: 'underline',
              fontSize: '1rem'
            }}
            className="hover:no-underline"
          >
            Site Administration
          </Link>
          <span style={{ 
            color: '#6B7280', 
            margin: '0 0.5rem',
            fontSize: '1rem'
          }}>»</span>
          <span style={{ 
            color: '#111827',
            fontSize: '1rem'
          }}>Hosted Journals</span>
        </div>
        <h1 className="text-xl font-semibold text-gray-900" style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          color: '#111827'
        }}>
          Hosted Journals
        </h1>
      </div>

      {/* Content */}
      <div className="px-6 py-6" style={{
        padding: '2rem 1.5rem'
      }}>
        {loadError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-800" style={{
            padding: '1rem 1.5rem',
            fontSize: '0.875rem'
          }}>
            Gagal memuat daftar jurnal: {loadError}
          </div>
        ) : (
          <HostedJournalsTable journals={journals} />
        )}
      </div>
    </div>
  );
}

