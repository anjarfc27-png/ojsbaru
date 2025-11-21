"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { useAuth } from "@/contexts/AuthContext";
import {
  hasStageAssignment,
  canMakeDecision,
} from "../dummy-helpers";
import { STAGE_NAME_TO_ID } from "../dummy-data";
import type { SubmissionStage, SubmissionStatus } from "../types";

type Props = {
  submissionId: string;
  currentStage: SubmissionStage;
  status: SubmissionStatus;
};

// Editorial decisions mapping based on OJS workflow
type EditorialDecision = {
  action: string;
  label: string;
  description: string;
  nextStage?: SubmissionStage;
  status?: SubmissionStatus;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
};

const EDITORIAL_DECISIONS: Record<SubmissionStage, EditorialDecision[]> = {
  submission: [
    {
      action: "send_to_review",
      label: "Send to Review",
      description: "Kirim naskah ke tahap peer review",
      nextStage: "review",
      status: "in_review",
      variant: "primary"
    },
    {
      action: "send_to_copyediting",
      label: "Send to Copyediting",
      description: "Skip peer review, langsung ke tahap copyediting",
      nextStage: "copyediting",
      status: "accepted",
      variant: "outline"
    },
    {
      action: "decline_submission",
      label: "Decline Submission",
      description: "Tolak naskah di tahap awal",
      status: "declined",
      variant: "danger"
    }
  ],
  review: [
    {
      action: "accept",
      label: "Accept Submission",
      description: "Terima naskah tanpa revisi",
      nextStage: "copyediting",
      status: "accepted",
      variant: "primary"
    },
    {
      action: "pending_revisions",
      label: "Pending Revisions",
      description: "Mint revisi ke penulis",
      status: "in_review",
      variant: "outline"
    },
    {
      action: "resubmit_for_review",
      label: "Resubmit for Review",
      description: "Minta penulis kirim ulang setelah revisi",
      status: "in_review",
      variant: "outline"
    },
    {
      action: "decline",
      label: "Decline Submission",
      description: "Tolak naskah setelah review",
      status: "declined",
      variant: "danger"
    },
    {
      action: "new_review_round",
      label: "New Review Round",
      description: "Mulai putaran review baru",
      status: "in_review",
      variant: "outline"
    }
  ],
  copyediting: [
    {
      action: "send_to_production",
      label: "Send to Production",
      description: "Kirim ke tahap produksi/layout",
      nextStage: "production",
      status: "accepted",
      variant: "primary"
    },
    {
      action: "request_author_copyedit",
      label: "Request Author Copyedit",
      description: "Minta penulis melakukan copyediting",
      status: "accepted",
      variant: "outline"
    }
  ],
  production: [
    {
      action: "schedule_publication",
      label: "Schedule Publication",
      description: "Jadwalkan untuk publikasi",
      status: "scheduled",
      variant: "primary"
    },
    {
      action: "publish",
      label: "Publish",
      description: "Publikasikan secara langsung",
      status: "published",
      variant: "primary"
    },
    {
      action: "send_to_issue",
      label: "Send to Issue",
      description: "Kirim ke issue tertentu",
      status: "scheduled",
      variant: "outline"
    }
  ]
};

export function WorkflowStageActions({ submissionId, currentStage, status }: Props) {
  const router = useRouter();
  const { user } = useAuth();
  const [note, setNote] = useState("");
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Get current user ID or fallback to dummy user ID
  const currentUserId = user?.id || "current-user-id";
  
  // Get stage ID for permission checking
  const stageId = STAGE_NAME_TO_ID[currentStage] || 1;

  // Check if user has assignment and can make decisions
  const hasAssignment = useMemo(
    () => hasStageAssignment(submissionId, currentUserId, stageId),
    [submissionId, currentUserId, stageId]
  );

  const canDecide = useMemo(
    () => canMakeDecision(submissionId, currentUserId, stageId),
    [submissionId, currentUserId, stageId]
  );

  const handleDecision = (decision: EditorialDecision) => {
    // Permission check before proceeding
    if (!hasAssignment) {
      setFeedback({
        tone: "error",
        message: "Anda tidak memiliki akses untuk melakukan keputusan editorial ini.",
      });
      return;
    }

    if (!canDecide) {
      setFeedback({
        tone: "error",
        message: "Anda hanya dapat merekomendasikan, tidak dapat membuat keputusan final.",
      });
      return;
    }

    startTransition(async () => {
      setFeedback(null);
      try {
        const res = await fetch(`/api/editor/submissions/${submissionId}/workflow`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            action: decision.action,
            targetStage: decision.nextStage || currentStage,
            status: decision.status || status,
            note: note.trim() || undefined 
          }),
        });
        const json = await res.json();
        if (!json.ok) {
          setFeedback({ tone: "error", message: json.message ?? "Tidak dapat memperbarui workflow." });
          return;
        }
        setFeedback({ tone: "success", message: `Keputusan: ${decision.label} berhasil diterapkan.` });
        setNote("");
        router.refresh();
      } catch {
        setFeedback({ tone: "error", message: "Kesalahan jaringan saat memperbarui workflow." });
      }
    });
  };

  // Filter decisions based on permissions
  const currentDecisions = useMemo(() => {
    const decisions = EDITORIAL_DECISIONS[currentStage] || [];
    
    // If user doesn't have assignment, don't show any decisions
    if (!hasAssignment) {
      return [];
    }
    
    // If user can only recommend, disable decision actions (but still show them)
    // In real OJS, recommend-only editors can still see but not execute
    return decisions;
  }, [currentStage, hasAssignment]);

  return (
    <div className="rounded-lg border border-[var(--border)] bg-white p-4 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">
          Editorial Decisions - {currentStage.charAt(0).toUpperCase() + currentStage.slice(1)} Stage
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {currentDecisions.map((decision) => (
            <div key={decision.action} className="border border-[var(--border)] rounded-md p-3 hover:bg-[var(--surface-muted)]">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm text-[var(--foreground)]">{decision.label}</div>
                  <div className="text-xs text-[var(--muted)] mt-1">{decision.description}</div>
                </div>
                <Button
                  size="sm"
                  variant={decision.variant || "primary"}
                  onClick={() => handleDecision(decision)}
                  loading={isPending}
                  disabled={isPending || !hasAssignment || !canDecide}
                  className="ml-2"
                  title={
                    !hasAssignment
                      ? "Anda tidak memiliki akses untuk keputusan ini"
                      : !canDecide
                      ? "Anda hanya dapat merekomendasikan"
                      : undefined
                  }
                >
                  Apply
                </Button>
              </div>
            </div>
          ))}
        </div>
        {currentDecisions.length === 0 && (
          <div className="text-sm text-[var(--muted)] text-center py-4">
            {!hasAssignment
              ? "Anda tidak memiliki akses untuk membuat keputusan editorial pada stage ini."
              : "No editorial decisions available for this stage."}
          </div>
        )}
      </div>

      <div className="border-t border-[var(--border)] pt-4">
        <label className="block text-sm text-[var(--foreground)]">
          <span className="mb-2 block font-semibold">Decision Note (Optional)</span>
          <textarea
            rows={3}
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Add a note about this decision..."
            className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm shadow-inner focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-muted)]"
          />
        </label>
      </div>

      {feedback && (
        <div className="mt-4">
          <FormMessage tone={feedback.tone}>{feedback.message}</FormMessage>
        </div>
      )}
    </div>
  );
}

