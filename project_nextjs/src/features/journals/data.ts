import { getSupabaseAdminClient } from "@/lib/supabase/admin";

import type { HostedJournal } from "./types";

export async function fetchHostedJournals(): Promise<HostedJournal[]> {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("journals")
      .select("id, title, path, description, is_public")
      .order("created_at", { ascending: true });
    if (error || !data) {
      throw error;
    }
    return data.map((row) => ({
      id: row.id,
      name: row.title,
      path: row.path,
      description: row.description ?? undefined,
      isPublic: row.is_public ?? true,
    }));
  } catch {
    return [];
  }
}
