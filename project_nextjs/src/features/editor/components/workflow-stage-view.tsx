import { SubmissionParticipantsPanel } from "./submission-participants-panel";
import { SubmissionFileGrid } from "./submission-file-grid";
import { ReviewRoundsPanel } from "./review-rounds-panel";
import { WorkflowStageActions } from "./workflow-stage-actions";
import type { SubmissionDetail, SubmissionStage } from "../types";

type Props = {
  detail: SubmissionDetail;
  stage: SubmissionStage;
};

export function WorkflowStageView({ detail, stage }: Props) {
  const { summary, files, reviewRounds } = detail;

  return (
    <div className="flex gap-6">
      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 space-y-6">
        <div className="rounded-lg border border-[var(--border)] bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">Editorial Actions</h3>
          <WorkflowStageActions submissionId={summary.id} currentStage={stage} status={summary.status} />
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-white p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-[var(--foreground)]">Participants</h3>
          <SubmissionParticipantsPanel submissionId={summary.id} journalId={summary.journalId} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-6">
        <div className="rounded-lg border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Files</h2>
          <SubmissionFileGrid submissionId={summary.id} stage={stage} files={files} />
        </div>

        {stage === "review" && (
          <div className="rounded-lg border border-[var(--border)] bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Review Rounds</h2>
            <ReviewRoundsPanel submissionId={summary.id} rounds={reviewRounds} />
          </div>
        )}

        {/* Queries section - placeholder for future implementation */}
        <div className="rounded-lg border border-[var(--border)] bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Queries</h2>
          <p className="text-sm text-[var(--muted)]">Queries feature akan diimplementasikan kemudian.</p>
        </div>
      </div>
    </div>
  );
}

