"use server";

/**
 * Editor Decision Server Actions
 * Based on OJS PKP 3.3 PKPEditorDecisionHandler
 * 
 * These actions simulate saving editor decisions using dummy data.
 * In production, these will interact with the database.
 */

import type {
  EditorDecisionType,
  EditorRecommendationType,
  SubmissionStage,
} from "../types";
import {
  SUBMISSION_EDITOR_DECISION_EXTERNAL_REVIEW,
  SUBMISSION_EDITOR_DECISION_ACCEPT,
  SUBMISSION_EDITOR_DECISION_DECLINE,
  SUBMISSION_EDITOR_DECISION_INITIAL_DECLINE,
  SUBMISSION_EDITOR_DECISION_PENDING_REVISIONS,
  SUBMISSION_EDITOR_DECISION_RESUBMIT,
  SUBMISSION_EDITOR_DECISION_SEND_TO_PRODUCTION,
  SUBMISSION_EDITOR_DECISION_REVERT_DECLINE,
  SUBMISSION_EDITOR_DECISION_NEW_ROUND,
} from "../types";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  assertEditorAccess,
  getSubmissionRow,
  logActivity,
  createReviewRound,
  SubmissionRow,
} from "./workflow-helpers";

type DecisionData = {
  submissionId: string;
  stage: SubmissionStage;
  decision: EditorDecisionType | EditorRecommendationType;
  reviewRoundId?: string;
  skipEmail?: boolean;
  personalMessage?: string;
  selectedFiles?: string[];
  reviewAttachments?: string[];
  decisionType?: "pendingRevisions" | "resubmit" | "decline";
  recommendation?: EditorRecommendationType;
  skipDiscussion?: boolean;
};

type ActionResult = {
  ok: boolean;
  message?: string;
  error?: string;
};

const STAGE_TRANSITIONS: Record<
  EditorDecisionType,
  { nextStage?: SubmissionStage; status?: string; archive?: boolean }
> = {
  [SUBMISSION_EDITOR_DECISION_EXTERNAL_REVIEW]: {
    nextStage: "review",
    status: "queued",
  },
  [SUBMISSION_EDITOR_DECISION_ACCEPT]: {
    nextStage: "copyediting",
    status: "accepted",
  },
  [SUBMISSION_EDITOR_DECISION_DECLINE]: {
    status: "declined",
    archive: true,
  },
  [SUBMISSION_EDITOR_DECISION_INITIAL_DECLINE]: {
    status: "declined",
    archive: true,
  },
  [SUBMISSION_EDITOR_DECISION_PENDING_REVISIONS]: {},
  [SUBMISSION_EDITOR_DECISION_RESUBMIT]: {
    nextStage: "review",
    status: "queued",
  },
  [SUBMISSION_EDITOR_DECISION_SEND_TO_PRODUCTION]: {
    nextStage: "production",
    status: "in_production",
  },
  [SUBMISSION_EDITOR_DECISION_REVERT_DECLINE]: {
    status: "queued",
    archive: false,
  },
  [SUBMISSION_EDITOR_DECISION_NEW_ROUND]: {},
};

async function updateSubmission(
  submissionId: string,
  payload: Partial<Pick<SubmissionRow, "current_stage" | "status" | "is_archived">>
) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("submissions").update(payload).eq("id", submissionId);
  if (error) {
    throw new Error(error.message);
  }
}

async function applyDecisionTransition({
  decision,
  submissionId,
}: {
  decision: EditorDecisionType;
  submissionId: string;
}) {
  const transition = STAGE_TRANSITIONS[decision];
  if (!transition) {
    return;
  }

  const payload: Partial<SubmissionRow> = {};
  if (transition.nextStage) {
    payload.current_stage = transition.nextStage;
  }
  if (transition.status) {
    payload.status = transition.status;
  }
  if (typeof transition.archive === "boolean") {
    payload.is_archived = transition.archive;
  }

  if (Object.keys(payload).length > 0) {
    await updateSubmission(submissionId, payload);
  }
}
/**
 * Send to External Review
 * Based on OJS PKP 3.3 saveExternalReview
 */
