"use server";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/permissions";

type RouteParams = {
  params: Promise<{ submissionId: string; versionId: string }>;
};

const EDITOR_ROLES = ["admin", "manager", "editor", "section_editor"];

export async function PATCH(request: NextRequest, context: RouteParams) {
  try {
    const { submissionId, versionId } = await context.params;
    if (!submissionId || !versionId) {
      return NextResponse.json({ ok: false, error: "Submission atau versi tidak ditemukan." }, { status: 400 });
    }

    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user has editor role OR is the author of this submission
    const supabase = getSupabaseAdminClient();
    const hasEditorPermission = user.roles.some((role) => EDITOR_ROLES.includes(role.role_path));
    
    if (!hasEditorPermission) {
      // Check if user is the author of this submission
      const { data: submission } = await supabase
        .from("submissions")
        .select("id, author_id")
        .eq("id", submissionId)
        .single();
      
      if (!submission || submission.author_id !== user.id) {
        return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
      }
      
      // Check if version is published - authors cannot edit published versions
      const { data: versionCheck } = await supabase
        .from("submission_versions")
        .select("id, status")
        .eq("id", versionId)
        .eq("submission_id", submissionId)
        .single();
      
      if (versionCheck && versionCheck.status === "published") {
        return NextResponse.json({ 
          ok: false, 
          error: "Published versions cannot be edited. Please create a new version." 
        }, { status: 403 });
      }
    }

    const body = (await request.json().catch(() => null)) as {
      title?: string | null;
      prefix?: string | null;
      subtitle?: string | null;
      abstract?: string | null;
      keywords?: string[];
      categories?: string[];
      citations?: string[];
      authors?: Array<{
        givenName?: string;
        familyName?: string;
        affiliation?: string;
        email?: string;
        orcid?: string;
      }>;
      identifiers?: {
        doi?: string | null;
        isbn?: string | null;
        issn?: string | null;
      };
    } | null;

    if (!body) {
      return NextResponse.json({ ok: false, error: "Body tidak valid." }, { status: 400 });
    }

    const { data: existingVersion, error: fetchError } = await supabase
      .from("submission_versions")
      .select("id, submission_id, metadata")
      .eq("id", versionId)
      .eq("submission_id", submissionId)
      .single();

    if (fetchError || !existingVersion) {
      return NextResponse.json({ ok: false, error: "Versi publikasi tidak ditemukan." }, { status: 404 });
    }

    const currentMetadata = (existingVersion.metadata as Record<string, unknown>) ?? {};
    const updatedMetadata = {
      ...currentMetadata,
      ...(body.title !== undefined ? { title: body.title ?? "" } : null),
      ...(body.prefix !== undefined ? { prefix: body.prefix ?? "" } : null),
      ...(body.subtitle !== undefined ? { subtitle: body.subtitle ?? "" } : null),
      ...(body.abstract !== undefined ? { abstract: body.abstract ?? "" } : null),
      ...(body.keywords !== undefined ? { keywords: body.keywords ?? [] } : null),
      ...(body.categories !== undefined ? { categories: body.categories ?? [] } : null),
      ...(body.citations !== undefined ? { citations: body.citations ?? [] } : null),
      ...(body.authors !== undefined ? { authors: body.authors ?? [] } : null),
      ...(body.identifiers !== undefined
        ? {
            identifiers: {
              doi: body.identifiers?.doi?.trim() ?? "",
              isbn: body.identifiers?.isbn?.trim() ?? "",
              issn: body.identifiers?.issn?.trim() ?? "",
            },
          }
        : null),
    };

    await supabase
      .from("submission_versions")
      .update({ metadata: updatedMetadata })
      .eq("id", versionId);

    if (body.title) {
      await supabase.from("submissions").update({ title: body.title }).eq("id", submissionId);
    }

    await supabase.from("submission_activity_logs").insert({
      submission_id: submissionId,
      actor_id: user.id,
      category: "publication",
      message: "Memperbarui metadata publikasi.",
      metadata: {
        versionId,
        fields: Object.keys(body),
      },
    });

    return NextResponse.json({ ok: true, metadata: updatedMetadata });
  } catch (error) {
    console.error("Error updating publication metadata:", error);
    return NextResponse.json(
      { ok: false, error: "Gagal memperbarui metadata publikasi." },
      { status: 500 },
    );
  }
}


