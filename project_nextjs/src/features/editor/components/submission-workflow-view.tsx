import { StageBadge } from "./stage-badge";
import { WorkflowStageActions } from "./workflow-stage-actions";
import { SubmissionParticipantsPanel } from "./submission-participants-panel";
import { SubmissionActivityForm } from "./submission-activity-form";
import { SubmissionFileGrid } from "./submission-file-grid";
import { ReviewRoundsPanel } from "./review-rounds-panel";
import type { SubmissionDetail, SubmissionStage } from "../types";

type Props = {
  detail: SubmissionDetail;
};

export function SubmissionWorkflowView({ detail }: Props) {
  const { summary, versions, files, activity } = detail;

  return (
    <div className="space-y-8">
      <section className="space-y-4 rounded-lg border border-[var(--border)] bg-white p-6 shadow-sm">
        <header className="space-y-3">
          <h1 className="text-2xl font-semibold text-[var(--foreground)]">{summary.title}</h1>
          <div className="flex flex-wrap items-center gap-3">
            <StageBadge stage={summary.stage} />
            <span className="text-sm text-[var(--muted)]">Status: {summary.status}</span>
            <span className="text-sm text-[var(--muted)]">
              Submitted {formatDate(summary.submittedAt)} · Updated {formatDate(summary.updatedAt)}
            </span>
          </div>
        </header>
        <dl className="grid gap-4 md:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">Journal</dt>
            <dd className="text-sm text-[var(--foreground)]">{summary.journalTitle ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">ID</dt>
            <dd className="text-sm text-[var(--foreground)]">{summary.id}</dd>
          </div>
        </dl>
        <WorkflowStageActions submissionId={summary.id} currentStage={summary.stage} status={summary.status} />
      </section>

      <section className="space-y-4 rounded-lg border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Participants</h2>
        <SubmissionParticipantsPanel submissionId={summary.id} journalId={summary.journalId} />
      </section>

      <section className="space-y-4 rounded-lg border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Versions</h2>
        <div className="space-y-3">
          {versions.length === 0 && <p className="text-sm text-[var(--muted)]">Belum ada versi yang disimpan.</p>}
          {versions.map((version) => (
            <div key={version.id} className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong>Version {version.version}</strong>
                <span className="text-[var(--muted)]">{formatDate(version.createdAt)}</span>
              </div>
              <p className="text-[var(--muted)]">
                Status: {version.status}
                {version.issue?.title && ` · Issue ${version.issue.volume ?? ""} (${version.issue.year ?? ""})`}
              </p>
            </div>
          ))}
        </div>
      </section>

      {renderFileSection("Submission Files", "submission", summary.id, files)}
      {renderFileSection("Review Files", "review", summary.id, files)}
      {renderFileSection("Copyediting Files", "copyediting", summary.id, files)}
      {renderFileSection("Production Files", "production", summary.id, files)}

      <section className="space-y-4 rounded-lg border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Review Rounds</h2>
        <ReviewRoundsPanel submissionId={summary.id} rounds={detail.reviewRounds} />
      </section>

      <section className="space-y-4 rounded-lg border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Activity Log</h2>
        <div className="space-y-3">
          {activity.length === 0 && <p className="text-sm text-[var(--muted)]">Belum ada aktivitas tercatat.</p>}
          {activity.map((log) => (
            <div key={log.id} className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
              <p className="text-sm font-semibold text-[var(--foreground)]">{log.category}</p>
              <p className="text-sm text-[var(--muted)]">{log.message}</p>
              <span className="text-xs text-[var(--muted)]">{formatDate(log.createdAt)}</span>
            </div>
          ))}
        </div>
        <SubmissionActivityForm submissionId={summary.id} />
      </section>
    </div>
  );
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function renderFileSection(title: string, stage: SubmissionStage, submissionId: string, files: SubmissionDetail["files"]) {
  return (
    <section className="space-y-4 rounded-lg border border-[var(--border)] bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-[var(--foreground)]">{title}</h2>
      <SubmissionFileGrid submissionId={submissionId} stage={stage} files={files} />
    </section>
  );
}