export async function sendToExternalReview(
  data: DecisionData
): Promise<ActionResult> {
  try {
    const { submissionId } = data;
    const { userId } = await assertEditorAccess(submissionId);
    await getSubmission(submissionId);

    await createReviewRound(submissionId, "review");
    await applyDecisionTransition({
      decision: SUBMISSION_EDITOR_DECISION_EXTERNAL_REVIEW,
      submissionId,
    });
    await logActivity({
      submissionId,
      actorId: userId,
      category: "decision",
      message: "Submission promoted to external review.",
    });

    return {
      ok: true,
      message: "Submission sent to external review successfully",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to send to external review",
    };
  }
}

/**
 * Accept Submission
 * Based on OJS PKP 3.3 savePromote
 */
export async function acceptSubmission(
  data: DecisionData
): Promise<ActionResult> {
  try {
    const { submissionId } = data;
    const { userId } = await assertEditorAccess(submissionId);
    await getSubmission(submissionId);

    await applyDecisionTransition({
      decision: SUBMISSION_EDITOR_DECISION_ACCEPT,
      submissionId,
    });
    await logActivity({
      submissionId,
      actorId: userId,
      category: "decision",
      message: "Submission accepted.",
    });

    return {
      ok: true,
      message: "Submission accepted successfully",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to accept submission",
    };
  }
}

/**
 * Decline Submission
 * Based on OJS PKP 3.3 saveSendReviews
 */
export async function declineSubmission(
  data: DecisionData
): Promise<ActionResult> {
  try {
    const { submissionId } = data;
    const { userId } = await assertEditorAccess(submissionId);
    await getSubmission(submissionId);

    const decisionType =
      data.decision === SUBMISSION_EDITOR_DECISION_INITIAL_DECLINE
        ? SUBMISSION_EDITOR_DECISION_INITIAL_DECLINE
        : SUBMISSION_EDITOR_DECISION_DECLINE;

    await applyDecisionTransition({
      decision: decisionType,
      submissionId,
    });
    await logActivity({
      submissionId,
      actorId: userId,
      category: "decision",
      message: "Submission declined.",
    });

    return {
      ok: true,
      message: "Submission declined successfully",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to decline submission",
    };
  }
}

/**
 * Request Revisions
 * Based on OJS PKP 3.3 saveSendReviews
 */
export async function requestRevisions(
  data: DecisionData
): Promise<ActionResult> {
  try {
    const { submissionId } = data;
    const { userId } = await assertEditorAccess(submissionId);
    await getSubmission(submissionId);

    await logActivity({
      submissionId,
      actorId: userId,
      category: "decision",
      message: "Revisions requested from author.",
    });

    return {
      ok: true,
      message: "Revisions requested successfully",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to request revisions",
    };
  }
}

/**
 * Resubmit for Review
 * Based on OJS PKP 3.3 saveSendReviews (with new review round)
 */
export async function resubmitForReview(
  data: DecisionData
): Promise<ActionResult> {
  try {
    const { submissionId } = data;
    const { userId } = await assertEditorAccess(submissionId);
    await getSubmission(submissionId);

    await createReviewRound(submissionId, "review");
    await applyDecisionTransition({
      decision: SUBMISSION_EDITOR_DECISION_RESUBMIT,
      submissionId,
    });
    await logActivity({
      submissionId,
      actorId: userId,
      category: "decision",
      message: "Submission resubmitted for review.",
    });

    return {
      ok: true,
      message: "Submission resubmitted for review successfully",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to resubmit for review",
    };
  }
}

/**
 * Send to Production
 * Based on OJS PKP 3.3 savePromote
 */
export async function sendToProduction(
  data: DecisionData
): Promise<ActionResult> {
  try {
    const { submissionId } = data;
    const { userId } = await assertEditorAccess(submissionId);
    await getSubmission(submissionId);

    await applyDecisionTransition({
      decision: SUBMISSION_EDITOR_DECISION_SEND_TO_PRODUCTION,
      submissionId,
    });
    await logActivity({
      submissionId,
      actorId: userId,
      category: "decision",
      message: "Submission sent to production.",
    });

    return {
      ok: true,
      message: "Submission sent to production successfully",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to send to production",
    };
  }
}

