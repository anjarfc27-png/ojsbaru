import Link from "next/link";

import { PageHeader } from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubmissionTable } from "@/features/editor/components/submission-table";
import { getSessionUserId, listSubmissions } from "@/features/editor/data";
import type { SubmissionStage } from "@/features/editor/types";

type Props = {
  searchParams: Promise<Record<string, string | undefined>>;
};

const STAGE_FILTERS: SubmissionStage[] = ["submission", "review", "copyediting", "production"];

export default async function SubmissionIndexPage({ searchParams }: Props) {
  const resolved = await searchParams;
  const queueParam = resolved.queue ?? "all";
  const queue: "my" | "all" | "archived" = queueParam === "my" || queueParam === "archived" ? queueParam : "all";
  const stage = (resolved.stage as SubmissionStage | undefined) && STAGE_FILTERS.includes(resolved.stage as SubmissionStage)
    ? (resolved.stage as SubmissionStage)
    : undefined;
  const search = resolved.search ?? "";

  const userId = await getSessionUserId();
  const submissions = await listSubmissions({
    queue,
    stage,
    search,
    editorId: queue === "my" ? userId : undefined,
  });

  return (
    <section className="space-y-8">
      <PageHeader
        title="Editorial Queue"
        subtitle="Daftar submission aktif sesuai standar workflow OJS 3.3."
        crumbs={[
          { label: "HOME", href: "/editor/dashboard" },
          { label: "EDITORIAL", href: "/editor/dashboard" },
          { label: "QUEUE" },
        ]}
      />

      <FilterBar currentQueue={queue} currentStage={stage} search={search} />

      <SubmissionTable submissions={submissions} emptyMessage="Tidak ditemukan submission dengan filter saat ini." />
    </section>
  );
}

function FilterBar({
  currentQueue,
  currentStage,
  search,
}: {
  currentQueue: "my" | "all" | "archived";
  currentStage?: SubmissionStage;
  search: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-[var(--border)] bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap gap-2">
        {[
          { label: "My Queue", href: "/editor/submissions?queue=my" },
          { label: "All Active", href: "/editor/submissions" },
          { label: "Archived", href: "/editor/submissions?queue=archived" },
        ].map((filter) => {
          const active =
            (filter.href.includes("queue=my") && currentQueue === "my") ||
            (filter.href.includes("queue=archived") && currentQueue === "archived") ||
            (filter.href === "/editor/submissions" && currentQueue === "all");
          return (
            <Link
              key={filter.label}
              href={filter.href}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                active ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-muted)] text-[var(--foreground)]"
              }`}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-2">
          {STAGE_FILTERS.map((stage) => {
            const active = currentStage === stage;
            return (
              <Link
                key={stage}
                href={`/editor/submissions?stage=${stage}${currentQueue !== "all" ? `&queue=${currentQueue}` : ""}`}
                className={`rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wide ${
                  active ? "bg-[var(--primary)] text-white" : "bg-[var(--surface-muted)] text-[var(--foreground)]"
                }`}
              >
                {stage}
              </Link>
            );
          })}
          <Link
            href={`/editor/submissions${currentQueue !== "all" ? `?queue=${currentQueue}` : ""}`}
            className="rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)] hover:text-[var(--foreground)]"
          >
            Clear
          </Link>
        </div>
        <form className="flex items-center gap-2" action="/editor/submissions" method="get">
          {currentQueue !== "all" && <input type="hidden" name="queue" value={currentQueue} />}
          {currentStage && <input type="hidden" name="stage" value={currentStage} />}
          <Input
            type="search"
            name="search"
            placeholder="Cari judul…"
            defaultValue={search}
            className="h-10 w-40"
          />
          <Button type="submit" size="sm">
            Cari
          </Button>
        </form>
      </div>
    </div>
  );
}

