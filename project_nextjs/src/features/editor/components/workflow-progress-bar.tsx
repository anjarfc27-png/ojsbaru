"use client";

import Link from "next/link";

import type { SubmissionStage } from "../types";

const WORKFLOW_STAGES: Array<{ id: SubmissionStage; label: string; path: string }> = [
  { id: "submission", label: "Submission", path: "submission" },
  { id: "review", label: "Review", path: "review" },
  { id: "copyediting", label: "Copyediting", path: "copyediting" },
  { id: "production", label: "Production", path: "production" },
];

type Props = {
  submissionId: string;
  currentStage: SubmissionStage;
};

export function WorkflowProgressBar({ submissionId, currentStage }: Props) {
  const currentStageIndex = WORKFLOW_STAGES.findIndex((s) => s.id === currentStage);

  return (
    <div className="border-b-2 border-[var(--border)] bg-white shadow-sm">
      <div className="flex">
        {WORKFLOW_STAGES.map((stage, index) => {
          const isCurrent = stage.id === currentStage;
          const isPast = index < currentStageIndex;
          const href = `/editor/submissions/${submissionId}?stage=${stage.id}`;

          return (
            <Link
              key={stage.id}
              href={href}
              className={`flex-1 border-b-4 px-6 py-4 text-center text-sm font-bold transition ${
                isCurrent
                  ? "border-[var(--primary)] bg-blue-50 text-[var(--primary)]"
                  : isPast
                    ? "border-transparent bg-gray-50 text-gray-700 hover:bg-gray-100"
                    : "border-transparent bg-white text-gray-400 hover:bg-gray-50"
              }`}
            >
              {stage.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