/**
 * Revert Decline
 * Based on OJS PKP 3.3 saveRevertDecline
 */
export async function revertDecline(
  data: DecisionData
): Promise<ActionResult> {
  try {
    const { submissionId } = data;
    const { userId } = await assertEditorAccess(submissionId);
    await getSubmission(submissionId);

    await applyDecisionTransition({
      decision: SUBMISSION_EDITOR_DECISION_REVERT_DECLINE,
      submissionId,
    });
    await logActivity({
      submissionId,
      actorId: userId,
      category: "decision",
      message: "Decline decision reverted.",
    });

    return {
      ok: true,
      message: "Decline decision reverted successfully",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to revert decline",
    };
  }
}

/**
 * Send Recommendation (Recommend Only role)
 * Based on OJS PKP 3.3 saveRecommendation
 */
export async function sendRecommendation(
  data: DecisionData & { recommendation: EditorRecommendationType }
): Promise<ActionResult> {
  try {
    const { submissionId } = data;
    const { userId } = await assertEditorAccess(submissionId);
    await getSubmission(submissionId);

    await logActivity({
      submissionId,
      actorId: userId,
      category: "recommendation",
      message: `Recommendation recorded: ${data.recommendation}`,
    });

    return {
      ok: true,
      message: "Recommendation recorded successfully",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to record recommendation",
    };
  }
}

/**
 * Generic decision handler that routes to appropriate action
 */
export async function saveEditorDecision(
  data: DecisionData
): Promise<ActionResult> {
  const { decision } = data;

  try {
    switch (decision) {
      case SUBMISSION_EDITOR_DECISION_EXTERNAL_REVIEW:
        return await sendToExternalReview(data);

      case SUBMISSION_EDITOR_DECISION_ACCEPT:
        return await acceptSubmission(data);

      case SUBMISSION_EDITOR_DECISION_DECLINE:
      case SUBMISSION_EDITOR_DECISION_INITIAL_DECLINE:
        return await declineSubmission(data);

      case SUBMISSION_EDITOR_DECISION_PENDING_REVISIONS:
        return await requestRevisions(data);

      case SUBMISSION_EDITOR_DECISION_RESUBMIT:
        return await resubmitForReview(data);

      case SUBMISSION_EDITOR_DECISION_SEND_TO_PRODUCTION:
        return await sendToProduction(data);

      case SUBMISSION_EDITOR_DECISION_REVERT_DECLINE:
        return await revertDecline(data);

      case SUBMISSION_EDITOR_DECISION_NEW_ROUND: {
        const { submissionId, stage } = data;
        const { userId } = await assertEditorAccess(submissionId);
        await getSubmissionRow(submissionId);
        await createReviewRound(submissionId, stage);
        await logActivity({
          submissionId,
          actorId: userId,
          category: "decision",
          message: "New review round created.",
        });
        return {
          ok: true,
          message: "Review round created successfully",
        };
      }

      default:
        // Handle recommendations
        if ("recommendation" in data && data.recommendation) {
          return await sendRecommendation(data as DecisionData & { recommendation: EditorRecommendationType });
        }

        return {
          ok: false,
          error: `Unknown decision type: ${decision}`,
        };
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to save editor decision",
    };
  }
}

    await createReviewRound(submissionId, "review");
    await applyDecisionTransition({
      decision: SUBMISSION_EDITOR_DECISION_RESUBMIT,
      submissionId,
    });
    await logActivity({
      submissionId,
      actorId: userId,
      category: "decision",
      message: "Submission resubmitted for review.",
    });

    return {
      ok: true,
      message: "Submission resubmitted for review successfully",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to resubmit for review",
    };
  }
}

/**
 * Send to Production
 * Based on OJS PKP 3.3 savePromote
 */
