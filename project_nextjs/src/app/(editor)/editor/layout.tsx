"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Bell, User, Home, BookOpen, LogOut } from "lucide-react";

import { EditorSideNav } from "@/components/editor/side-nav";
import { useAuth } from "@/contexts/AuthContext";
import { Dropdown, DropdownItem, DropdownSection } from "@/components/ui/dropdown";
import { useSupabase } from "@/providers/supabase-provider";
import { getRedirectPathByRole } from "@/lib/auth-redirect";

type Props = {
  children: ReactNode;
};

export default function EditorLayout({ children }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const supabase = useSupabase();
  const [journals, setJournals] = useState<{ id: string; title: string; path: string }[]>([]);
  
  // Check if we're on a submission detail page - if so, don't wrap with sidebar
  const isSubmissionDetail = pathname?.match(/\/editor\/submissions\/[^/]+$/);

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
      router.replace("/login?source=/editor");
      return;
    }
    const canEdit = user.roles?.some(r => r.role_path === "editor" || r.role_path === "section_editor" || r.role_path === "admin");
    if (!canEdit) {
      setAuthorized(false);
      // Redirect to role-appropriate route
      const redirectPath = getRedirectPathByRole(user);
      router.replace(redirectPath);
      return;
    }
    setAuthorized(true);
  }, [user, loading, router]);

  if (authorized === null) {
    return <div className="min-h-screen bg-[#eaedee]" />;
  }

  if (!authorized) {
    return null;
  }

  // Skip wrapper for submission detail pages (they have their own full-screen layout)
  if (isSubmissionDetail) {
    return <>{children}</>;
  }

  return (
    <div className="pkp_structure_page" style={{
      minHeight: '100vh', 
      backgroundColor: '#eaedee',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Top Header Bar - Dark Blue */}
      <header 
        className="bg-[#002C40] text-white" 
        style={{
          backgroundColor: '#002C40',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div 
          className="flex items-center justify-between" 
          style={{
            padding: '0.875rem 1.5rem',
            maxWidth: '100%',
          }}
        >
          {/* Left: Open Journal Systems */}
          <div className="flex items-center gap-6">
            <Dropdown
              button={
                <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                  <span className="text-white text-base font-medium" style={{fontSize: '0.9375rem', fontWeight: '500'}}>
                    Open Journal Systems
                  </span>
                  <ChevronDown className="h-4 w-4 text-white" style={{width: '16px', height: '16px'}} />
                </div>
              }
              align="left"
            >
              <DropdownSection>
                <DropdownItem href="/admin" icon={<Home className="h-4 w-4" />}>
                  Site Administration
                </DropdownItem>
              </DropdownSection>
              {journals.length > 0 && (
                <DropdownSection>
                  {journals.map((journal) => (
                    <DropdownItem 
                      key={journal.id} 
                      href={journal.path ? `/journal/${journal.path}/dashboard` : `/journal/${journal.id}`} 
                      icon={<BookOpen className="h-4 w-4" />}
                    >
                      {journal.title}
                    </DropdownItem>
                  ))}
                </DropdownSection>
              )}
            </Dropdown>
          </div>

          {/* Right: Bell and User */}
          <div className="flex items-center gap-6">
            {/* Bell Icon with Dropdown */}
            <Dropdown
              button={
                <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity relative">
                  <Bell className="h-5 w-5 text-white" style={{width: '20px', height: '20px'}} />
                </div>
              }
              align="right"
            >
              <DropdownSection>
                <DropdownItem href="#" icon={<Bell className="h-4 w-4" />}>
                  No new notifications
                </DropdownItem>
              </DropdownSection>
            </Dropdown>

            {/* User with Dropdown */}
            <Dropdown
              button={
                <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                  <User className="h-5 w-5 text-white" style={{width: '20px', height: '20px'}} />
                </div>
              }
              align="right"
            >
              <DropdownSection>
                <DropdownItem 
                  onClick={async () => {
                    await logout();
                    router.push('/login');
                  }}
                  icon={<User className="h-4 w-4" />}
                >
                  {user?.full_name || user?.username || 'User'}
                </DropdownItem>
                <DropdownItem 
                  onClick={async () => {
                    await logout();
                    router.push('/login');
                  }}
                  icon={<LogOut className="h-4 w-4" />}
                >
                  Logout
                </DropdownItem>
              </DropdownSection>
            </Dropdown>
          </div>
        </div>
      </header>
      
      {/* Main Content Area - Flex Layout */}
      <div 
        className="pkp_structure_content_wrapper" 
        style={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
        }}
      >
        {/* Fixed Left Sidebar */}
        <aside 
          className="pkp_structure_sidebar left hide-scrollbar" 
          style={{
            width: '280px',
            backgroundColor: '#002C40',
            color: 'white',
            position: 'fixed',
            left: 0,
            top: '57px',
            bottom: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            zIndex: 90,
            scrollbarWidth: 'none', /* Firefox */
            msOverflowStyle: 'none', /* IE and Edge */
          }}
        >
          {/* Sidebar Header with Logo */}
          <div style={{
            padding: '1.5rem 1.25rem',
          }}>
            {/* iamJOS Logo - Matching Admin Style */}
            <div style={{ marginBottom: '1rem' }}>
              <div className="flex items-baseline gap-2" style={{ marginBottom: '0.5rem' }}>
                <span className="text-white font-bold" style={{
                  fontSize: '2.5rem',
                  lineHeight: '1',
                  fontWeight: 'bold',
                  letterSpacing: '-0.02em'
                }}>
                  iam
                </span>
                <span className="text-white font-bold" style={{
                  fontSize: '3rem',
                  lineHeight: '1',
                  fontWeight: 'bold',
                  letterSpacing: '-0.02em'
                }}>
                  JOS
                </span>
              </div>
              <div className="text-white uppercase tracking-wider opacity-85" style={{
                fontSize: '0.65rem',
                letterSpacing: '0.2em',
                lineHeight: '1.5',
                fontWeight: '500',
                marginTop: '0.5rem'
              }}>
                INTEGRATED ACADEMIC MANAGEMENT
              </div>
              <div className="text-white uppercase tracking-wider opacity-85" style={{
                fontSize: '0.65rem',
                letterSpacing: '0.2em',
                lineHeight: '1.5',
                fontWeight: '500'
              }}>
                OPEN JOURNAL SYSTEMS
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <EditorSideNav />
        </aside>
        
        {/* Main Content Area */}
        <main 
          className="pkp_structure_main" 
          style={{
            flex: 1,
            marginLeft: '280px',
            backgroundColor: '#ffffff',
            padding: '2rem 2.5rem',
            color: '#333333',
            fontSize: '1rem',
            lineHeight: '1.6',
            minHeight: 'calc(100vh - 57px)',
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
}

export const dynamic = "force-dynamic";
