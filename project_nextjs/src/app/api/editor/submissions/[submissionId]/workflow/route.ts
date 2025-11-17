"use server";

import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { SubmissionStage, SubmissionStatus } from "@/features/editor/types";
import { SUBMISSION_STAGES } from "@/features/editor/types";

type RouteParams = {
  params: { submissionId: string };
};

export async function POST(request: Request, { params }: RouteParams) {
  const submissionId = params.submissionId;
  if (!submissionId) {
    return NextResponse.json({ ok: false, message: "Submission tidak ditemukan." }, { status: 400 });
  }

  const body = (await request.json().catch(() => null)) as {
    targetStage?: SubmissionStage;
    status?: SubmissionStatus;
    note?: string;
  } | null;

  if (!body || (!body.targetStage && !body.status && !body.note)) {
    return NextResponse.json({ ok: false, message: "Permintaan tidak valid." }, { status: 400 });
  }

  if (body.targetStage && !SUBMISSION_STAGES.includes(body.targetStage)) {
    return NextResponse.json({ ok: false, message: "Tahap workflow tidak valid." }, { status: 400 });
  }

  try {
    const supabase = getSupabaseAdminClient();
    const updates: Record<string, unknown> = {};

    if (body.targetStage) {
      updates.current_stage = body.targetStage;
    }

    if (body.status) {
      updates.status = body.status;
    }

    if (Object.keys(updates).length > 0) {
      const { error } = await supabase.from("submissions").update(updates).eq("id", submissionId);
      if (error) {
        throw error;
      }
    }

    const logMessage =
      body.note ||
      [
        body.targetStage ? `Memindahkan tahap ke ${body.targetStage}.` : null,
        body.status ? `Status diperbarui menjadi ${body.status}.` : null,
      ]
        .filter(Boolean)
        .join(" ");

    if (logMessage) {
      await supabase.from("submission_activity_logs").insert({
        submission_id: submissionId,
        category: "workflow",
        message: logMessage,
        metadata: {
          targetStage: body.targetStage ?? null,
          status: body.status ?? null,
        },
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, message: "Gagal memperbarui workflow." }, { status: 500 });
  }
}

