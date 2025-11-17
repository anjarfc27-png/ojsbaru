import { notFound } from "next/navigation";

import { getSubmissionDetail } from "@/features/editor/data";
import { WorkflowHeader } from "@/features/editor/components/workflow-header";
import { WorkflowProgressBar } from "@/features/editor/components/workflow-progress-bar";
import { WorkflowTabs } from "@/features/editor/components/workflow-tabs";
import type { SubmissionStage } from "@/features/editor/types";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
};

const VALID_STAGES: SubmissionStage[] = ["submission", "review", "copyediting", "production"];

export default async function SubmissionDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const resolved = await searchParams;
  const stageParam = resolved.stage as SubmissionStage | undefined;
  const stage: SubmissionStage =
    stageParam && VALID_STAGES.includes(stageParam) ? stageParam : "submission";

  const detail = await getSubmissionDetail(id);

  if (!detail) {
    notFound();
  }

  // Extract author name from metadata
  const authorName =
    (detail.metadata as { authors?: Array<{ givenName?: string; familyName?: string }> })?.authors?.[0]
      ? `${(detail.metadata as { authors?: Array<{ givenName?: string; familyName?: string }> })?.authors?.[0]?.givenName ?? ""} ${(detail.metadata as { authors?: Array<{ givenName?: string; familyName?: string }> })?.authors?.[0]?.familyName ?? ""}`.trim() || "—"
      : "—";

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[var(--surface-muted)]">
      <WorkflowHeader submission={detail.summary} authorName={authorName} />
      <WorkflowProgressBar submissionId={id} currentStage={stage} />
      <div className="flex-1 overflow-y-auto p-6">
        <WorkflowTabs submissionId={id} detail={detail} currentStage={stage} />
      </div>
    </div>
  );
}

