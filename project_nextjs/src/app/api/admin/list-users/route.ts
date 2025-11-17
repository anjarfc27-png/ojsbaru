import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.auth.admin.listUsers();
    if (error) {
      return NextResponse.json({ ok: false, message: "Gagal mengambil pengguna." }, { status: 500 });
    }
    const users = (data.users ?? []).map((u) => ({
      id: u.id,
      email: u.email ?? "",
      name: (u.user_metadata as { name?: string })?.name ?? u.email ?? "",
      roles: ((u.app_metadata as { roles?: string[] })?.roles ?? []).map((r) => String(r)),
    }));
    return NextResponse.json({ ok: true, users });
  } catch {
    return NextResponse.json({ ok: false, message: "Kesalahan server." }, { status: 500 });
  }
}