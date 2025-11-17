import { PageHeader } from "@/components/admin/page-header";
import { SubmissionTable } from "@/features/editor/components/submission-table";
import { getEditorDashboardStats, getSessionUserId, listSubmissions } from "@/features/editor/data";

export default async function EditorDashboardPage() {
  const userId = await getSessionUserId();
  const [stats, myQueue] = await Promise.all([
    getEditorDashboardStats(userId),
    listSubmissions({ queue: "my", limit: 5, editorId: userId }),
  ]);

  const overviews = [
    { label: "My Queue", value: stats.myQueue },
    { label: "In Review", value: stats.inReview },
    { label: "Copyediting", value: stats.copyediting },
    { label: "Production", value: stats.production },
    { label: "Archived", value: stats.archived },
    { label: "Open Tasks", value: stats.tasks },
  ];

  return (
    <section className="space-y-10">
      <PageHeader
        title="Editor Dashboard"
        subtitle="Pantau seluruh submission lintas tahap sesuai standar OJS 3.3."
        crumbs={[
          { label: "HOME", href: "/editor/dashboard" },
          { label: "EDITORIAL", href: "/editor/dashboard" },
          { label: "DASHBOARD" },
        ]}
      />

      <div className="grid grid-cols-3 gap-4">
        {overviews.map((item) => (
          <div key={item.label} className="rounded-lg border border-[var(--border)] bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{item.label}</p>
            <p className="mt-4 text-center text-4xl font-bold text-[var(--foreground)]">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">My Queue</h2>
        <SubmissionTable submissions={myQueue} emptyMessage="Tidak ada submission yang ditugaskan." />
      </div>
    </section>
  );
}

