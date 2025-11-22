"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { PkpButton } from "@/components/ui/pkp-button";
import { FormMessage } from "@/components/ui/form-message";
import { NewReviewRoundForm } from "./editor-decision-forms/new-review-round-form";
import { ReviewerAssignmentList } from "./reviewer-assignment/reviewer-assignment-list";
import { saveEditorDecision } from "../actions/editor-decisions";
import { assignReviewer, removeReviewerAssignment } from "../actions/reviewer-assignment";
import type { SubmissionReviewRound, SubmissionStage } from "../types";
import { SUBMISSION_EDITOR_DECISION_NEW_ROUND } from "../types";
import { SUBMISSION_STAGES } from "../types";

type Props = {
  submissionId: string;
  rounds: SubmissionReviewRound[];
  journalId: string;
};

export function ReviewRoundsPanel({ submissionId, rounds, journalId }: Props) {
  const router = useRouter();
  const [openNewRoundModal, setOpenNewRoundModal] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  const handleCreateRound = async (data: {
    submissionId: string;
    stage: SubmissionStage;
    decision: typeof SUBMISSION_EDITOR_DECISION_NEW_ROUND;
    reviewRoundId?: string;
    selectedFiles?: string[];
  }) => {
    setFeedback(null);
    try {
      const result = await saveEditorDecision({
        submissionId: data.submissionId,
        stage: data.stage,
        decision: data.decision,
        reviewRoundId: data.reviewRoundId,
        selectedFiles: data.selectedFiles,
      });

      if (!result.ok) {
        setFeedback({ tone: "error", message: result.error ?? "Failed to create review round" });
        return;
      }

      setFeedback({ tone: "success", message: result.message ?? "Review round created successfully" });
      setOpenNewRoundModal(false);
      router.refresh();
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Failed to create review round",
      });
    }
  };

  const handleAddReviewer = async (data: {
    submissionId: string;
    stage: SubmissionStage;
    reviewRoundId: string;
    reviewerId: string;
    dueDate?: string;
    responseDueDate?: string;
    reviewMethod: "anonymous" | "doubleAnonymous" | "open";
    personalMessage?: string;
  }) => {
    setFeedback(null);
    try {
      const result = await assignReviewer(data);
      if (!result.ok) {
        setFeedback({ tone: "error", message: result.error ?? "Failed to assign reviewer" });
        return;
      }
      setFeedback({ tone: "success", message: result.message ?? "Reviewer assigned successfully" });
      router.refresh();
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Failed to assign reviewer",
      });
      throw error;
    }
  };

  const handleRemoveReviewer = async (reviewId: string) => {
    setFeedback(null);
    try {
      const result = await removeReviewerAssignment(reviewId);
      if (!result.ok) {
        setFeedback({ tone: "error", message: result.error ?? "Failed to remove reviewer" });
        return;
      }
      setFeedback({ tone: "success", message: result.message ?? "Reviewer removed successfully" });
      router.refresh();
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Failed to remove reviewer",
      });
    }
  };

  // Get current review round (if any)
  const currentReviewRound = rounds.length > 0 ? rounds[rounds.length - 1] : undefined;

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {/* Header - OJS 3.3 Style */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
          }}
        >
          <h3
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#002C40",
            }}
          >
            Review Rounds ({rounds.length})
          </h3>
          <PkpButton
            variant="primary"
            size="sm"
            onClick={() => setOpenNewRoundModal(true)}
          >
            New Review Round
          </PkpButton>
        </div>

        {feedback && (
          <div style={{ marginTop: "0.5rem" }}>
            <FormMessage tone={feedback.tone}>{feedback.message}</FormMessage>
          </div>
        )}

        {/* Review Rounds List - OJS 3.3 Style */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {rounds.length === 0 ? (
            <div
              style={{
                borderRadius: "0.25rem",
                border: "1px dashed #e5e5e5",
                backgroundColor: "#f8f9fa",
                padding: "1.5rem",
                textAlign: "center",
                fontSize: "0.875rem",
                color: "rgba(0, 0, 0, 0.54)",
              }}
            >
              Belum ada review round.
            </div>
          ) : (
            rounds.map((round) => (
              <div
                key={round.id}
                style={{
                  borderRadius: "0.25rem",
                  border: "1px solid #e5e5e5",
                  backgroundColor: "#ffffff",
                  padding: "1rem",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                }}
              >
                {/* Round Header */}
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.75rem",
                    marginBottom: "0.75rem",
                    paddingBottom: "0.75rem",
                    borderBottom: "1px solid #e5e5e5",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 600,
                        color: "#002C40",
                        marginBottom: "0.25rem",
                      }}
                    >
                      {round.stage} · Round {round.round}
                    </p>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        color: "rgba(0, 0, 0, 0.54)",
                      }}
                    >
                      Status: {round.status}
                    </p>
                  </div>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      color: "rgba(0, 0, 0, 0.54)",
                    }}
                  >
                    {formatDate(round.startedAt)}
                    {round.closedAt && ` · Closed ${formatDate(round.closedAt)}`}
                  </p>
                </div>

                {/* Round Notes */}
                {round.notes && (
                  <p
                    style={{
                      marginTop: "0.5rem",
                      marginBottom: "0.75rem",
                      fontSize: "0.875rem",
                      color: "rgba(0, 0, 0, 0.84)",
                      lineHeight: "1.5",
                    }}
                  >
                    {round.notes}
                  </p>
                )}

                {/* Reviewer Assignment List */}
                <div style={{ marginTop: "1rem" }}>
                  <ReviewerAssignmentList
                    submissionId={submissionId}
                    stage={round.stage}
                    reviewRoundId={round.id}
                    journalId={journalId}
                    reviews={round.reviews}
                    onAddReviewer={handleAddReviewer}
                    onRemoveReview={handleRemoveReviewer}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* New Review Round Modal */}
      {openNewRoundModal && (
        <NewReviewRoundForm
          open={openNewRoundModal}
          onClose={() => setOpenNewRoundModal(false)}
          submissionId={submissionId}
          stage="review"
          reviewRoundId={currentReviewRound?.id}
          onSubmit={handleCreateRound}
        />
      )}
    </>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
  } catch {
    return value;
  }
}