import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/permissions";

type RouteParams = {
  params: Promise<{ submissionId: string; versionId: string }>;
};

const EDITOR_ROLES = ["admin", "manager", "editor", "section_editor"];

export async function PATCH(request: NextRequest, context: RouteParams) {
  try {
    const { submissionId, versionId } = await context.params;
    if (!submissionId || !versionId) {
      return NextResponse.json({ ok: false, error: "Submission atau versi tidak ditemukan." }, { status: 400 });
    }

    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user has editor role OR is the author of this submission
    const supabase = getSupabaseAdminClient();
    const hasEditorPermission = user.roles.some((role) => EDITOR_ROLES.includes(role.role_path));
    
    if (!hasEditorPermission) {
      // Check if user is the author of this submission
      const { data: submission } = await supabase
        .from("submissions")
        .select("id, author_id")
        .eq("id", submissionId)
        .single();
      
      if (!submission || submission.author_id !== user.id) {
        return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
      }
      
      // Check if version is published - authors cannot edit published versions
      const { data: versionCheck } = await supabase
        .from("submission_versions")
        .select("id, status")
        .eq("id", versionId)
        .eq("submission_id", submissionId)
        .single();
      
      if (versionCheck && versionCheck.status === "published") {
        return NextResponse.json({ 
          ok: false, 
          error: "Published versions cannot be edited. Please create a new version." 
        }, { status: 403 });
      }
    }

    const body = (await request.json().catch(() => null)) as {
      title?: string | null;
      prefix?: string | null;
      subtitle?: string | null;
      abstract?: string | null;
      keywords?: string[];
      categories?: string[];
      citations?: string[];
      authors?: Array<{
        givenName?: string;
        familyName?: string;
        affiliation?: string;
        email?: string;
        orcid?: string;
      }>;
      identifiers?: {
        doi?: string | null;
        isbn?: string | null;
        issn?: string | null;
      };
    } | null;

    if (!body) {
      return NextResponse.json({ ok: false, error: "Body tidak valid." }, { status: 400 });
    }

    const { data: existingVersion, error: fetchError } = await supabase
      .from("submission_versions")
      .select("id, submission_id, metadata")
      .eq("id", versionId)
      .eq("submission_id", submissionId)
      .single();

    if (fetchError || !existingVersion) {
      return NextResponse.json({ ok: false, error: "Versi publikasi tidak ditemukan." }, { status: 404 });
    }

    const currentMetadata = (existingVersion.metadata as Record<string, unknown>) ?? {};
    const updatedMetadata = {
      ...currentMetadata,
      ...(body.title !== undefined ? { title: body.title ?? "" } : null),
      ...(body.prefix !== undefined ? { prefix: body.prefix ?? "" } : null),
      ...(body.subtitle !== undefined ? { subtitle: body.subtitle ?? "" } : null),
      ...(body.abstract !== undefined ? { abstract: body.abstract ?? "" } : null),
      ...(body.keywords !== undefined ? { keywords: body.keywords ?? [] } : null),
      ...(body.categories !== undefined ? { categories: body.categories ?? [] } : null),
      ...(body.citations !== undefined ? { citations: body.citations ?? [] } : null),
      ...(body.authors !== undefined ? { authors: body.authors ?? [] } : null),
      ...(body.identifiers !== undefined
        ? {
            identifiers: {
              doi: body.identifiers?.doi?.trim() ?? "",
              isbn: body.identifiers?.isbn?.trim() ?? "",
              issn: body.identifiers?.issn?.trim() ?? "",
            },
          }
        : null),
    };

    await supabase
      .from("submission_versions")
      .update({ metadata: updatedMetadata })
      .eq("id", versionId);

    if (body.title) {
      await supabase.from("submissions").update({ title: body.title }).eq("id", submissionId);
    }

    await supabase.from("submission_activity_logs").insert({
      submission_id: submissionId,
      actor_id: user.id,
      category: "publication",
      message: "Memperbarui metadata publikasi.",
      metadata: {
        versionId,
        fields: Object.keys(body),
      },
    });

    return NextResponse.json({ ok: true, metadata: updatedMetadata });
  } catch (error) {
    console.error("Error updating publication metadata:", error);
    return NextResponse.json(
      { ok: false, error: "Gagal memperbarui metadata publikasi." },
      { status: 500 },
    );
  }
}


