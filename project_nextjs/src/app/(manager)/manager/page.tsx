export const dynamic = "force-dynamic";
export const revalidate = 0;

import { redirect } from "next/navigation";
import { getCurrentUserServer } from "@/lib/auth-server";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { ManagerDashboardClient } from "./dashboard-client";

async function getManagerStats(journalId?: string) {
  const supabase = getSupabaseAdminClient();

  try {
    // Build base query
    let submissionsQuery = supabase.from("submissions").select("id, status, current_stage, submitted_at");

    if (journalId) {
      submissionsQuery = submissionsQuery.eq("journal_id", journalId);
    }

    const { data: submissions } = await submissionsQuery;

    const stats = {
      totalSubmissions: submissions?.length ?? 0,
      inReview: submissions?.filter((s) => s.current_stage === "review").length ?? 0,
      inCopyediting: submissions?.filter((s) => s.current_stage === "copyediting").length ?? 0,
      inProduction: submissions?.filter((s) => s.current_stage === "production").length ?? 0,
      published: submissions?.filter((s) => s.status === "published").length ?? 0,
      declined: submissions?.filter((s) => s.status === "declined").length ?? 0,
    };

    // Get users count
    let usersQuery = supabase.from("user_roles").select("user_id", { count: "exact", head: true });

    if (journalId) {
      usersQuery = usersQuery.eq("context_id", journalId);
    }

    const { count: totalUsers } = await usersQuery;

    // Get recent submissions
    let recentQuery = supabase
      .from("submissions")
      .select("id, title, status, current_stage, submitted_at, updated_at")
      .order("updated_at", { ascending: false })
      .limit(10);

    if (journalId) {
      recentQuery = recentQuery.eq("journal_id", journalId);
    }

    const { data: recentSubmissions } = await recentQuery;

    return {
      ...stats,
      totalUsers: totalUsers ?? 0,
      recentSubmissions: recentSubmissions ?? [],
    };
  } catch (error) {
    console.error("Error loading manager stats:", error);
    return {
      totalSubmissions: 0,
      inReview: 0,
      inCopyediting: 0,
      inProduction: 0,
      published: 0,
      declined: 0,
      totalUsers: 0,
      recentSubmissions: [],
    };
  }
}

export default async function ManagerDashboardPage() {
  const user = await getCurrentUserServer();

  if (!user) {
    redirect("/login");
  }

  const hasManagerRole = user.roles?.some((r) => {
    const rolePath = r.role_path?.toLowerCase();
    return rolePath === "manager" || rolePath === "admin";
  });

  if (!hasManagerRole) {
    redirect("/dashboard");
  }

  const stats = await getManagerStats();

  return <ManagerDashboardClient stats={stats} />;
}

      recentSubmissions: recentSubmissions ?? [],
    };
  } catch (error) {
    console.error("Error loading manager stats:", error);
    return {
      totalSubmissions: 0,
      inReview: 0,
      inCopyediting: 0,
      inProduction: 0,
      published: 0,
      declined: 0,
      totalUsers: 0,
      recentSubmissions: [],
    };
  }
}

export default async function ManagerDashboardPage() {
  const user = await getCurrentUserServer();

  if (!user) {
    redirect("/login");
  }

  const hasManagerRole = user.roles?.some((r) => {
    const rolePath = r.role_path?.toLowerCase();
    return rolePath === "manager" || rolePath === "admin";
  });

  if (!hasManagerRole) {
    redirect("/dashboard");
  }

  const stats = await getManagerStats();

  return <ManagerDashboardClient stats={stats} />;
}

      recentSubmissions: recentSubmissions ?? [],
    };
  } catch (error) {
    console.error("Error loading manager stats:", error);
    return {
      totalSubmissions: 0,
      inReview: 0,
      inCopyediting: 0,
      inProduction: 0,
      published: 0,
      declined: 0,
      totalUsers: 0,
      recentSubmissions: [],
    };
  }
}

export default async function ManagerDashboardPage() {
  const user = await getCurrentUserServer();

  if (!user) {
    redirect("/login");
  }

  const hasManagerRole = user.roles?.some((r) => {
    const rolePath = r.role_path?.toLowerCase();
    return rolePath === "manager" || rolePath === "admin";
  });

  if (!hasManagerRole) {
    redirect("/dashboard");
  }

  const stats = await getManagerStats();

  return <ManagerDashboardClient stats={stats} />;
}

      recentSubmissions: recentSubmissions ?? [],
    };
  } catch (error) {
    console.error("Error loading manager stats:", error);
    return {
      totalSubmissions: 0,
      inReview: 0,
      inCopyediting: 0,
      inProduction: 0,
      published: 0,
      declined: 0,
      totalUsers: 0,
      recentSubmissions: [],
    };
  }
}

export default async function ManagerDashboardPage() {
  const user = await getCurrentUserServer();

  if (!user) {
    redirect("/login");
  }

  const hasManagerRole = user.roles?.some((r) => {
    const rolePath = r.role_path?.toLowerCase();
    return rolePath === "manager" || rolePath === "admin";
  });

  if (!hasManagerRole) {
    redirect("/dashboard");
  }

  const stats = await getManagerStats();

  return <ManagerDashboardClient stats={stats} />;
}