export async function sendToProduction(
  data: DecisionData
): Promise<ActionResult> {
  try {
    const { submissionId } = data;
    const { userId } = await assertEditorAccess(submissionId);
    await getSubmission(submissionId);

    await applyDecisionTransition({
      decision: SUBMISSION_EDITOR_DECISION_SEND_TO_PRODUCTION,
      submissionId,
    });
    await logActivity({
      submissionId,
      actorId: userId,
      category: "decision",
      message: "Submission sent to production.",
    });

    return {
      ok: true,
      message: "Submission sent to production successfully",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to send to production",
    };
  }
}

/**
 * Revert Decline
 * Based on OJS PKP 3.3 saveRevertDecline
 */
export async function revertDecline(
  data: DecisionData
): Promise<ActionResult> {
  try {
    const { submissionId } = data;
    const { userId } = await assertEditorAccess(submissionId);
    await getSubmission(submissionId);

    await applyDecisionTransition({
      decision: SUBMISSION_EDITOR_DECISION_REVERT_DECLINE,
      submissionId,
    });
    await logActivity({
      submissionId,
      actorId: userId,
      category: "decision",
      message: "Decline decision reverted.",
    });

    return {
      ok: true,
      message: "Decline decision reverted successfully",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to revert decline",
    };
  }
}

/**
 * Send Recommendation (Recommend Only role)
 * Based on OJS PKP 3.3 saveRecommendation
 */
export async function sendRecommendation(
  data: DecisionData & { recommendation: EditorRecommendationType }
): Promise<ActionResult> {
  try {
    const { submissionId } = data;
    const { userId } = await assertEditorAccess(submissionId);
    await getSubmission(submissionId);

    await logActivity({
      submissionId,
      actorId: userId,
      category: "recommendation",
      message: `Recommendation recorded: ${data.recommendation}`,
    });

    return {
      ok: true,
      message: "Recommendation recorded successfully",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to record recommendation",
    };
  }
}

/**
 * Generic decision handler that routes to appropriate action
 */
export async function saveEditorDecision(
  data: DecisionData
): Promise<ActionResult> {
  const { decision } = data;

  try {
    switch (decision) {
      case SUBMISSION_EDITOR_DECISION_EXTERNAL_REVIEW:
        return await sendToExternalReview(data);

      case SUBMISSION_EDITOR_DECISION_ACCEPT:
        return await acceptSubmission(data);

      case SUBMISSION_EDITOR_DECISION_DECLINE:
      case SUBMISSION_EDITOR_DECISION_INITIAL_DECLINE:
        return await declineSubmission(data);

      case SUBMISSION_EDITOR_DECISION_PENDING_REVISIONS:
        return await requestRevisions(data);

      case SUBMISSION_EDITOR_DECISION_RESUBMIT:
        return await resubmitForReview(data);

      case SUBMISSION_EDITOR_DECISION_SEND_TO_PRODUCTION:
        return await sendToProduction(data);

      case SUBMISSION_EDITOR_DECISION_REVERT_DECLINE:
        return await revertDecline(data);

      case SUBMISSION_EDITOR_DECISION_NEW_ROUND: {
        const { submissionId, stage } = data;
        const { userId } = await assertEditorAccess(submissionId);
        await getSubmissionRow(submissionId);
        await createReviewRound(submissionId, stage);
        await logActivity({
          submissionId,
          actorId: userId,
          category: "decision",
          message: "New review round created.",
        });
        return {
          ok: true,
          message: "Review round created successfully",
        };
      }

      default:
        // Handle recommendations
        if ("recommendation" in data && data.recommendation) {
          return await sendRecommendation(data as DecisionData & { recommendation: EditorRecommendationType });
        }

        return {
          ok: false,
          error: `Unknown decision type: ${decision}`,
        };
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to save editor decision",
    };
  }
}

    await createReviewRound(submissionId, "review");
    await applyDecisionTransition({
      decision: SUBMISSION_EDITOR_DECISION_RESUBMIT,
      submissionId,
    });
    await logActivity({
      submissionId,
      actorId: userId,
      category: "decision",
      message: "Submission resubmitted for review.",
    });

    return {
      ok: true,
      message: "Submission resubmitted for review successfully",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to resubmit for review",
    };
  }
}

/**
 * Send to Production
 * Based on OJS PKP 3.3 savePromote
 */
