import Link from "next/link";

import { StageBadge } from "./stage-badge";
import type { SubmissionSummary } from "../types";

type Props = {
  submissions: SubmissionSummary[];
  emptyMessage?: string;
};

export function SubmissionTable({ submissions, emptyMessage = "Belum ada submission." }: Props) {
  if (submissions.length === 0) {
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] px-6 py-10 text-center text-sm text-[var(--muted)]">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-white shadow-sm">
      <table className="min-w-full divide-y divide-[var(--border)]">
        <thead className="bg-[var(--surface-muted)]">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Title</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Journal</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Stage</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Updated</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {submissions.map((submission) => (
            <tr key={submission.id}>
              <td className="px-4 py-3">
                <div className="text-sm font-semibold text-[var(--foreground)]">{submission.title}</div>
                <p className="text-xs text-[var(--muted)]">
                  Submitted {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(submission.submittedAt))}
                </p>
              </td>
              <td className="px-4 py-3 text-sm text-[var(--foreground)]">{submission.journalTitle ?? "—"}</td>
              <td className="px-4 py-3">
                <StageBadge stage={submission.stage} />
              </td>
              <td className="px-4 py-3 text-sm text-[var(--muted)]">{formatRelative(submission.updatedAt)}</td>
              <td className="px-4 py-3 text-right">
                <Link href={`/editor/submissions/${submission.id}`} className="text-sm font-semibold text-[var(--primary)] hover:underline">
                  Open
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatRelative(value: string) {
  try {
    const date = new Date(value);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  } catch {
    return value;
  }
}

