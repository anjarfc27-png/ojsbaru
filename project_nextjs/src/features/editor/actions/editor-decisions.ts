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

/**
 * Send to External Review
 * Based on OJS PKP 3.3 saveExternalReview
 */
export async function sendToExternalReview(
  data: DecisionData
): Promise<ActionResult> {
  try {
    // TODO: Implement actual database save
    // For now, simulate success with dummy data
    console.log("[DUMMY] Send to External Review:", data);
    
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
    // TODO: Implement actual database save
    console.log("[DUMMY] Accept Submission:", data);
    
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
    // TODO: Implement actual database save
    console.log("[DUMMY] Decline Submission:", data);
    
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
    // TODO: Implement actual database save
    console.log("[DUMMY] Request Revisions:", data);
    
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
    // TODO: Implement actual database save (create new review round)
    console.log("[DUMMY] Resubmit for Review:", data);
    
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
    // TODO: Implement actual database save
    console.log("[DUMMY] Send to Production:", data);
    
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
    // TODO: Implement actual database save
    console.log("[DUMMY] Revert Decline:", data);
    
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
    // TODO: Implement actual database save
    console.log("[DUMMY] Send Recommendation:", data);
    
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
