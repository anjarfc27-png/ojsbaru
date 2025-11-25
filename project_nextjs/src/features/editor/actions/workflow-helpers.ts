"use server";

import { randomUUID } from "node:crypto";

import { getCurrentUser } from "@/lib/permissions";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import { ensureDummyEditorData } from "../dummy-sync";
import type { SubmissionStage } from "../types";
import { STAGE_NAME_TO_ID } from "../dummy-data";

export type SubmissionRow = {
  id: string;
  journal_id: string;
  current_stage: SubmissionStage;
  status: string;
  is_archived: boolean;
  updated_at: string;
};

export async function assertEditorAccess(submissionId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("journal_id")
    .eq("id", submissionId)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Submission not found");
  }

  const hasPermission = user.roles.some(
    (role) =>
      role.role_path === "admin" ||
      role.role_path === "manager" ||
      role.role_path === "editor" ||
      (role.context_id === data.journal_id &&
        ["manager", "editor", "section_editor"].includes(role.role_path))
  );

  if (!hasPermission) {
    throw new Error("Forbidden");
  }

  return { userId: user.id, journalId: data.journal_id };
}

export async function getSubmissionRow(submissionId: string): Promise<SubmissionRow> {
  await ensureDummyEditorData();
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("id, journal_id, current_stage, status, is_archived, updated_at")
    .eq("id", submissionId)
    .single();

  if (error || !data) {
    throw new Error("Submission not found");
  }

  return data as SubmissionRow;
}

export async function logActivity(params: {
  submissionId: string;
  actorId: string;
  category: string;
  message: string;
}) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("submission_activity_logs").insert({
    id: randomUUID(),
    submission_id: params.submissionId,
    actor_id: params.actorId,
    category: params.category,
    message: params.message,
    metadata: {},
  });
  if (error) {
    throw new Error(error.message);
  }
}

export async function getNextRoundNumber(submissionId: string, stage: SubmissionStage) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("submission_review_rounds")
    .select("round")
    .eq("submission_id", submissionId)
    .eq("stage", stage)
    .order("round", { ascending: false })
    .limit(1);
  if (error) {
    throw new Error(error.message);
  }
  if (!data || data.length === 0) {
    return 1;
  }
  return (data[0].round ?? 0) + 1;
}

export async function createReviewRound(submissionId: string, stage: SubmissionStage, round?: number) {
  const supabase = getSupabaseAdminClient();
  const nextRound = round ?? (await getNextRoundNumber(submissionId, stage));
  const { error } = await supabase.from("submission_review_rounds").insert({
    id: randomUUID(),
    submission_id: submissionId,
    stage,
    round: nextRound,
    status: "active",
  });
  if (error) {
    throw new Error(error.message);
  }
}


import { randomUUID } from "node:crypto";

import { getCurrentUser } from "@/lib/permissions";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import { ensureDummyEditorData } from "../dummy-sync";
import type { SubmissionStage } from "../types";
import { STAGE_NAME_TO_ID } from "../dummy-data";

export type SubmissionRow = {
  id: string;
  journal_id: string;
  current_stage: SubmissionStage;
  status: string;
  is_archived: boolean;
  updated_at: string;
};

export async function assertEditorAccess(submissionId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("journal_id")
    .eq("id", submissionId)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Submission not found");
  }

  const hasPermission = user.roles.some(
    (role) =>
      role.role_path === "admin" ||
      role.role_path === "manager" ||
      role.role_path === "editor" ||
      (role.context_id === data.journal_id &&
        ["manager", "editor", "section_editor"].includes(role.role_path))
  );

  if (!hasPermission) {
    throw new Error("Forbidden");
  }

  return { userId: user.id, journalId: data.journal_id };
}

export async function getSubmissionRow(submissionId: string): Promise<SubmissionRow> {
  await ensureDummyEditorData();
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("id, journal_id, current_stage, status, is_archived, updated_at")
    .eq("id", submissionId)
    .single();

  if (error || !data) {
    throw new Error("Submission not found");
  }

  return data as SubmissionRow;
}

export async function logActivity(params: {
  submissionId: string;
  actorId: string;
  category: string;
  message: string;
}) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("submission_activity_logs").insert({
    id: randomUUID(),
    submission_id: params.submissionId,
    actor_id: params.actorId,
    category: params.category,
    message: params.message,
    metadata: {},
  });
  if (error) {
    throw new Error(error.message);
  }
}

export async function getNextRoundNumber(submissionId: string, stage: SubmissionStage) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("submission_review_rounds")
    .select("round")
    .eq("submission_id", submissionId)
    .eq("stage", stage)
    .order("round", { ascending: false })
    .limit(1);
  if (error) {
    throw new Error(error.message);
  }
  if (!data || data.length === 0) {
    return 1;
  }
  return (data[0].round ?? 0) + 1;
}

export async function createReviewRound(submissionId: string, stage: SubmissionStage, round?: number) {
  const supabase = getSupabaseAdminClient();
  const nextRound = round ?? (await getNextRoundNumber(submissionId, stage));
  const { error } = await supabase.from("submission_review_rounds").insert({
    id: randomUUID(),
    submission_id: submissionId,
    stage,
    round: nextRound,
    status: "active",
  });
  if (error) {
    throw new Error(error.message);
  }
}


