"use server";

import { randomUUID } from "node:crypto";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/permissions";

type CreateGalleyData = {
  submissionId: string;
  submissionVersionId: string;
  label: string;
  locale: string;
  fileId?: string;
  remoteUrl?: string;
};

type UpdateGalleyData = {
  galleyId: string;
  submissionVersionId: string;
  label: string;
  locale: string;
  isApproved: boolean;
  fileId?: string;
  remoteUrl?: string;
};

type ActionResult = {
  ok: boolean;
  message?: string;
  error?: string;
  galleyId?: string;
};

const EDITOR_ROLES = ["admin", "manager", "editor", "section_editor"];

export async function createGalley(data: CreateGalleyData): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { ok: false, error: "Unauthorized" };
    }
    if (!user.roles.some((role) => EDITOR_ROLES.includes(role.role_path))) {
      return { ok: false, error: "Forbidden" };
    }

    if (!data.fileId && !data.remoteUrl) {
      return { ok: false, error: "File or remote URL is required" };
    }

    const supabase = getSupabaseAdminClient();
    const { data: versionRow, error: versionError } = await supabase
      .from("submission_versions")
      .select("submission_id")
      .eq("id", data.submissionVersionId)
      .single();

    if (versionError || !versionRow) {
      return { ok: false, error: "Publication version not found" };
    }

    const fileInfo = await resolveGalleySource(supabase, data.fileId, data.remoteUrl);
    if (!fileInfo) {
      return { ok: false, error: "Unable to resolve galley source" };
    }

    const insertPayload = {
      id: randomUUID(),
      submission_version_id: data.submissionVersionId,
      label: data.label,
      locale: data.locale,
      submission_file_id: fileInfo.submissionFileId,
      file_storage_path: fileInfo.fileStoragePath,
      file_size: fileInfo.fileSize,
      remote_url: fileInfo.remoteUrl,
      is_public: false,
      is_primary: false,
      sequence: 0,
    };

    const { error: insertError } = await supabase.from("galleys").insert(insertPayload);
    if (insertError) {
      throw insertError;
    }

    await supabase.from("submission_activity_logs").insert({
      id: randomUUID(),
      submission_id: versionRow.submission_id,
      actor_id: user.id,
      category: "production",
      message: `Menambahkan galley "${data.label}".`,
      metadata: {
        galleyId: insertPayload.id,
        submissionVersionId: data.submissionVersionId,
      },
    });

    return {
      ok: true,
      galleyId: insertPayload.id,
      message: "Galley created successfully",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to create galley",
    };
  }
}

export async function updateGalley(data: UpdateGalleyData): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { ok: false, error: "Unauthorized" };
    }
    if (!user.roles.some((role) => EDITOR_ROLES.includes(role.role_path))) {
      return { ok: false, error: "Forbidden" };
    }

    const supabase = getSupabaseAdminClient();
    const { data: existingGalley, error: existingError } = await supabase
      .from("galleys")
      .select(
        "id, submission_version_id, label, file_storage_path, file_size, submission_file_id, remote_url, submission_versions:submission_version_id (submission_id)",
      )
      .eq("id", data.galleyId)
      .single();

    if (existingError || !existingGalley) {
      return { ok: false, error: "Galley not found" };
    }

    const fileInfo = await resolveGalleySource(supabase, data.fileId, data.remoteUrl, existingGalley);
    if (!fileInfo) {
      return { ok: false, error: "Unable to resolve galley source" };
    }

    const updatePayload = {
      label: data.label,
      locale: data.locale,
      is_public: data.isApproved,
      submission_file_id: fileInfo.submissionFileId,
      file_storage_path: fileInfo.fileStoragePath,
      file_size: fileInfo.fileSize,
      remote_url: fileInfo.remoteUrl,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase.from("galleys").update(updatePayload).eq("id", data.galleyId);
    if (updateError) {
      throw updateError;
    }

    const submissionVersionForLog = (existingGalley.submission_versions as { submission_id: string }[] | null)?.[0];
    const submissionIdForLog = submissionVersionForLog?.submission_id ?? null;

    await supabase.from("submission_activity_logs").insert({
      id: randomUUID(),
      submission_id: submissionIdForLog as any,
      actor_id: user.id,
      category: "production",
      message: `Memperbarui galley "${data.label}".`,
      metadata: {
        galleyId: data.galleyId,
      },
    } as any);

    return {
      ok: true,
      message: "Galley updated successfully",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to update galley",
    };
  }
}

