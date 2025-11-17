import { Button } from "@/components/ui/button";
import { fetchHostedJournals } from "@/features/journals/data";

import { getBulkEmailPermissions, updateBulkEmailPermissionsAction } from "../../actions";

export default async function SiteSetupBulkEmailsPage() {
  const [journals, permissions] = await Promise.all([fetchHostedJournals(), getBulkEmailPermissions()]);
  const allowed = new Set(permissions.permissions.filter((item) => item.allow).map((item) => item.id));

  return (
    <div className="space-y-6">
      <header className="border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Bulk Emails</h2>
      </header>
      <form action={updateBulkEmailPermissionsAction} className="space-y-6">
        <div className="space-y-3">
          {journals.length === 0 && (
            <p className="rounded-md border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm text-[var(--muted)]">
              Belum ada jurnal yang di-host. Tambahkan jurnal pada menu Hosted Journals untuk mengaktifkan izin email massal.
            </p>
          )}
          {journals.map((journal) => (
            <label
              key={journal.id}
              className="flex items-center justify-between rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3"
            >
              <input type="hidden" name="journal_id" value={journal.id} />
              <span className="text-sm font-semibold text-[var(--foreground)]">{journal.name}</span>
              <input
                type="checkbox"
                name="allow_journal"
                value={journal.id}
                defaultChecked={allowed.has(journal.id)}
                className="h-4 w-4 rounded border border-[var(--border)]"
              />
            </label>
          ))}
        </div>
        <div className="space-y-3 text-sm text-[var(--muted)]">
          <p>Pastikan kebijakan anti-spam & privasi user telah dipenuhi sebelum mengaktifkan email massal.</p>
        </div>
        <div className="mt-4 flex justify-end gap-3">
          <Button type="submit">Save</Button>
        </div>
      </form>
    </div>
  );
}