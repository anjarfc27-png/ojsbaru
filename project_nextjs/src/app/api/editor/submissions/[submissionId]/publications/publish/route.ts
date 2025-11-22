"use server";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/permissions";

type RouteParams = {
  params: Promise<{ submissionId: string }>;
};

/**
 * Publish Publication API
 * POST: Publish or schedule a publication
 * Based on OJS 3.3 publication scheduling
 */
export async function POST(request: NextRequest, context: RouteParams) {
  try {
    const { submissionId } = await context.params;

    if (!submissionId) {
      return NextResponse.json({ ok: false, message: "Submission tidak ditemukan." }, { status: 400 });
    }

    // Check permissions
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    const hasPermission = user.roles.some((role) =>
      ["admin", "manager", "editor", "section_editor"].includes(role.role_path)
    );

    if (!hasPermission) {
      return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json().catch(() => null)) as {
      versionId?: string;
      publishDate?: string;
      publishNow?: boolean;
    } | null;

    if (!body?.publishDate) {
      return NextResponse.json({ ok: false, message: "Publish date wajib diisi." }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    // Get current version or create new one
    const versionId = body.versionId;
    if (versionId) {
      // Update existing version
      const { error: updateError } = await supabase
        .from("submission_versions")
        .update({
          published_at: body.publishDate,
          status: body.publishNow ? "published" : "scheduled",
        })
        .eq("id", versionId)
        .eq("submission_id", submissionId);

      if (updateError) {
        console.error("Error publishing version:", updateError);
        return NextResponse.json({ ok: false, message: "Gagal mempublish versi." }, { status: 500 });
      }
    } else {
      // Create new version and publish it
      // TODO: Implement create version and publish logic
      return NextResponse.json({ ok: false, message: "Version creation not yet implemented." }, { status: 400 });
    }

    // Log activity
    await supabase.from("submission_activity_logs").insert({
      submission_id: submissionId,
      category: "publication",
      message: body.publishNow ? "Publication published." : `Publication scheduled for ${body.publishDate}.`,
      metadata: {
        versionId,
        publishDate: body.publishDate,
        publishNow: body.publishNow,
      },
    });

    return NextResponse.json({
      ok: true,
      message: body.publishNow ? "Publication published successfully." : "Publication scheduled successfully.",
    });
  } catch (error) {
    console.error("Error in POST publish:", error);
    return NextResponse.json({ ok: false, message: "Gagal mempublish." }, { status: 500 });
  }
}



