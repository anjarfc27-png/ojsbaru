"use client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

import type { ReactNode } from "react";
import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Bell, User, Home, BookOpen, LogOut, Settings, Users, BarChart3, FileText } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { useSupabase } from "@/providers/supabase-provider";
import { getRedirectPathByRole } from "@/lib/auth-redirect";
import { LanguageSwitcher } from "@/components/admin/language-switcher";
import { useI18n } from "@/contexts/I18nContext";

type Props = {
  children: ReactNode;
};

export default function ManagerLayout({ children }: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const supabase = useSupabase();
  const [journals, setJournals] = useState<{ id: string; title: string; path: string }[]>([]);
  const [journalDropdownOpen, setJournalDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const journalDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch journals for dropdown
  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const { data } = await supabase
          .from("journals")
          .select("*")
          .order("created_at", { ascending: true });
        let rows = ((data ?? []) as Record<string, any>[]).map((r) => ({
          id: r.id as string,
          title: (r.title ?? r.name ?? r.journal_title ?? "") as string,
          path: (r.path ?? r.slug ?? r.journal_path ?? "") as string,
        }));
        const missingNameIds = rows.filter((j) => !j.title || j.title.trim().length === 0).map((j) => j.id);
        if (missingNameIds.length) {
          const { data: js } = await supabase
            .from("journal_settings")
            .select("journal_id, setting_value")
            .eq("setting_name", "name")
            .in("journal_id", missingNameIds);
          const nameMap = new Map((js ?? []).map((j) => [j.journal_id, j.setting_value]));
          rows = rows.map((j) => (nameMap.has(j.id) ? { ...j, title: nameMap.get(j.id) as string } : j));
        }
        setJournals(rows.filter((j) => j.title && j.title.trim().length > 0));
      } catch (error) {
        console.error("Error fetching journals:", error);
      }
    };
    if (user) {
      fetchJournals();
    }
  }, [supabase, user]);

  useEffect(() => {
    if (loading) {
      setAuthorized(null);
      return;
    }
    if (!user) {
      setAuthorized(false);
      router.replace("/login?source=/manager");
      return;
    }

    // Debug: Log user and roles
    console.log("Manager Layout - User:", user);
    console.log("Manager Layout - User roles:", user.roles);

    const canManage = user.roles?.some((r) => {
      const rolePath = r.role_path?.toLowerCase();
      return rolePath === "manager" || rolePath === "admin";
    });

    console.log("Manager Layout - Can manage:", canManage);

    if (!canManage) {
      setAuthorized(false);
      const redirectPath = getRedirectPathByRole(user);
      console.log("Manager Layout - Redirecting to:", redirectPath);
      router.replace(redirectPath);
      return;
    }
    setAuthorized(true);
  }, [user, loading, router]);

  // Handle click outside for dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (journalDropdownRef.current && !journalDropdownRef.current.contains(event.target as Node)) {
        setJournalDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }

    if (journalDropdownOpen || userDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [journalDropdownOpen, userDropdownOpen]);

  if (authorized === null) {
    return (
      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#eaedee",
        }}
      />
    );
  }

  if (!authorized) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const navItems = [
    { href: "/manager", label: "Dashboard", icon: Home },
    { href: "/manager/submissions", label: "Submissions", icon: FileText },
    { href: "/manager/users", label: "Users & Roles", icon: Users },
    { href: "/manager/settings", label: "Settings", icon: Settings },
    { href: "/manager/statistics", label: "Statistics", icon: BarChart3 },
  ];

  const isActive = (href: string) => {
    if (href === "/manager") {
      return pathname === "/manager";
    }
    return pathname?.startsWith(href);
  };

  // Page label for header / breadcrumb – mimic OJS 3.3 manager headings
  const currentSectionLabel = (() => {
    if (!pathname) return "Dashboard";
    if (pathname === "/manager") return "Dashboard";
    if (pathname.startsWith("/manager/submissions")) return "Submissions";
    if (pathname.startsWith("/manager/users")) return "Users & Roles";
    if (pathname.startsWith("/manager/settings")) return "Settings";
    if (pathname.startsWith("/manager/statistics")) return "Statistics";
    return "Journal Manager";
  })();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        display: "flex",
      }}
    >
      {/* Sidebar - iamJOS Blue Theme (same as Site Admin) */}
      <aside
        style={{
          width: "256px",
          backgroundColor: "#002C40",
          borderRight: "1px solid #001824",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            padding: "1.5rem 1.25rem 0.75rem 1.25rem",
            flexShrink: 0,
          }}
        >
          {/* iamJOS Logo - Reused from Site Admin */}
          <div style={{ marginBottom: "1.5rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "0.5rem",
                marginBottom: "0.75rem",
              }}
            >
              <span
                style={{
                  color: "#ffffff",
                  fontSize: "2.25rem",
                  lineHeight: 1,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                iam
              </span>
              <span
                style={{
                  color: "#ffffff",
                  fontSize: "2.75rem",
                  lineHeight: 1,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                JOS
              </span>
            </div>
            <div
              style={{
                color: "#E5E7EB",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                fontSize: "0.65rem",
                lineHeight: 1.5,
                fontWeight: 500,
              }}
            >
              INTEGRATED ACADEMIC MANAGEMENT
            </div>
            <div
              style={{
                color: "#E5E7EB",
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                fontSize: "0.65rem",
                lineHeight: 1.5,
                fontWeight: 500,
              }}
            >
              JOURNAL OPERATION SYSTEM
            </div>
          </div>

          {/* Section title for Manager area */}
          <h2
            style={{
              color: "#ffffff",
              fontSize: "1.1rem",
              fontWeight: 700,
              marginBottom: "0.75rem",
            }}
          >
            Journal Manager
          </h2>
        </div>

        {/* Navigation - Scrollable area */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            minHeight: 0,
            padding: "0.5rem 1.25rem 1.5rem 1.25rem",
          }}
        >
          <nav>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "0.375rem",
                    marginBottom: "0.25rem",
                    textDecoration: "none",
                    backgroundColor: active ? "rgba(255,255,255,0.12)" : "transparent",
                    color: active ? "#ffffff" : "#E5E7EB",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    transition: "background-color 0.15s ease-in-out, color 0.15s ease-in-out",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)";
                      e.currentTarget.style.color = "#ffffff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "#E5E7EB";
                    }
                  }}
                >
                  <Icon style={{ height: "1rem", width: "1rem" }} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          backgroundColor: "#eaedee",
        }}
      >
        {/* Header - OJS PKP 3.3 Style: toolbar + page heading */}
        <header
          style={{
            backgroundColor: "#ffffff",
            borderBottom: "1px solid #dee2e6",
          }}
        >
          {/* Top toolbar: journal selector + language + user (mirip OJS backend) */}
          <div
            style={{
              padding: "0.75rem 1.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              {journals.length > 0 && (
                <div ref={journalDropdownRef} style={{ position: "relative" }}>
                  <button
                    onClick={() => setJournalDropdownOpen(!journalDropdownOpen)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      color: "#374151",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      backgroundColor: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "0.25rem 0.5rem",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#111827";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#374151";
                    }}
                  >
                    <span>{journals[0]?.title || "Select Journal"}</span>
                    <ChevronDown style={{ height: "1rem", width: "1rem" }} />
                  </button>
                  {journalDropdownOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        marginTop: "0.5rem",
                        minWidth: "200px",
                        backgroundColor: "#ffffff",
                        border: "1px solid #dee2e6",
                        borderRadius: "0.375rem",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        zIndex: 50,
                      }}
                    >
                      {journals.map((journal) => (
                        <Link
                          key={journal.id}
                          href={`/manager?journal=${journal.id}`}
                          style={{
                            display: "block",
                            padding: "0.5rem 1rem",
                            fontSize: "0.875rem",
                            fontWeight: 500,
                            color: "#000000",
                            textDecoration: "none",
                            borderBottom: "1px solid #f3f4f6",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#f3f4f6";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "transparent";
                          }}
                        >
                          {journal.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <LanguageSwitcher />
              <button
                style={{
                  position: "relative",
                  padding: "0.5rem",
                  color: "#4b5563",
                  backgroundColor: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#111827";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#4b5563";
                }}
              >
                <Bell style={{ height: "1.25rem", width: "1.25rem" }} />
              </button>
              <div ref={userDropdownRef} style={{ position: "relative" }}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: "#374151",
                    fontSize: "0.875rem",
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: "0.25rem 0.5rem",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#111827";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#374151";
                  }}
                >
                  <User style={{ height: "1.25rem", width: "1.25rem" }} />
                  <span>{user?.full_name || user?.username || user?.email}</span>
                  <ChevronDown style={{ height: "1rem", width: "1rem" }} />
                </button>
                {userDropdownOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        right: 0,
                        marginTop: "0.5rem",
                        minWidth: "200px",
                        backgroundColor: "#ffffff",
                        border: "1px solid #dee2e6",
                        borderRadius: "0.375rem",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        zIndex: 50,
                      }}
                    >
                    <div style={{ borderBottom: "1px solid #f3f4f6" }}>
                      <Link
                        href="/manager/profile"
                        style={{
                          display: "block",
                          padding: "0.5rem 1rem",
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          color: "#000000",
                          textDecoration: "none",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f3f4f6";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        Profile
                      </Link>
                    </div>
                    <div>
                      <button
                        onClick={handleLogout}
                        style={{
                          width: "100%",
                          textAlign: "left",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.5rem 1rem",
                          fontSize: "0.875rem",
                          fontWeight: 500,
                          color: "#000000",
                          backgroundColor: "transparent",
                          border: "none",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f3f4f6";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        <LogOut style={{ height: "1rem", width: "1rem" }} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Page heading + breadcrumb bar, seperti OJS 3.3 manager */}
          <div
            style={{
              borderTop: "1px solid #e5e7eb",
              backgroundColor: "#f3f4f6",
              padding: "0.75rem 1.5rem",
            }}
          >
            <div
              style={{
                fontSize: "0.75rem",
                color: "#6b7280",
                marginBottom: "0.25rem",
              }}
            >
              Journal Manager &raquo;{" "}
              <span style={{ color: "#111827" }}>{currentSectionLabel}</span>
            </div>
            <h1
              style={{
                fontSize: "1.125rem",
                fontWeight: 600,
                color: "#111827",
                margin: 0,
              }}
            >
              {currentSectionLabel}
            </h1>
          </div>
        </header>

        {/* Page Content */}
        <main style={{
          flex: 1,
          overflow: 'auto'
        }}>
          {children}
        </main>
      </div>
    </div>
  );
}
