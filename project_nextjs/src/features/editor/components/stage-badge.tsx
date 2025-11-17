"use client";

import type { SubmissionStage } from "../types";

const STAGE_LABELS: Record<SubmissionStage, string> = {
  submission: "Submission",
  review: "Review",
  copyediting: "Copyediting",
  production: "Production",
};

const STAGE_COLORS: Record<SubmissionStage, string> = {
  submission: "bg-[#bfdbfe] text-[#1d4ed8]",
  review: "bg-[#fef3c7] text-[#b45309]",
  copyediting: "bg-[#e0e7ff] text-[#4338ca]",
  production: "bg-[#fce7f3] text-[#be185d]",
};

type Props = {
  stage: SubmissionStage;
};

export function StageBadge({ stage }: Props) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase ${STAGE_COLORS[stage]}`}>
      {STAGE_LABELS[stage]}
    </span>
  );
}

