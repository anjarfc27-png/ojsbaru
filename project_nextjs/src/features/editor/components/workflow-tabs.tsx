"use client";

import { useState } from "react";

import { WorkflowStageView } from "./workflow-stage-view";
import { SubmissionActivityForm } from "./submission-activity-form";
import type { SubmissionDetail, SubmissionStage } from "../types";

type Props = {
  submissionId: string;
  detail: SubmissionDetail;
  currentStage: SubmissionStage;
};

export function WorkflowTabs({ submissionId, detail, currentStage }: Props) {
  const [activeTab, setActiveTab] = useState<"workflow" | "publication">("workflow");

  return (
    <div className="space-y-4">
      <div className="border-b border-[var(--border)] bg-white">
        <div className="flex">
          <button
            onClick={() => setActiveTab("workflow")}
            className={`border-b-2 px-6 py-3 text-sm font-semibold transition ${
              activeTab === "workflow"
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            Workflow
          </button>
          <button
            onClick={() => setActiveTab("publication")}
            className={`border-b-2 px-6 py-3 text-sm font-semibold transition ${
              activeTab === "publication"
                ? "border-[var(--primary)] text-[var(--primary)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            Publication
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-white p-6 shadow-sm">
        {activeTab === "workflow" && <WorkflowStageView detail={detail} stage={currentStage} />}
        {activeTab === "publication" && (
          <div className="space-y-6">
            <div>
              <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Publication Details</h2>
              <p className="text-sm text-[var(--muted)]">
                Publication tab akan menampilkan metadata, contributors, galleys, dan informasi publikasi lainnya.
              </p>
            </div>
            <div className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] p-4">
              <p className="text-sm text-[var(--muted)]">
                Fitur Publication akan diimplementasikan sesuai dengan OJS 3.3 pada tahap selanjutnya.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Activity Log Section - always visible at bottom */}
      <div className="rounded-lg border border-[var(--border)] bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-[var(--foreground)]">Activity Log</h2>
        <div className="space-y-3">
          {detail.activity.length === 0 && (
            <p className="text-sm text-[var(--muted)]">Belum ada aktivitas tercatat.</p>
          )}
          {detail.activity.map((log) => (
            <div key={log.id} className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
              <p className="text-sm font-semibold text-[var(--foreground)]">{log.category}</p>
              <p className="text-sm text-[var(--muted)]">{log.message}</p>
              <span className="text-xs text-[var(--muted)]">{formatDate(log.createdAt)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <SubmissionActivityForm submissionId={submissionId} />
        </div>
      </div>
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

