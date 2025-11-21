import { createSupabaseServerClient } from "./supabase/server";
import { getSupabaseAdminClient } from "./supabase/admin";
import type { NextRequest } from "next/server";

export interface User {
  id: string;
  email: string;
  roles: Array<{
    role_name: string;
    role_path: string;
    context_id?: string | null;
  }>;
}

export async function getCurrentUserId(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

export async function getCurrentUser(request?: Request | NextRequest): Promise<User | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    return null;
  }

  const userId = session.user.id;
  const { data: roles } = await getSupabaseAdminClient()
    .from("user_account_roles")
    .select("role_name, role_path, context_id")
    .eq("user_id", userId);

  return {
    id: userId,
    email: session.user.email ?? "",
    roles: roles ?? []
  };
}

export async function requireSiteAdmin(): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) throw new Error("Unauthorized");
  const admin = await hasUserSiteRole(userId, "admin");
  if (!admin) throw new Error("Forbidden");
}

export async function hasUserSiteRole(userId: string, rolePath: string): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase
    .from("user_account_roles")
    .select("role_name, role_path, context_id")
    .eq("user_id", userId);
  return (data ?? []).some((r: any) => r.role_path === rolePath && (r.context_id == null));
}

// Mapping role string to role_id based on OJS PKP 3.3
const ROLE_TO_ROLE_ID: Record<string, number> = {
  manager: 16,
  editor: 16,
  section_editor: 17,
  guest_editor: 17,
  reviewer: 4096,
  author: 65536,
  reader: 1048576,
  copyeditor: 4097,
  proofreader: 4097,
  "layout-editor": 4097,
};

export async function hasUserJournalRole(userId: string, journalId: string, rolePaths: string[]): Promise<boolean> {
  const supabase = getSupabaseAdminClient();
  
  // Convert role paths to role_ids
  const roleIds = rolePaths.map(role => ROLE_TO_ROLE_ID[role]).filter(Boolean);
  
  if (roleIds.length === 0) {
    return false;
  }
  
  // Check if user has any of these role_ids in user_user_groups for this journal
  const { data } = await supabase
    .from("user_user_groups")
    .select(`
      user_groups!inner(
        id,
        role_id,
        context_id
      )
    `)
    .eq("user_id", userId)
    .eq("user_groups.context_id", journalId)
    .in("user_groups.role_id", roleIds);
  
  return (data ?? []).length > 0;
}

export async function requireJournalRole(requestOrJournalId: NextRequest | string, journalIdOrRoles?: string | string[], rolePaths?: string[]): Promise<void> {
  let userId: string | null;
  let journalId: string;
  let roles: string[];
  
  // Handle different function signatures
  if (typeof requestOrJournalId === 'string') {
    // Server action signature: requireJournalRole(journalId, roles)
    userId = await getCurrentUserId();
    journalId = requestOrJournalId;
    roles = Array.isArray(journalIdOrRoles)
      ? (journalIdOrRoles as string[])
      : (journalIdOrRoles ? [journalIdOrRoles as string] : []);
  } else {
    // API route signature: requireJournalRole(request, journalId, roles)
    const user = await getCurrentUser(requestOrJournalId);
    userId = user?.id ?? null;
    journalId = journalIdOrRoles as string;
    roles = rolePaths ?? [];
  }
  
  if (!userId) {
    const error: any = new Error("Unauthorized");
    error.status = 401;
    throw error;
  }
  
  const ok = await hasUserJournalRole(userId, journalId, roles);
  const isAdmin = await hasUserSiteRole(userId, "admin");
  
  if (!ok && !isAdmin) {
    const error: any = new Error("Forbidden");
    error.status = 403;
    throw error;
  }
}