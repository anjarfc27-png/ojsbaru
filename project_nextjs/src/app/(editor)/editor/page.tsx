"use client";

import { SubmissionTable } from "@/features/editor/components/submission-table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useMemo, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { HelpCircle } from "lucide-react";
import {
  getMyQueueSubmissions,
  getUnassignedSubmissions,
  getAllActiveSubmissions,
  getArchivedSubmissions,
  calculateDashboardStats,
} from "@/features/editor/dummy-helpers";

export default function EditorPage() {
  const { user } = useAuth();
  
  // Use dummy user ID for demonstration (since we're using dummy data)
  // This ensures My Queue shows dummy submissions assigned to "current-user-id"
  const currentUserId = "current-user-id";
  
  // Check if user is Manager or Admin (for tab visibility)
  const isManagerOrAdmin = useMemo(() => {
    return user?.roles?.some(r => r.role_path === "admin" || r.role_path === "manager") ?? false;
  }, [user]);
  
  // Untuk development/testing - tampilkan semua tabs
  // TODO: Set to false setelah testing selesai dan pastikan user memiliki role Manager/Admin
  const showAllTabsForTesting = true;
  
  // Filter data menggunakan helper functions yang sesuai dengan OJS 3.3 logic
  const myQueue = useMemo(
    () => getMyQueueSubmissions(currentUserId),
    [currentUserId]
  );
  
  const unassigned = useMemo(() => getUnassignedSubmissions(), []);
  
  const active = useMemo(() => getAllActiveSubmissions(), []);
  
  const archived = useMemo(
    () => getArchivedSubmissions(currentUserId, isManagerOrAdmin),
    [currentUserId, isManagerOrAdmin]
  );

  // Calculate stats real-time menggunakan helper function
  const stats = useMemo(
    () => calculateDashboardStats(currentUserId, isManagerOrAdmin),
    [currentUserId, isManagerOrAdmin]
  );

  // Update tab active styling based on Tabs context
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const container = tabsContainerRef.current;
    if (!container) return;

    const updateTabStyling = () => {
      const triggers = container.querySelectorAll('[data-value]');
      triggers.forEach((trigger) => {
        const el = trigger as HTMLElement;
        const value = el.getAttribute('data-value');
        const isActive = el.getAttribute('data-state') === 'active';
        
        if (isActive) {
          el.style.backgroundColor = '#ffffff'; // White background for active tab
          el.style.color = 'rgba(0, 0, 0, 0.84)'; // Dark grey text
          el.style.borderTop = 'none';
          el.style.borderRight = 'none';
          el.style.borderBottom = '2px solid #006798'; // Blue underline at bottom
          el.style.borderLeft = 'none';
          el.style.marginBottom = '0';
          el.classList.add('pkp_tab_active');

          // Active badge styling - dark grey border and text
          const badge = el.querySelector('span');
          if (badge) {
            badge.style.backgroundColor = '#ffffff';
            badge.style.border = '1px solid rgba(0, 0, 0, 0.2)';
            badge.style.color = 'rgba(0, 0, 0, 0.54)';
          }
        } else {
          el.style.backgroundColor = 'transparent';
          el.style.color = '#006798'; // Blue text for inactive tabs
          el.style.borderTop = 'none';
          el.style.borderRight = 'none';
          el.style.borderBottom = '2px solid transparent';
          el.style.borderLeft = 'none';
          el.classList.remove('pkp_tab_active');

          // Inactive badge styling - blue border and text
          const badge = el.querySelector('span');
          if (badge) {
            badge.style.backgroundColor = '#ffffff';
            badge.style.border = '1px solid #006798';
            badge.style.color = '#006798';
          }
        }
      });
    };

    // Initial update
    updateTabStyling();

    // Watch for changes
    const observer = new MutationObserver(updateTabStyling);
    observer.observe(container, {
      attributes: true,
      attributeFilter: ['data-state'],
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section style={{ padding: 0 }}>
      {/* Page Header - OJS 3.3 Style */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="app__pageHeading" style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          margin: 0,
          padding: 0,
          lineHeight: '2.25rem',
          color: '#002C40'
        }}>
          Submissions
        </h1>
      </div>

      {/* Tabs - OJS 3.3 Style */}
      <Tabs defaultValue="myQueue" className="w-full">
        <div 
          ref={tabsContainerRef}
          style={{
            borderBottom: '2px solid #e5e5e5',
            marginBottom: '1.5rem',
            background: '#ffffff',
            padding: 0,
            position: 'relative',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end'
          }}
        >
          <TabsList className="bg-transparent p-0 h-auto" style={{
            display: 'flex',
            listStyle: 'none',
            margin: 0,
            padding: 0,
            background: 'transparent',
            alignItems: 'flex-end',
            flex: 1,
            gap: '0.25rem'
          }}>
            {/* My Queue Tab */}
              <TabsTrigger 
                value="myQueue" 
              className="pkp_tab_trigger"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0 1rem',
                lineHeight: '3rem',
                height: '3rem',
                fontSize: '0.875rem',
                fontWeight: 700,
                textDecoration: 'none',
                color: 'rgba(0, 0, 0, 0.84)',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                whiteSpace: 'nowrap'
              }}
              >
                My Queue
                {stats?.myQueue > 0 && (
                  <span style={{
                    marginLeft: '0.5rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid rgba(0, 0, 0, 0.2)',
                  color: 'rgba(0, 0, 0, 0.54)',
                  padding: '0 0.25rem',
                  borderRadius: '50%',
                  minWidth: '20px',
                  height: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  lineHeight: '1',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                  }}>
                    {stats.myQueue}
                  </span>
                )}
              </TabsTrigger>
            
            {/* Unassigned Tab - Only visible for Manager/Admin */}
            {(isManagerOrAdmin || showAllTabsForTesting) && (
              <TabsTrigger 
                value="unassigned"
                className="pkp_tab_trigger"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0 1rem',
                  lineHeight: '3rem',
                  height: '3rem',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  color: '#006798',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  whiteSpace: 'nowrap'
                }}
              >
                Unassigned
                {stats?.unassigned > 0 && (
                  <span style={{
                    marginLeft: '0.5rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(0, 0, 0, 0.2)',
                    color: '#006798',
                    padding: '0 0.25rem',
                    borderRadius: '50%',
                    minWidth: '20px',
                    height: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    lineHeight: '1',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {stats.unassigned}
                  </span>
                )}
              </TabsTrigger>
            )}
            
            {/* All Active Tab - Only visible for Manager/Admin */}
            {(isManagerOrAdmin || showAllTabsForTesting) && (
              <TabsTrigger 
                value="active"
                className="pkp_tab_trigger"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '0 1rem',
                  lineHeight: '3rem',
                  height: '3rem',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  textDecoration: 'none',
                  color: '#006798',
                  backgroundColor: 'transparent',
                  border: 'none',
                  borderBottom: '2px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  whiteSpace: 'nowrap'
                }}
              >
                All Active
                {stats?.allActive > 0 && (
                  <span style={{
                    marginLeft: '0.5rem',
                    backgroundColor: '#ffffff',
                    border: '1px solid rgba(0, 0, 0, 0.2)',
                    color: '#006798',
                    padding: '0 0.25rem',
                    borderRadius: '50%',
                    minWidth: '20px',
                    height: '20px',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    lineHeight: '1',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {stats.allActive}
                  </span>
                )}
              </TabsTrigger>
            )}
            
            {/* Archives Tab - Always visible for Editor */}
              <TabsTrigger 
                value="archive"
              className="pkp_tab_trigger"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0 1rem',
                lineHeight: '3rem',
                height: '3rem',
                fontSize: '0.875rem',
                fontWeight: 700,
                textDecoration: 'none',
                color: '#006798',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: '2px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                whiteSpace: 'nowrap'
              }}
            >
              Archives
                {stats?.archived > 0 && (
                  <span style={{
                    marginLeft: '0.5rem',
                  backgroundColor: '#ffffff',
                  border: '1px solid rgba(0, 0, 0, 0.2)',
                  color: '#006798',
                  padding: '0 0.25rem',
                  borderRadius: '50%',
                  minWidth: '20px',
                  height: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  lineHeight: '1',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                  }}>
                    {stats.archived}
                  </span>
                )}
              </TabsTrigger>
          </TabsList>
          
          {/* Help Link - Right side of tabs */}
          <div style={{
            padding: '0 1rem',
            display: 'flex',
            alignItems: 'center',
            height: '3rem'
          }}>
            <a
              href="#"
              title="Help"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                textDecoration: 'none',
                color: 'inherit',
                fontSize: '0.875rem'
              }}
              className="hover:opacity-80"
            >
              <span style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#00B24E', /* OJS green */
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: 600,
                lineHeight: '1',
                flexShrink: 0
              }}>
                i
              </span>
              <span style={{
                color: '#006798',
                fontSize: '0.875rem',
                fontWeight: 400
              }}>
                Help
              </span>
            </a>
          </div>
        </div>

        {/* Tab Contents - Role-based visibility */}
        <TabsContent value="myQueue" style={{ position: 'relative' }}>
          <SubmissionTable 
            submissions={myQueue} 
            emptyMessage="Tidak ada submission di My Queue."
            tabLabel="My Assigned"
          />
        </TabsContent>

        {/* Unassigned and All Active only visible for Manager/Admin */}
        {(isManagerOrAdmin || showAllTabsForTesting) && (
          <>
            <TabsContent value="unassigned" style={{ position: 'relative' }}>
              <SubmissionTable 
                submissions={unassigned} 
                emptyMessage="Tidak ada submission yang belum ditugaskan."
                tabLabel="Unassigned"
              />
            </TabsContent>

            <TabsContent value="active" style={{ position: 'relative' }}>
              <SubmissionTable 
                submissions={active} 
                emptyMessage="Tidak ada submission aktif."
                tabLabel="All Active"
              />
            </TabsContent>
          </>
        )}

        <TabsContent value="archive" style={{ position: 'relative' }}>
          <SubmissionTable 
            submissions={archived} 
            emptyMessage="Tidak ada submission yang diarsipkan."
            tabLabel="Archives"
          />
        </TabsContent>
      </Tabs>
    </section>
  );
}