export async function deleteGalley(galleyId: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { ok: false, error: "Unauthorized" };
    }
    if (!user.roles.some((role) => EDITOR_ROLES.includes(role.role_path))) {
      return { ok: false, error: "Forbidden" };
    }

    const supabase = getSupabaseAdminClient();
    const { data: existingGalley, error: existingError } = await supabase
      .from("galleys")
      .select("id, label, submission_versions:submission_version_id (submission_id)")
      .eq("id", galleyId)
      .single();

    if (existingError || !existingGalley) {
      return { ok: false, error: "Galley not found" };
    }

    const { error: deleteError } = await supabase.from("galleys").delete().eq("id", galleyId);
    if (deleteError) {
      throw deleteError;
    }

    const submissionVersionForLog = (existingGalley.submission_versions as { submission_id: string }[] | null)?.[0];
    const submissionIdForLog = submissionVersionForLog?.submission_id ?? null;

    await supabase.from("submission_activity_logs").insert({
      id: randomUUID(),
      submission_id: submissionIdForLog as any,
      actor_id: user.id,
      category: "production",
      message: `Menghapus galley "${existingGalley.label}".`,
      metadata: {
        galleyId,
      },
    } as any);

    return {
      ok: true,
      message: "Galley deleted successfully",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to delete galley",
    };
  }
}

async function resolveGalleySource(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  fileId?: string,
  remoteUrl?: string | null,
  fallback?: {
    submission_version_id?: string;
    file_storage_path?: string | null;
    file_size?: number;
    submission_file_id?: string | null;
    remote_url?: string | null;
  },
) {
  if (fileId) {
    const { data: fileRow, error: fileError } = await supabase
      .from("submission_files")
      .select("id, storage_path, file_size")
      .eq("id", fileId)
      .maybeSingle();

    if (fileError || !fileRow) {
      throw new Error("Submission file not found");
    }

    return {
      submissionFileId: fileRow.id,
      fileStoragePath: fileRow.storage_path,
      fileSize: fileRow.file_size ?? 0,
      remoteUrl: null,
    };
  }

  if (remoteUrl) {
    return {
      submissionFileId: null,
      fileStoragePath: remoteUrl,
      fileSize: 0,
      remoteUrl,
    };
  }

  if (fallback) {
    return {
      submissionFileId: fallback.submission_file_id ?? null,
      fileStoragePath: fallback.file_storage_path ?? fallback.remote_url ?? null,
      fileSize: fallback.file_size ?? 0,
      remoteUrl: fallback.remote_url ?? null,
    };
  }

  return null;
}

    const user = await getCurrentUser();
    if (!user) {
      return { ok: false, error: "Unauthorized" };
    }
    if (!user.roles.some((role) => EDITOR_ROLES.includes(role.role_path))) {
      return { ok: false, error: "Forbidden" };
    }

    const supabase = getSupabaseAdminClient();
    const { data: existingGalley, error: existingError } = await supabase
      .from("galleys")
      .select(
        "id, submission_version_id, label, file_storage_path, file_size, submission_file_id, remote_url, submission_versions:submission_version_id (submission_id)",
      )
      .eq("id", data.galleyId)
      .single();

    if (existingError || !existingGalley) {
      return { ok: false, error: "Galley not found" };
    }

    const fileInfo = await resolveGalleySource(supabase, data.fileId, data.remoteUrl, existingGalley);
    if (!fileInfo) {
      return { ok: false, error: "Unable to resolve galley source" };
    }

    const updatePayload = {
      label: data.label,
      locale: data.locale,
      is_public: data.isApproved,
      submission_file_id: fileInfo.submissionFileId,
      file_storage_path: fileInfo.fileStoragePath,
      file_size: fileInfo.fileSize,
      remote_url: fileInfo.remoteUrl,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase.from("galleys").update(updatePayload).eq("id", data.galleyId);
    if (updateError) {
      throw updateError;
    }

    await supabase.from("submission_activity_logs").insert({
      id: randomUUID(),
      submission_id: (existingGalley.submission_versions as { submission_id: string } | null)?.submission_id,
      actor_id: user.id,
      category: "production",
      message: `Memperbarui galley "${data.label}".`,
      metadata: {
        galleyId: data.galleyId,
      },
    });

    return {
      ok: true,
      message: "Galley updated successfully",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to update galley",
    };
  }
}