export async function sendToProduction(
  data: DecisionData
): Promise<ActionResult> {
  try {
    const { submissionId } = data;
    const { userId } = await assertEditorAccess(submissionId);
    await getSubmission(submissionId);

    await applyDecisionTransition({
      decision: SUBMISSION_EDITOR_DECISION_SEND_TO_PRODUCTION,
      submissionId,
    });
    await logActivity({
      submissionId,
      actorId: userId,
      category: "decision",
      message: "Submission sent to production.",
    });

    return {
      ok: true,
      message: "Submission sent to production successfully",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to send to production",
    };
  }
}

/**
 * Revert Decline
 * Based on OJS PKP 3.3 saveRevertDecline
 */
export async function revertDecline(
  data: DecisionData
): Promise<ActionResult> {
  try {
    const { submissionId } = data;
    const { userId } = await assertEditorAccess(submissionId);
    await getSubmission(submissionId);

    await applyDecisionTransition({
      decision: SUBMISSION_EDITOR_DECISION_REVERT_DECLINE,
      submissionId,
    });
    await logActivity({
      submissionId,
      actorId: userId,
      category: "decision",
      message: "Decline decision reverted.",
    });

    return {
      ok: true,
      message: "Decline decision reverted successfully",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to revert decline",
    };
  }
}

/**
 * Send Recommendation (Recommend Only role)
 * Based on OJS PKP 3.3 saveRecommendation
 */
export async function sendRecommendation(
  data: DecisionData & { recommendation: EditorRecommendationType }
): Promise<ActionResult> {
  try {
    const { submissionId } = data;
    const { userId } = await assertEditorAccess(submissionId);
    await getSubmission(submissionId);

    await logActivity({
      submissionId,
      actorId: userId,
      category: "recommendation",
      message: `Recommendation recorded: ${data.recommendation}`,
    });

    return {
      ok: true,
      message: "Recommendation recorded successfully",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to record recommendation",
    };
  }
}

/**
 * Generic decision handler that routes to appropriate action
 */
export async function saveEditorDecision(
  data: DecisionData
): Promise<ActionResult> {
  const { decision } = data;

  try {
    switch (decision) {
      case SUBMISSION_EDITOR_DECISION_EXTERNAL_REVIEW:
        return await sendToExternalReview(data);

      case SUBMISSION_EDITOR_DECISION_ACCEPT:
        return await acceptSubmission(data);

      case SUBMISSION_EDITOR_DECISION_DECLINE:
      case SUBMISSION_EDITOR_DECISION_INITIAL_DECLINE:
        return await declineSubmission(data);

      case SUBMISSION_EDITOR_DECISION_PENDING_REVISIONS:
        return await requestRevisions(data);

      case SUBMISSION_EDITOR_DECISION_RESUBMIT:
        return await resubmitForReview(data);

      case SUBMISSION_EDITOR_DECISION_SEND_TO_PRODUCTION:
        return await sendToProduction(data);

      case SUBMISSION_EDITOR_DECISION_REVERT_DECLINE:
        return await revertDecline(data);

      case SUBMISSION_EDITOR_DECISION_NEW_ROUND: {
        const { submissionId, stage } = data;
        const { userId } = await assertEditorAccess(submissionId);
        await getSubmissionRow(submissionId);
        await createReviewRound(submissionId, stage);
        await logActivity({
          submissionId,
          actorId: userId,
          category: "decision",
          message: "New review round created.",
        });
        return {
          ok: true,
          message: "Review round created successfully",
        };
      }

      default:
        // Handle recommendations
        if ("recommendation" in data && data.recommendation) {
          return await sendRecommendation(data as DecisionData & { recommendation: EditorRecommendationType });
        }

        return {
          ok: false,
          error: `Unknown decision type: ${decision}`,
        };
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to save editor decision",
    };
  }
}

    await createReviewRound(submissionId, "review");
    await applyDecisionTransition({
      decision: SUBMISSION_EDITOR_DECISION_RESUBMIT,
      submissionId,
    });
    await logActivity({
      submissionId,
      actorId: userId,
      category: "decision",
      message: "Submission resubmitted for review.",
    });

    return {
      ok: true,
      message: "Submission resubmitted for review successfully",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to resubmit for review",
    };
  }
}