import { randomUUID } from "node:crypto";

import { getCurrentUser } from "@/lib/permissions";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import { ensureDummyEditorData } from "../dummy-sync";
import type { SubmissionStage } from "../types";
import { STAGE_NAME_TO_ID } from "../dummy-data";

export type SubmissionRow = {
  id: string;
  journal_id: string;
  current_stage: SubmissionStage;
  status: string;
  is_archived: boolean;
  updated_at: string;
};

export async function assertEditorAccess(submissionId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("journal_id")
    .eq("id", submissionId)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Submission not found");
  }

  const hasPermission = user.roles.some(
    (role) =>
      role.role_path === "admin" ||
      role.role_path === "manager" ||
      role.role_path === "editor" ||
      (role.context_id === data.journal_id &&
        ["manager", "editor", "section_editor"].includes(role.role_path))
  );

  if (!hasPermission) {
    throw new Error("Forbidden");
  }

  return { userId: user.id, journalId: data.journal_id };
}

export async function getSubmissionRow(submissionId: string): Promise<SubmissionRow> {
  await ensureDummyEditorData();
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("id, journal_id, current_stage, status, is_archived, updated_at")
    .eq("id", submissionId)
    .single();

  if (error || !data) {
    throw new Error("Submission not found");
  }

  return data as SubmissionRow;
}

export async function logActivity(params: {
  submissionId: string;
  actorId: string;
  category: string;
  message: string;
}) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("submission_activity_logs").insert({
    id: randomUUID(),
    submission_id: params.submissionId,
    actor_id: params.actorId,
    category: params.category,
    message: params.message,
    metadata: {},
  });
  if (error) {
    throw new Error(error.message);
  }
}

export async function getNextRoundNumber(submissionId: string, stage: SubmissionStage) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("submission_review_rounds")
    .select("round")
    .eq("submission_id", submissionId)
    .eq("stage", stage)
    .order("round", { ascending: false })
    .limit(1);
  if (error) {
    throw new Error(error.message);
  }
  if (!data || data.length === 0) {
    return 1;
  }
  return (data[0].round ?? 0) + 1;
}

export async function createReviewRound(submissionId: string, stage: SubmissionStage, round?: number) {
  const supabase = getSupabaseAdminClient();
  const nextRound = round ?? (await getNextRoundNumber(submissionId, stage));
  const { error } = await supabase.from("submission_review_rounds").insert({
    id: randomUUID(),
    submission_id: submissionId,
    stage,
    round: nextRound,
    status: "active",
  });
  if (error) {
    throw new Error(error.message);
  }
}


import { randomUUID } from "node:crypto";

import { getCurrentUser } from "@/lib/permissions";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import { ensureDummyEditorData } from "../dummy-sync";
import type { SubmissionStage } from "../types";
import { STAGE_NAME_TO_ID } from "../dummy-data";

export type SubmissionRow = {
  id: string;
  journal_id: string;
  current_stage: SubmissionStage;
  status: string;
  is_archived: boolean;
  updated_at: string;
};

export async function assertEditorAccess(submissionId: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("journal_id")
    .eq("id", submissionId)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Submission not found");
  }

  const hasPermission = user.roles.some(
    (role) =>
      role.role_path === "admin" ||
      role.role_path === "manager" ||
      role.role_path === "editor" ||
      (role.context_id === data.journal_id &&
        ["manager", "editor", "section_editor"].includes(role.role_path))
  );

  if (!hasPermission) {
    throw new Error("Forbidden");
  }

  return { userId: user.id, journalId: data.journal_id };
}

export async function getSubmissionRow(submissionId: string): Promise<SubmissionRow> {
  await ensureDummyEditorData();
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("id, journal_id, current_stage, status, is_archived, updated_at")
    .eq("id", submissionId)
    .single();

  if (error || !data) {
    throw new Error("Submission not found");
  }

  return data as SubmissionRow;
}

export async function logActivity(params: {
  submissionId: string;
  actorId: string;
  category: string;
  message: string;
}) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("submission_activity_logs").insert({
    id: randomUUID(),
    submission_id: params.submissionId,
    actor_id: params.actorId,
    category: params.category,
    message: params.message,
    metadata: {},
  });
  if (error) {
    throw new Error(error.message);
  }
}

export async function getNextRoundNumber(submissionId: string, stage: SubmissionStage) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("submission_review_rounds")
    .select("round")
    .eq("submission_id", submissionId)
    .eq("stage", stage)
    .order("round", { ascending: false })
    .limit(1);
  if (error) {
    throw new Error(error.message);
  }
  if (!data || data.length === 0) {
    return 1;
  }
  return (data[0].round ?? 0) + 1;
}

export async function createReviewRound(submissionId: string, stage: SubmissionStage, round?: number) {
  const supabase = getSupabaseAdminClient();
  const nextRound = round ?? (await getNextRoundNumber(submissionId, stage));
  const { error } = await supabase.from("submission_review_rounds").insert({
    id: randomUUID(),
    submission_id: submissionId,
    stage,
    round: nextRound,
    status: "active",
  });
  if (error) {
    throw new Error(error.message);
  }
}