export async function deleteGalley(galleyId: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { ok: false, error: "Unauthorized" };
    }
    if (!user.roles.some((role) => EDITOR_ROLES.includes(role.role_path))) {
      return { ok: false, error: "Forbidden" };
    }

    const supabase = getSupabaseAdminClient();
    const { data: existingGalley, error: existingError } = await supabase
      .from("galleys")
      .select("id, label, submission_versions:submission_version_id (submission_id)")
      .eq("id", galleyId)
      .single();

    if (existingError || !existingGalley) {
      return { ok: false, error: "Galley not found" };
    }

    const { error: deleteError } = await supabase.from("galleys").delete().eq("id", galleyId);
    if (deleteError) {
      throw deleteError;
    }

    await supabase.from("submission_activity_logs").insert({
      id: randomUUID(),
      submission_id: (existingGalley.submission_versions as { submission_id: string } | null)?.submission_id,
      actor_id: user.id,
      category: "production",
      message: `Menghapus galley "${existingGalley.label}".`,
      metadata: {
        galleyId,
      },
    });

    return {
      ok: true,
      message: "Galley deleted successfully",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to delete galley",
    };
  }
}

async function resolveGalleySource(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  fileId?: string,
  remoteUrl?: string | null,
  fallback?: {
    submission_version_id?: string;
    file_storage_path?: string | null;
    file_size?: number;
    submission_file_id?: string | null;
    remote_url?: string | null;
  },
) {
  if (fileId) {
    const { data: fileRow, error: fileError } = await supabase
      .from("submission_files")
      .select("id, storage_path, file_size")
      .eq("id", fileId)
      .maybeSingle();

    if (fileError || !fileRow) {
      throw new Error("Submission file not found");
    }

    return {
      submissionFileId: fileRow.id,
      fileStoragePath: fileRow.storage_path,
      fileSize: fileRow.file_size ?? 0,
      remoteUrl: null,
    };
  }

  if (remoteUrl) {
    return {
      submissionFileId: null,
      fileStoragePath: remoteUrl,
      fileSize: 0,
      remoteUrl,
    };
  }

  if (fallback) {
    return {
      submissionFileId: fallback.submission_file_id ?? null,
      fileStoragePath: fallback.file_storage_path ?? fallback.remote_url ?? null,
      fileSize: fallback.file_size ?? 0,
      remoteUrl: fallback.remote_url ?? null,
    };
  }

  return null;
}

    const user = await getCurrentUser();
    if (!user) {
      return { ok: false, error: "Unauthorized" };
    }
    if (!user.roles.some((role) => EDITOR_ROLES.includes(role.role_path))) {
      return { ok: false, error: "Forbidden" };
    }

    const supabase = getSupabaseAdminClient();
    const { data: existingGalley, error: existingError } = await supabase
      .from("galleys")
      .select(
        "id, submission_version_id, label, file_storage_path, file_size, submission_file_id, remote_url, submission_versions:submission_version_id (submission_id)",
      )
      .eq("id", data.galleyId)
      .single();

    if (existingError || !existingGalley) {
      return { ok: false, error: "Galley not found" };
    }

    const fileInfo = await resolveGalleySource(supabase, data.fileId, data.remoteUrl, existingGalley);
    if (!fileInfo) {
      return { ok: false, error: "Unable to resolve galley source" };
    }

    const updatePayload = {
      label: data.label,
      locale: data.locale,
      is_public: data.isApproved,
      submission_file_id: fileInfo.submissionFileId,
      file_storage_path: fileInfo.fileStoragePath,
      file_size: fileInfo.fileSize,
      remote_url: fileInfo.remoteUrl,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase.from("galleys").update(updatePayload).eq("id", data.galleyId);
    if (updateError) {
      throw updateError;
    }

    await supabase.from("submission_activity_logs").insert({
      id: randomUUID(),
      submission_id: (existingGalley.submission_versions as { submission_id: string } | null)?.submission_id,
      actor_id: user.id,
      category: "production",
      message: `Memperbarui galley "${data.label}".`,
      metadata: {
        galleyId: data.galleyId,
      },
    });

    return {
      ok: true,
      message: "Galley updated successfully",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to update galley",
    };
  }
}

