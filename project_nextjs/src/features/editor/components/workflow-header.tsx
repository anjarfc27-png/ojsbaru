import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { SubmissionSummary } from "../types";

type Props = {
  submission: SubmissionSummary;
  authorName?: string;
};

export function WorkflowHeader({ submission, authorName = "—" }: Props) {
  const statusBadge = getStatusBadge(submission.status);

  return (
    <div className="border-b-2 border-[var(--border)] bg-white px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-base">
          {statusBadge && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                statusBadge.variant === "success"
                  ? "bg-green-100 text-green-800"
                  : statusBadge.variant === "primary"
                    ? "bg-blue-100 text-blue-800"
                    : statusBadge.variant === "warning"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
              }`}
            >
              {statusBadge.label}
            </span>
          )}
          <span className="font-bold text-[var(--foreground)]">{submission.id}</span>
          <span className="text-[var(--muted)] font-normal">/</span>
          <span className="text-[var(--foreground)]">{authorName}</span>
          <span className="text-[var(--muted)] font-normal">/</span>
          <span className="text-[var(--foreground)] font-medium">{submission.title}</span>
        </div>
        <div className="flex items-center gap-2">
          {submission.status === "published" && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/submissions/${submission.id}`} target="_blank">
                View
              </Link>
            </Button>
          )}
          {submission.status !== "published" && submission.stage === "production" && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/submissions/${submission.id}/preview`} target="_blank">
                Preview
              </Link>
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href={`/editor/submissions/${submission.id}#activity`}>Activity Log</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/editor/submissions/${submission.id}/library`}>Submission Library</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function getStatusBadge(status: string): { label: string; variant: "success" | "primary" | "warning" | "default" } | null {
  switch (status) {
    case "published":
      return { label: "Published", variant: "success" };
    case "scheduled":
      return { label: "Scheduled", variant: "primary" };
    case "declined":
      return { label: "Declined", variant: "warning" };
    default:
      return null;
  }
}

