"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import { EditorSideNav } from "@/components/editor/side-nav";
import { TopBar } from "@/components/admin/top-bar";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  children: ReactNode;
};

export default function EditorLayout({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = getSupabaseBrowserClient();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  
  // Check if we're on a submission detail page - if so, don't wrap with sidebar
  const isSubmissionDetail = pathname?.match(/\/editor\/submissions\/[^/]+$/);

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

  // Skip wrapper for submission detail pages (they have their own full-screen layout)
  if (isSubmissionDetail) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[var(--surface-muted)]">
      <TopBar />
      <div className="flex min-h-[calc(100vh-4rem)]">
        <EditorSideNav />
        <main className="flex-1 bg-white px-8 py-10">
          <div className="mx-auto max-w-6xl space-y-10">{children}</div>
        </main>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";

