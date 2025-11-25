"use client";

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
    
    const canManage = user.roles?.some(r => {
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

  if (authorized === null) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#eaedee'
      }} />
    );
  }

  if (!authorized) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

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

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#eaedee',
      display: 'flex'
    }}>
      {/* Sidebar - Blue OJS Theme - Sama seperti Reviewer dan Author */}
      <aside style={{
        width: '22rem',
        backgroundColor: '#002C40',
        color: 'white',
        minHeight: 'calc(100vh)',
        boxShadow: '4px 0 6px -1px rgba(0, 0, 0, 0.1)',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '1.5rem 1.25rem' }}>
          {/* iamJOS Logo - Smaller */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
              <span style={{
                fontSize: '1.75rem',
                lineHeight: '1',
                fontWeight: 'bold',
                letterSpacing: '-0.02em',
                color: 'white'
              }}>
                iam
              </span>
              <span style={{
                fontSize: '2rem',
                lineHeight: '1',
                fontWeight: 'bold',
                letterSpacing: '-0.02em',
                color: 'white'
              }}>
                JOS
              </span>
            </div>
          </div>

          {/* Navigation - Font lebih besar */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.875rem 1rem',
                    fontSize: '1.0625rem',
                    fontWeight: active ? '600' : '500',
                    borderRadius: '0.5rem',
                    backgroundColor: active ? 'white' : 'transparent',
                    color: active ? '#002C40' : 'white',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Icon style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      color: active ? '#002C40' : 'white'
                    }} />
                    <span style={{ color: active ? '#002C40' : 'white' }}>
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0
      }}>
        {/* Header - Blue OJS Theme */}
        <header style={{
          backgroundColor: '#002C40',
          color: 'white',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            {journals.length > 0 && (
              <div ref={journalDropdownRef} style={{ position: 'relative' }}>
                  <button
                  onClick={() => setJournalDropdownOpen(!journalDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    color: 'white',
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem 0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  <span>{journals[0]?.title || "Open Journal Systems"}</span>
                  <ChevronDown style={{ height: '1.25rem', width: '1.25rem', color: 'white' }} />
                </button>
                {journalDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '0.5rem',
                    minWidth: '200px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #dee2e6',
                    borderRadius: '0.375rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    zIndex: 50
                  }}>
                    {journals.map((journal) => (
                      <Link
                        key={journal.id}
                        href={`/manager?journal=${journal.id}`}
                        style={{
                          display: 'block',
                          padding: '0.5rem 1rem',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: '#000000',
                          textDecoration: 'none',
                          borderBottom: '1px solid #f3f4f6'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
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

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <LanguageSwitcher />
            <button
              style={{
                position: 'relative',
                padding: '0.5rem',
                color: 'white',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              <Bell style={{ height: '1.25rem', width: '1.25rem', color: 'white' }} />
            </button>
            <div ref={userDropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'white',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem 0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <User style={{ height: '1.25rem', width: '1.25rem', color: 'white' }} />
                <span>{user?.name || user?.email}</span>
                <ChevronDown style={{ height: '1.25rem', width: '1.25rem', color: 'white' }} />
              </button>
              {userDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  minWidth: '200px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #dee2e6',
                  borderRadius: '0.375rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  zIndex: 50
                }}>
                  <div style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <Link
                      href="/manager/profile"
                      style={{
                        display: 'block',
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#000000',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      Profile
                    </Link>
                  </div>
                  <div>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#000000',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <LogOut style={{ height: '1rem', width: '1rem' }} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
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
export const dynamic = "force-dynamic";

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
    
    const canManage = user.roles?.some(r => {
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

  if (authorized === null) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#eaedee'
      }} />
    );
  }

  if (!authorized) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

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

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#eaedee',
      display: 'flex'
    }}>
      {/* Sidebar - Blue OJS Theme - Sama seperti Reviewer dan Author */}
      <aside style={{
        width: '22rem',
        backgroundColor: '#002C40',
        color: 'white',
        minHeight: 'calc(100vh)',
        boxShadow: '4px 0 6px -1px rgba(0, 0, 0, 0.1)',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '1.5rem 1.25rem' }}>
          {/* iamJOS Logo - Smaller */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
              <span style={{
                fontSize: '1.75rem',
                lineHeight: '1',
                fontWeight: 'bold',
                letterSpacing: '-0.02em',
                color: 'white'
              }}>
                iam
              </span>
              <span style={{
                fontSize: '2rem',
                lineHeight: '1',
                fontWeight: 'bold',
                letterSpacing: '-0.02em',
                color: 'white'
              }}>
                JOS
              </span>
            </div>
          </div>

          {/* Navigation - Font lebih besar */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.875rem 1rem',
                    fontSize: '1.0625rem',
                    fontWeight: active ? '600' : '500',
                    borderRadius: '0.5rem',
                    backgroundColor: active ? 'white' : 'transparent',
                    color: active ? '#002C40' : 'white',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Icon style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      color: active ? '#002C40' : 'white'
                    }} />
                    <span style={{ color: active ? '#002C40' : 'white' }}>
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0
      }}>
        {/* Header - Blue OJS Theme */}
        <header style={{
          backgroundColor: '#002C40',
          color: 'white',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            {journals.length > 0 && (
              <div ref={journalDropdownRef} style={{ position: 'relative' }}>
                  <button
                  onClick={() => setJournalDropdownOpen(!journalDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    color: 'white',
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem 0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  <span>{journals[0]?.title || "Open Journal Systems"}</span>
                  <ChevronDown style={{ height: '1.25rem', width: '1.25rem', color: 'white' }} />
                </button>
                {journalDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '0.5rem',
                    minWidth: '200px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #dee2e6',
                    borderRadius: '0.375rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    zIndex: 50
                  }}>
                    {journals.map((journal) => (
                      <Link
                        key={journal.id}
                        href={`/manager?journal=${journal.id}`}
                        style={{
                          display: 'block',
                          padding: '0.5rem 1rem',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: '#000000',
                          textDecoration: 'none',
                          borderBottom: '1px solid #f3f4f6'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
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

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <LanguageSwitcher />
            <button
              style={{
                position: 'relative',
                padding: '0.5rem',
                color: 'white',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              <Bell style={{ height: '1.25rem', width: '1.25rem', color: 'white' }} />
            </button>
            <div ref={userDropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'white',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem 0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <User style={{ height: '1.25rem', width: '1.25rem', color: 'white' }} />
                <span>{user?.name || user?.email}</span>
                <ChevronDown style={{ height: '1.25rem', width: '1.25rem', color: 'white' }} />
              </button>
              {userDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  minWidth: '200px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #dee2e6',
                  borderRadius: '0.375rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  zIndex: 50
                }}>
                  <div style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <Link
                      href="/manager/profile"
                      style={{
                        display: 'block',
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#000000',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      Profile
                    </Link>
                  </div>
                  <div>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#000000',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <LogOut style={{ height: '1rem', width: '1rem' }} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
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
export const dynamic = "force-dynamic";

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
    
    const canManage = user.roles?.some(r => {
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

  if (authorized === null) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#eaedee'
      }} />
    );
  }

  if (!authorized) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

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

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#eaedee',
      display: 'flex'
    }}>
      {/* Sidebar - Blue OJS Theme - Sama seperti Reviewer dan Author */}
      <aside style={{
        width: '22rem',
        backgroundColor: '#002C40',
        color: 'white',
        minHeight: 'calc(100vh)',
        boxShadow: '4px 0 6px -1px rgba(0, 0, 0, 0.1)',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '1.5rem 1.25rem' }}>
          {/* iamJOS Logo - Smaller */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
              <span style={{
                fontSize: '1.75rem',
                lineHeight: '1',
                fontWeight: 'bold',
                letterSpacing: '-0.02em',
                color: 'white'
              }}>
                iam
              </span>
              <span style={{
                fontSize: '2rem',
                lineHeight: '1',
                fontWeight: 'bold',
                letterSpacing: '-0.02em',
                color: 'white'
              }}>
                JOS
              </span>
            </div>
          </div>

          {/* Navigation - Font lebih besar */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.875rem 1rem',
                    fontSize: '1.0625rem',
                    fontWeight: active ? '600' : '500',
                    borderRadius: '0.5rem',
                    backgroundColor: active ? 'white' : 'transparent',
                    color: active ? '#002C40' : 'white',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Icon style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      color: active ? '#002C40' : 'white'
                    }} />
                    <span style={{ color: active ? '#002C40' : 'white' }}>
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0
      }}>
        {/* Header - Blue OJS Theme */}
        <header style={{
          backgroundColor: '#002C40',
          color: 'white',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            {journals.length > 0 && (
              <div ref={journalDropdownRef} style={{ position: 'relative' }}>
                  <button
                  onClick={() => setJournalDropdownOpen(!journalDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    color: 'white',
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem 0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  <span>{journals[0]?.title || "Open Journal Systems"}</span>
                  <ChevronDown style={{ height: '1.25rem', width: '1.25rem', color: 'white' }} />
                </button>
                {journalDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '0.5rem',
                    minWidth: '200px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #dee2e6',
                    borderRadius: '0.375rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    zIndex: 50
                  }}>
                    {journals.map((journal) => (
                      <Link
                        key={journal.id}
                        href={`/manager?journal=${journal.id}`}
                        style={{
                          display: 'block',
                          padding: '0.5rem 1rem',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: '#000000',
                          textDecoration: 'none',
                          borderBottom: '1px solid #f3f4f6'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
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

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <LanguageSwitcher />
            <button
              style={{
                position: 'relative',
                padding: '0.5rem',
                color: 'white',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              <Bell style={{ height: '1.25rem', width: '1.25rem', color: 'white' }} />
            </button>
            <div ref={userDropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'white',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem 0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <User style={{ height: '1.25rem', width: '1.25rem', color: 'white' }} />
                <span>{user?.name || user?.email}</span>
                <ChevronDown style={{ height: '1.25rem', width: '1.25rem', color: 'white' }} />
              </button>
              {userDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  minWidth: '200px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #dee2e6',
                  borderRadius: '0.375rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  zIndex: 50
                }}>
                  <div style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <Link
                      href="/manager/profile"
                      style={{
                        display: 'block',
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#000000',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      Profile
                    </Link>
                  </div>
                  <div>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#000000',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <LogOut style={{ height: '1rem', width: '1rem' }} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
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
export const dynamic = "force-dynamic";

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
    
    const canManage = user.roles?.some(r => {
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

  if (authorized === null) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#eaedee'
      }} />
    );
  }

  if (!authorized) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

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

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#eaedee',
      display: 'flex'
    }}>
      {/* Sidebar - Blue OJS Theme - Sama seperti Reviewer dan Author */}
      <aside style={{
        width: '22rem',
        backgroundColor: '#002C40',
        color: 'white',
        minHeight: 'calc(100vh)',
        boxShadow: '4px 0 6px -1px rgba(0, 0, 0, 0.1)',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ padding: '1.5rem 1.25rem' }}>
          {/* iamJOS Logo - Smaller */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
              <span style={{
                fontSize: '1.75rem',
                lineHeight: '1',
                fontWeight: 'bold',
                letterSpacing: '-0.02em',
                color: 'white'
              }}>
                iam
              </span>
              <span style={{
                fontSize: '2rem',
                lineHeight: '1',
                fontWeight: 'bold',
                letterSpacing: '-0.02em',
                color: 'white'
              }}>
                JOS
              </span>
            </div>
          </div>

          {/* Navigation - Font lebih besar */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.875rem 1rem',
                    fontSize: '1.0625rem',
                    fontWeight: active ? '600' : '500',
                    borderRadius: '0.5rem',
                    backgroundColor: active ? 'white' : 'transparent',
                    color: active ? '#002C40' : 'white',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Icon style={{
                      width: '1.25rem',
                      height: '1.25rem',
                      color: active ? '#002C40' : 'white'
                    }} />
                    <span style={{ color: active ? '#002C40' : 'white' }}>
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0
      }}>
        {/* Header - Blue OJS Theme */}
        <header style={{
          backgroundColor: '#002C40',
          color: 'white',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            {journals.length > 0 && (
              <div ref={journalDropdownRef} style={{ position: 'relative' }}>
                  <button
                  onClick={() => setJournalDropdownOpen(!journalDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    color: 'white',
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.25rem 0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}
                >
                  <span>{journals[0]?.title || "Open Journal Systems"}</span>
                  <ChevronDown style={{ height: '1.25rem', width: '1.25rem', color: 'white' }} />
                </button>
                {journalDropdownOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    marginTop: '0.5rem',
                    minWidth: '200px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #dee2e6',
                    borderRadius: '0.375rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    zIndex: 50
                  }}>
                    {journals.map((journal) => (
                      <Link
                        key={journal.id}
                        href={`/manager?journal=${journal.id}`}
                        style={{
                          display: 'block',
                          padding: '0.5rem 1rem',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: '#000000',
                          textDecoration: 'none',
                          borderBottom: '1px solid #f3f4f6'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
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

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <LanguageSwitcher />
            <button
              style={{
                position: 'relative',
                padding: '0.5rem',
                color: 'white',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              <Bell style={{ height: '1.25rem', width: '1.25rem', color: 'white' }} />
            </button>
            <div ref={userDropdownRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'white',
                  fontSize: '1.125rem',
                  fontWeight: 600,
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem 0.5rem'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                <User style={{ height: '1.25rem', width: '1.25rem', color: 'white' }} />
                <span>{user?.name || user?.email}</span>
                <ChevronDown style={{ height: '1.25rem', width: '1.25rem', color: 'white' }} />
              </button>
              {userDropdownOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  marginTop: '0.5rem',
                  minWidth: '200px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #dee2e6',
                  borderRadius: '0.375rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  zIndex: 50
                }}>
                  <div style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <Link
                      href="/manager/profile"
                      style={{
                        display: 'block',
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#000000',
                        textDecoration: 'none'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      Profile
                    </Link>
                  </div>
                  <div>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#000000',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f3f4f6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <LogOut style={{ height: '1rem', width: '1rem' }} />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
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
export const dynamic = "force-dynamic";