import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/permissions";

type RouteParams = {
  params: Promise<{ submissionId: string; versionId: string }>;
};

const EDITOR_ROLES = ["admin", "manager", "editor", "section_editor"];

export async function PATCH(request: NextRequest, context: RouteParams) {
  try {
    const { submissionId, versionId } = await context.params;
    if (!submissionId || !versionId) {
      return NextResponse.json({ ok: false, error: "Submission atau versi tidak ditemukan." }, { status: 400 });
    }

    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user has editor role OR is the author of this submission
    const supabase = getSupabaseAdminClient();
    const hasEditorPermission = user.roles.some((role) => EDITOR_ROLES.includes(role.role_path));
    
    if (!hasEditorPermission) {
      // Check if user is the author of this submission
      const { data: submission } = await supabase
        .from("submissions")
        .select("id, author_id")
        .eq("id", submissionId)
        .single();
      
      if (!submission || submission.author_id !== user.id) {
        return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
      }
      
      // Check if version is published - authors cannot edit published versions
      const { data: versionCheck } = await supabase
        .from("submission_versions")
        .select("id, status")
        .eq("id", versionId)
        .eq("submission_id", submissionId)
        .single();
      
      if (versionCheck && versionCheck.status === "published") {
        return NextResponse.json({ 
          ok: false, 
          error: "Published versions cannot be edited. Please create a new version." 
        }, { status: 403 });
      }
    }

    const body = (await request.json().catch(() => null)) as {
      title?: string | null;
      prefix?: string | null;
      subtitle?: string | null;
      abstract?: string | null;
      keywords?: string[];
      categories?: string[];
      citations?: string[];
      authors?: Array<{
        givenName?: string;
        familyName?: string;
        affiliation?: string;
        email?: string;
        orcid?: string;
      }>;
      identifiers?: {
        doi?: string | null;
        isbn?: string | null;
        issn?: string | null;
      };
    } | null;

    if (!body) {
      return NextResponse.json({ ok: false, error: "Body tidak valid." }, { status: 400 });
    }

    const { data: existingVersion, error: fetchError } = await supabase
      .from("submission_versions")
      .select("id, submission_id, metadata")
      .eq("id", versionId)
      .eq("submission_id", submissionId)
      .single();

    if (fetchError || !existingVersion) {
      return NextResponse.json({ ok: false, error: "Versi publikasi tidak ditemukan." }, { status: 404 });
    }

    const currentMetadata = (existingVersion.metadata as Record<string, unknown>) ?? {};
    const updatedMetadata = {
      ...currentMetadata,
      ...(body.title !== undefined ? { title: body.title ?? "" } : null),
      ...(body.prefix !== undefined ? { prefix: body.prefix ?? "" } : null),
      ...(body.subtitle !== undefined ? { subtitle: body.subtitle ?? "" } : null),
      ...(body.abstract !== undefined ? { abstract: body.abstract ?? "" } : null),
      ...(body.keywords !== undefined ? { keywords: body.keywords ?? [] } : null),
      ...(body.categories !== undefined ? { categories: body.categories ?? [] } : null),
      ...(body.citations !== undefined ? { citations: body.citations ?? [] } : null),
      ...(body.authors !== undefined ? { authors: body.authors ?? [] } : null),
      ...(body.identifiers !== undefined
        ? {
            identifiers: {
              doi: body.identifiers?.doi?.trim() ?? "",
              isbn: body.identifiers?.isbn?.trim() ?? "",
              issn: body.identifiers?.issn?.trim() ?? "",
            },
          }
        : null),
    };

    await supabase
      .from("submission_versions")
      .update({ metadata: updatedMetadata })
      .eq("id", versionId);

    if (body.title) {
      await supabase.from("submissions").update({ title: body.title }).eq("id", submissionId);
    }

    await supabase.from("submission_activity_logs").insert({
      submission_id: submissionId,
      actor_id: user.id,
      category: "publication",
      message: "Memperbarui metadata publikasi.",
      metadata: {
        versionId,
        fields: Object.keys(body),
      },
    });

    return NextResponse.json({ ok: true, metadata: updatedMetadata });
  } catch (error) {
    console.error("Error updating publication metadata:", error);
    return NextResponse.json(
      { ok: false, error: "Gagal memperbarui metadata publikasi." },
      { status: 500 },
    );
  }
}


import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/permissions";

