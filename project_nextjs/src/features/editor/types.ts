export const SUBMISSION_STAGES = ["submission", "review", "copyediting", "production"] as const;
export type SubmissionStage = (typeof SUBMISSION_STAGES)[number];

export type SubmissionStatus =
  | "queued"
  | "in_review"
  | "accepted"
  | "scheduled"
  | "published"
  | "declined"
  | "archived";

export type SubmissionSummary = {
  id: string;
  title: string;
  journalId: string;
  journalTitle?: string;
  stage: SubmissionStage;
  status: SubmissionStatus;
  isArchived: boolean;
  submittedAt: string;
  updatedAt: string;
  assignees: string[];
};

export type EditorDashboardStats = {
  myQueue: number;
  inReview: number;
  copyediting: number;
  production: number;
  archived: number;
  tasks: number;
};

export type SubmissionVersion = {
  id: string;
  version: number;
  status: string;
  issue?: {
    id: string;
    title?: string | null;
    year?: number | null;
    volume?: number | null;
  };
  publishedAt?: string | null;
  createdAt: string;
};

export type SubmissionParticipant = {
  userId: string;
  role: string;
  stage: SubmissionStage;
  assignedAt: string;
};

export type SubmissionFile = {
  id: string;
  label: string;
  stage: SubmissionStage;
  kind: string;
  storagePath: string;
  versionLabel?: string | null;
  round: number;
  isVisibleToAuthors: boolean;
  size: number;
  uploadedAt: string;
  uploadedBy?: string;
};

export type SubmissionActivityLog = {
  id: string;
  message: string;
  category: string;
  createdAt: string;
  actorId?: string | null;
};

export type SubmissionReview = {
  id: string;
  reviewerId: string;
  assignmentDate: string;
  dueDate?: string | null;
  responseDueDate?: string | null;
  status: string;
  recommendation?: string | null;
  submittedAt?: string | null;
};

export type SubmissionReviewRound = {
  id: string;
  stage: SubmissionStage;
  round: number;
  status: string;
  startedAt: string;
  closedAt?: string | null;
  notes?: string | null;
  reviews: SubmissionReview[];
};

export type SubmissionDetail = {
  summary: SubmissionSummary;
  metadata: Record<string, unknown>;
  versions: SubmissionVersion[];
  participants: SubmissionParticipant[];
  files: SubmissionFile[];
  activity: SubmissionActivityLog[];
  reviewRounds: SubmissionReviewRound[];
};

