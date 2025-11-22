"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ReviewerAssignmentCard } from "./reviewer-assignment-card";
import { AddReviewerModal } from "./add-reviewer-modal";
import type { SubmissionReview, SubmissionStage } from "../../types";

type Props = {
  submissionId: string;
  stage: SubmissionStage;
  reviewRoundId: string;
  journalId: string;
  reviews: SubmissionReview[];
  onAddReviewer?: (data: {
    submissionId: string;
    stage: SubmissionStage;
    reviewRoundId: string;
    reviewerId: string;
    dueDate?: string;
    responseDueDate?: string;
    reviewMethod: "anonymous" | "doubleAnonymous" | "open";
    personalMessage?: string;
  }) => Promise<void>;
  onViewReview?: (reviewId: string) => void;
  onEditReview?: (reviewId: string) => void;
  onRemoveReview?: (reviewId: string) => Promise<void>;
};

/**
 * Reviewer Assignment List
 * Displays all reviewer assignments for a review round
 * Based on OJS PKP 3.3 reviewer grid
 */
export function ReviewerAssignmentList({
  submissionId,
  stage,
  reviewRoundId,
  journalId,
  reviews,
  onAddReviewer,
  onViewReview,
  onEditReview,
  onRemoveReview,
}: Props) {
  const [openAddModal, setOpenAddModal] = useState(false);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);

  const handleRemove = async (reviewId: string) => {
    if (!onRemoveReview) return;
    
    setIsRemoving(reviewId);
    try {
      await onRemoveReview(reviewId);
    } catch (error) {
      console.error("Failed to remove reviewer:", error);
    } finally {
      setIsRemoving(null);
    }
  };

  const handleAddReviewer = async (data: any) => {
    if (!onAddReviewer) return;
    
    try {
      await onAddReviewer(data);
      setOpenAddModal(false);
    } catch (error) {
      console.error("Failed to add reviewer:", error);
      throw error;
    }
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">
            Reviewers ({reviews.length})
          </h3>
          {onAddReviewer && (
            <Button
              size="sm"
              onClick={() => setOpenAddModal(true)}
            >
              Add Reviewer
            </Button>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="rounded-md border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-6 text-center text-sm text-[var(--muted)]">
            No reviewers assigned to this review round.
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <ReviewerAssignmentCard
                key={review.id}
                review={review}
                reviewRoundId={reviewRoundId}
                onView={onViewReview}
                onEdit={onEditReview}
                onRemove={onRemoveReview ? () => handleRemove(review.id) : undefined}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Reviewer Modal */}
      {openAddModal && onAddReviewer && (
        <AddReviewerModal
          open={openAddModal}
          onClose={() => setOpenAddModal(false)}
          submissionId={submissionId}
          stage={stage}
          reviewRoundId={reviewRoundId}
          journalId={journalId}
          onSubmit={handleAddReviewer}
        />
      )}
    </>
  );
}