type RouteParams = {
  params: Promise<{ submissionId: string; versionId: string }>;
};

const EDITOR_ROLES = ["admin", "manager", "editor", "section_editor"];

export async function PATCH(request: NextRequest, context: RouteParams) {
  try {
    const { submissionId, versionId } = await context.params;
    if (!submissionId || !versionId) {
      return NextResponse.json({ ok: false, error: "Submission atau versi tidak ditemukan." }, { status: 400 });
    }

    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }
    
    // Check if user has editor role OR is the author of this submission
    const supabase = getSupabaseAdminClient();
    const hasEditorPermission = user.roles.some((role) => EDITOR_ROLES.includes(role.role_path));
    
    if (!hasEditorPermission) {
      // Check if user is the author of this submission
      const { data: submission } = await supabase
        .from("submissions")
        .select("id, author_id")
        .eq("id", submissionId)
        .single();
      
      if (!submission || submission.author_id !== user.id) {
        return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
      }
      
      // Check if version is published - authors cannot edit published versions
      const { data: versionCheck } = await supabase
        .from("submission_versions")
        .select("id, status")
        .eq("id", versionId)
        .eq("submission_id", submissionId)
        .single();
      
      if (versionCheck && versionCheck.status === "published") {
        return NextResponse.json({ 
          ok: false, 
          error: "Published versions cannot be edited. Please create a new version." 
        }, { status: 403 });
      }
    }

    const body = (await request.json().catch(() => null)) as {
      title?: string | null;
      prefix?: string | null;
      subtitle?: string | null;
      abstract?: string | null;
      keywords?: string[];
      categories?: string[];
      citations?: string[];
      authors?: Array<{
        givenName?: string;
        familyName?: string;
        affiliation?: string;
        email?: string;
        orcid?: string;
      }>;
      identifiers?: {
        doi?: string | null;
        isbn?: string | null;
        issn?: string | null;
      };
    } | null;

    if (!body) {
      return NextResponse.json({ ok: false, error: "Body tidak valid." }, { status: 400 });
    }

    const { data: existingVersion, error: fetchError } = await supabase
      .from("submission_versions")
      .select("id, submission_id, metadata")
      .eq("id", versionId)
      .eq("submission_id", submissionId)
      .single();

    if (fetchError || !existingVersion) {
      return NextResponse.json({ ok: false, error: "Versi publikasi tidak ditemukan." }, { status: 404 });
    }

    const currentMetadata = (existingVersion.metadata as Record<string, unknown>) ?? {};
    const updatedMetadata = {
      ...currentMetadata,
      ...(body.title !== undefined ? { title: body.title ?? "" } : null),
      ...(body.prefix !== undefined ? { prefix: body.prefix ?? "" } : null),
      ...(body.subtitle !== undefined ? { subtitle: body.subtitle ?? "" } : null),
      ...(body.abstract !== undefined ? { abstract: body.abstract ?? "" } : null),
      ...(body.keywords !== undefined ? { keywords: body.keywords ?? [] } : null),
      ...(body.categories !== undefined ? { categories: body.categories ?? [] } : null),
      ...(body.citations !== undefined ? { citations: body.citations ?? [] } : null),
      ...(body.authors !== undefined ? { authors: body.authors ?? [] } : null),
      ...(body.identifiers !== undefined
        ? {
            identifiers: {
              doi: body.identifiers?.doi?.trim() ?? "",
              isbn: body.identifiers?.isbn?.trim() ?? "",
              issn: body.identifiers?.issn?.trim() ?? "",
            },
          }
        : null),
    };

    await supabase
      .from("submission_versions")
      .update({ metadata: updatedMetadata })
      .eq("id", versionId);

    if (body.title) {
      await supabase.from("submissions").update({ title: body.title }).eq("id", submissionId);
    }

    await supabase.from("submission_activity_logs").insert({
      submission_id: submissionId,
      actor_id: user.id,
      category: "publication",
      message: "Memperbarui metadata publikasi.",
      metadata: {
        versionId,
        fields: Object.keys(body),
      },
    });

    return NextResponse.json({ ok: true, metadata: updatedMetadata });
  } catch (error) {
    console.error("Error updating publication metadata:", error);
    return NextResponse.json(
      { ok: false, error: "Gagal memperbarui metadata publikasi." },
      { status: 500 },
    );
  }
}