/**
 * Send to Production
 * Based on OJS PKP 3.3 savePromote
 */
export async function sendToProduction(
  data: DecisionData
): Promise<ActionResult> {
  try {
    const { submissionId } = data;
    const { userId } = await assertEditorAccess(submissionId);
    await getSubmission(submissionId);

    await applyDecisionTransition({
      decision: SUBMISSION_EDITOR_DECISION_SEND_TO_PRODUCTION,
      submissionId,
    });
    await logActivity({
      submissionId,
      actorId: userId,
      category: "decision",
      message: "Submission sent to production.",
    });

    return {
      ok: true,
      message: "Submission sent to production successfully",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to send to production",
    };
  }
}

/**
 * Revert Decline
 * Based on OJS PKP 3.3 saveRevertDecline
 */
export async function revertDecline(
  data: DecisionData
): Promise<ActionResult> {
  try {
    const { submissionId } = data;
    const { userId } = await assertEditorAccess(submissionId);
    await getSubmission(submissionId);

    await applyDecisionTransition({
      decision: SUBMISSION_EDITOR_DECISION_REVERT_DECLINE,
      submissionId,
    });
    await logActivity({
      submissionId,
      actorId: userId,
      category: "decision",
      message: "Decline decision reverted.",
    });

    return {
      ok: true,
      message: "Decline decision reverted successfully",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to revert decline",
    };
  }
}

/**
 * Send Recommendation (Recommend Only role)
 * Based on OJS PKP 3.3 saveRecommendation
 */
export async function sendRecommendation(
  data: DecisionData & { recommendation: EditorRecommendationType }
): Promise<ActionResult> {
  try {
    const { submissionId } = data;
    const { userId } = await assertEditorAccess(submissionId);
    await getSubmission(submissionId);

    await logActivity({
      submissionId,
      actorId: userId,
      category: "recommendation",
      message: `Recommendation recorded: ${data.recommendation}`,
    });

    return {
      ok: true,
      message: "Recommendation recorded successfully",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to record recommendation",
    };
  }
}

/**
 * Generic decision handler that routes to appropriate action
 */
export async function saveEditorDecision(
  data: DecisionData
): Promise<ActionResult> {
  const { decision } = data;

  try {
    switch (decision) {
      case SUBMISSION_EDITOR_DECISION_EXTERNAL_REVIEW:
        return await sendToExternalReview(data);

      case SUBMISSION_EDITOR_DECISION_ACCEPT:
        return await acceptSubmission(data);

      case SUBMISSION_EDITOR_DECISION_DECLINE:
      case SUBMISSION_EDITOR_DECISION_INITIAL_DECLINE:
        return await declineSubmission(data);

      case SUBMISSION_EDITOR_DECISION_PENDING_REVISIONS:
        return await requestRevisions(data);

      case SUBMISSION_EDITOR_DECISION_RESUBMIT:
        return await resubmitForReview(data);

      case SUBMISSION_EDITOR_DECISION_SEND_TO_PRODUCTION:
        return await sendToProduction(data);

      case SUBMISSION_EDITOR_DECISION_REVERT_DECLINE:
        return await revertDecline(data);

      case SUBMISSION_EDITOR_DECISION_NEW_ROUND: {
        const { submissionId, stage } = data;
        const { userId } = await assertEditorAccess(submissionId);
        await getSubmissionRow(submissionId);
        await createReviewRound(submissionId, stage);
        await logActivity({
          submissionId,
          actorId: userId,
          category: "decision",
          message: "New review round created.",
        });
        return {
          ok: true,
          message: "Review round created successfully",
        };
      }

      default:
        // Handle recommendations
        if ("recommendation" in data && data.recommendation) {
          return await sendRecommendation(data as DecisionData & { recommendation: EditorRecommendationType });
        }

        return {
          ok: false,
          error: `Unknown decision type: ${decision}`,
        };
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to save editor decision",
    };
  }
}
