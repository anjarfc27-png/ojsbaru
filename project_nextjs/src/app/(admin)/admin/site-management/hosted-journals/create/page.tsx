import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/page-header";

import { JournalEditForm } from "@/features/journals/components/journal-edit-form";
import type { HostedJournal } from "@/features/journals/types";

const blankJournal: HostedJournal = {
  id: "new",
  name: "",
  path: "",
  description: "",
  isPublic: true,
};

export default function CreateJournalPage() {
  return (
    <section className="space-y-8">
      <PageHeader
        title="Create Journal"
        subtitle="Isi formulir berikut untuk membuat jurnal baru dalam instalasi OJS Anda."
        showBreadcrumbs={false}
      />

  <div className="rounded-lg border border-[var(--border)] bg-white p-8 shadow-sm">
        <JournalEditForm journal={blankJournal} mode="create" />
        <div className="mt-8 flex justify-end gap-3">
          <Button variant="secondary">Batal</Button>
          <Button>Buat Jurnal</Button>
        </div>
      </div>
    </section>
  );
}

