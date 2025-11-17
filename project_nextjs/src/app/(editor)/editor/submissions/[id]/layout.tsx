"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { TopBar } from "@/components/admin/top-bar";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  children: ReactNode;
};

// Layout khusus untuk submission detail - full screen tanpa sidebar
export default function SubmissionDetailLayout({ children }: Props) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    let unsub: { unsubscribe: () => void } | null = null;
    const ensureEditor = async () => {
      const { data } = await supabase.auth.getSession();
      const user = data.session?.user ?? null;
      if (!user) {
        setAuthorized(false);
        router.replace("/login?source=/editor/dashboard");
        return;
      }
      const roles = (user.app_metadata as { roles?: string[] })?.roles ?? [];
      const canEdit = roles.includes("editor") || roles.includes("site_admin");
      if (!canEdit) {
        setAuthorized(false);
        router.replace("/");
        return;
      }
      setAuthorized(true);
    };

    ensureEditor();
    unsub = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user ?? null;
      if (!user) {
        setAuthorized(false);
        router.replace("/login?source=/editor/dashboard");
        return;
      }
      const roles = (user.app_metadata as { roles?: string[] })?.roles ?? [];
      const canEdit = roles.includes("editor") || roles.includes("site_admin");
      setAuthorized(canEdit);
      if (!canEdit) {
        router.replace("/");
      }
    }).data.subscription;

    return () => unsub?.unsubscribe();
  }, [router, supabase]);

  if (authorized === null) {
    return <div className="min-h-screen bg-[var(--surface-muted)]" />;
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-[var(--surface-muted)]">
      <TopBar />
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
}

export const dynamic = "force-dynamic";