export async function deleteGalley(galleyId: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { ok: false, error: "Unauthorized" };
    }
    if (!user.roles.some((role) => EDITOR_ROLES.includes(role.role_path))) {
      return { ok: false, error: "Forbidden" };
    }

    const supabase = getSupabaseAdminClient();
    const { data: existingGalley, error: existingError } = await supabase
      .from("galleys")
      .select("id, label, submission_versions:submission_version_id (submission_id)")
      .eq("id", galleyId)
      .single();

    if (existingError || !existingGalley) {
      return { ok: false, error: "Galley not found" };
    }

    const { error: deleteError } = await supabase.from("galleys").delete().eq("id", galleyId);
    if (deleteError) {
      throw deleteError;
    }

    await supabase.from("submission_activity_logs").insert({
      id: randomUUID(),
      submission_id: (existingGalley.submission_versions as { submission_id: string } | null)?.submission_id,
      actor_id: user.id,
      category: "production",
      message: `Menghapus galley "${existingGalley.label}".`,
      metadata: {
        galleyId,
      },
    });

    return {
      ok: true,
      message: "Galley deleted successfully",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to delete galley",
    };
  }
}

async function resolveGalleySource(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  fileId?: string,
  remoteUrl?: string | null,
  fallback?: {
    submission_version_id?: string;
    file_storage_path?: string | null;
    file_size?: number;
    submission_file_id?: string | null;
    remote_url?: string | null;
  },
) {
  if (fileId) {
    const { data: fileRow, error: fileError } = await supabase
      .from("submission_files")
      .select("id, storage_path, file_size")
      .eq("id", fileId)
      .maybeSingle();

    if (fileError || !fileRow) {
      throw new Error("Submission file not found");
    }

    return {
      submissionFileId: fileRow.id,
      fileStoragePath: fileRow.storage_path,
      fileSize: fileRow.file_size ?? 0,
      remoteUrl: null,
    };
  }

  if (remoteUrl) {
    return {
      submissionFileId: null,
      fileStoragePath: remoteUrl,
      fileSize: 0,
      remoteUrl,
    };
  }

  if (fallback) {
    return {
      submissionFileId: fallback.submission_file_id ?? null,
      fileStoragePath: fallback.file_storage_path ?? fallback.remote_url ?? null,
      fileSize: fallback.file_size ?? 0,
      remoteUrl: fallback.remote_url ?? null,
    };
  }

  return null;
}

    const user = await getCurrentUser();
    if (!user) {
      return { ok: false, error: "Unauthorized" };
    }
    if (!user.roles.some((role) => EDITOR_ROLES.includes(role.role_path))) {
      return { ok: false, error: "Forbidden" };
    }

    const supabase = getSupabaseAdminClient();
    const { data: existingGalley, error: existingError } = await supabase
      .from("galleys")
      .select(
        "id, submission_version_id, label, file_storage_path, file_size, submission_file_id, remote_url, submission_versions:submission_version_id (submission_id)",
      )
      .eq("id", data.galleyId)
      .single();

    if (existingError || !existingGalley) {
      return { ok: false, error: "Galley not found" };
    }

    const fileInfo = await resolveGalleySource(supabase, data.fileId, data.remoteUrl, existingGalley);
    if (!fileInfo) {
      return { ok: false, error: "Unable to resolve galley source" };
    }

    const updatePayload = {
      label: data.label,
      locale: data.locale,
      is_public: data.isApproved,
      submission_file_id: fileInfo.submissionFileId,
      file_storage_path: fileInfo.fileStoragePath,
      file_size: fileInfo.fileSize,
      remote_url: fileInfo.remoteUrl,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase.from("galleys").update(updatePayload).eq("id", data.galleyId);
    if (updateError) {
      throw updateError;
    }

    await supabase.from("submission_activity_logs").insert({
      id: randomUUID(),
      submission_id: (existingGalley.submission_versions as { submission_id: string } | null)?.submission_id,
      actor_id: user.id,
      category: "production",
      message: `Memperbarui galley "${data.label}".`,
      metadata: {
        galleyId: data.galleyId,
      },
    });

    return {
      ok: true,
      message: "Galley updated successfully",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to update galley",
    };
  }
}

