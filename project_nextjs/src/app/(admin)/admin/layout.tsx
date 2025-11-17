"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { SideNav } from "@/components/admin/side-nav";
import { TopBar } from "@/components/admin/top-bar";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type Props = {
  children: ReactNode;
};

export default function AdminLayout({ children }: Props) {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    let unsub: { unsubscribe: () => void } | null = null;
    let loginRedirectTimer: ReturnType<typeof setTimeout> | null = null;

    const ensureAdmin = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      const user = session?.user ?? null;
      if (!user) {
        setAuthorized(null);
        // Tunggu sesi siap; jika tetap tidak ada, baru redirect ke login
        loginRedirectTimer = setTimeout(() => {
          setAuthorized(false);
          router.replace(
            "/login?source=/admin/dashboard&loginMessage=Silakan masuk untuk mengakses halaman admin."
          );
        }, 800);
        return;
      }
      const roles = (user.app_metadata as { roles?: string[] })?.roles ?? [];
      let isAdmin = roles.includes("site_admin");
      if (!isAdmin) {
        const { data: sess } = await supabase.auth.getSession();
        const token = sess.session?.access_token;
        await fetch("/api/grant-admin", {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        await supabase.auth.refreshSession();
        const { data: refreshed } = await supabase.auth.getSession();
        const nextUser = refreshed.session?.user ?? null;
        const nextRoles = (nextUser?.app_metadata as { roles?: string[] })?.roles ?? [];
        isAdmin = nextRoles.includes("site_admin");
      }
      if (!isAdmin) {
        setAuthorized(false);
        router.replace("/");
        return;
      }
      setAuthorized(true);
    };

    ensureAdmin();

    unsub = supabase.auth.onAuthStateChange((_event, session) => {
      if (loginRedirectTimer) {
        clearTimeout(loginRedirectTimer);
        loginRedirectTimer = null;
      }
      const user = session?.user ?? null;
      if (!user) {
        setAuthorized(false);
        router.replace(
          "/login?source=/admin/dashboard&loginMessage=Silakan masuk untuk mengakses halaman admin."
        );
        return;
      }
      const roles = (user.app_metadata as { roles?: string[] })?.roles ?? [];
      const isAdmin = roles.includes("site_admin");
      setAuthorized(isAdmin);
      if (!isAdmin) {
        router.replace("/");
      }
    }).data.subscription;

    return () => {
      unsub?.unsubscribe();
      if (loginRedirectTimer) clearTimeout(loginRedirectTimer);
    };
  }, [router, supabase]);

  if (authorized === null) {
    return <div className="min-h-screen bg-[var(--surface-muted)]" />;
  }

  if (!authorized) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--surface-muted)]">
      <TopBar />
      <div className="flex min-h-[calc(100vh-4rem)]">
        <SideNav />
        <main className="flex-1 bg-white px-8 py-10">
          <div className="mx-auto max-w-5xl space-y-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";