export async function deleteGalley(galleyId: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { ok: false, error: "Unauthorized" };
    }
    if (!user.roles.some((role) => EDITOR_ROLES.includes(role.role_path))) {
      return { ok: false, error: "Forbidden" };
    }

    const supabase = getSupabaseAdminClient();
    const { data: existingGalley, error: existingError } = await supabase
      .from("galleys")
      .select("id, label, submission_versions:submission_version_id (submission_id)")
      .eq("id", galleyId)
      .single();

    if (existingError || !existingGalley) {
      return { ok: false, error: "Galley not found" };
    }

    const { error: deleteError } = await supabase.from("galleys").delete().eq("id", galleyId);
    if (deleteError) {
      throw deleteError;
    }

    await supabase.from("submission_activity_logs").insert({
      id: randomUUID(),
      submission_id: (existingGalley.submission_versions as { submission_id: string } | null)?.submission_id,
      actor_id: user.id,
      category: "production",
      message: `Menghapus galley "${existingGalley.label}".`,
      metadata: {
        galleyId,
      },
    });

    return {
      ok: true,
      message: "Galley deleted successfully",
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Failed to delete galley",
    };
  }
}

async function resolveGalleySource(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  fileId?: string,
  remoteUrl?: string | null,
  fallback?: {
    submission_version_id?: string;
    file_storage_path?: string | null;
    file_size?: number;
    submission_file_id?: string | null;
    remote_url?: string | null;
  },
) {
  if (fileId) {
    const { data: fileRow, error: fileError } = await supabase
      .from("submission_files")
      .select("id, storage_path, file_size")
      .eq("id", fileId)
      .maybeSingle();

    if (fileError || !fileRow) {
      throw new Error("Submission file not found");
    }

    return {
      submissionFileId: fileRow.id,
      fileStoragePath: fileRow.storage_path,
      fileSize: fileRow.file_size ?? 0,
      remoteUrl: null,
    };
  }

  if (remoteUrl) {
    return {
      submissionFileId: null,
      fileStoragePath: remoteUrl,
      fileSize: 0,
      remoteUrl,
    };
  }

  if (fallback) {
    return {
      submissionFileId: fallback.submission_file_id ?? null,
      fileStoragePath: fallback.file_storage_path ?? fallback.remote_url ?? null,
      fileSize: fallback.file_size ?? 0,
      remoteUrl: fallback.remote_url ?? null,
    };
  }

  return null;
}
