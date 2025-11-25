'use client'

import Link from 'next/link'
import { FileText, Plus, Eye, Calendar } from "lucide-react";
import { withAuth } from '@/lib/auth-client'
import { USE_DUMMY } from '@/lib/dummy'
import { useSupabase } from '@/providers/supabase-provider'
import { useEffect, useState } from 'react'

const mockSubmissions = [
  {
    id: '1',
    title: 'The Impact of Social Media on Academic Performance: A Meta-Analysis',
    journal: 'Journal of Educational Technology',
    journal_id: '1',
    stage: 'Review',
    status: 'Under Review',
    date_submitted: '2024-01-15',
    days_in_stage: 12,
    decision: null,
    can_delete: false
  },
  {
    id: '2',
    title: 'Machine Learning Approaches in Educational Technology',
    journal: 'Journal of Computer Science',
    journal_id: '2',
    stage: 'Copyediting',
    status: 'Revision Required',
    date_submitted: '2024-01-10',
    days_in_stage: 5,
    decision: 'Minor Revision',
    can_delete: false
  },
  {
    id: '3',
    title: 'Digital Literacy in Higher Education: Challenges and Opportunities',
    journal: 'Journal of Educational Technology',
    journal_id: '1',
    stage: 'Production',
    status: 'Accepted',
    date_submitted: '2023-12-20',
    days_in_stage: 8,
    decision: 'Accept',
    can_delete: false
  },
  {
    id: '4',
    title: 'Online Learning Effectiveness During Pandemic',
    journal: 'Journal of Computer Science',
    journal_id: '2',
    stage: 'Submission',
    status: 'Submitted',
    date_submitted: '2024-01-20',
    days_in_stage: 2,
    decision: null,
    can_delete: false
  }
];

function AuthorDashboardPage() {
  const supabase = useSupabase()
  const [submissions, setSubmissions] = useState(USE_DUMMY ? mockSubmissions : [])

  useEffect(() => {
    if (USE_DUMMY) return
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get author submissions
      const { data: submissionsData } = await supabase
        .from('submissions')
        .select('id, title, journal_id, current_stage, status, created_at, updated_at')
        .eq('author_id', user.id)
        .order('updated_at', { ascending: false })

      if (!submissionsData?.length) {
        setSubmissions([])
        return
      }

      // Get journal names
      const journalIds = Array.from(new Set(submissionsData.map(s => s.journal_id).filter(Boolean)))
      let journalMap = new Map()
      
      if (journalIds.length > 0) {
        const { data: journals } = await supabase
          .from('journals')
          .select('id, title, name')
          .in('id', journalIds)
        
        journalMap = new Map((journals ?? []).map(j => [j.id, j.title || j.name || 'Unknown Journal']))
      }

      // Format submissions data
      const formattedSubmissions = submissionsData.map(s => ({
        id: String(s.id),
        title: String(s.title ?? 'Untitled'),
        journal: String(journalMap.get(s.journal_id) || 'Unknown Journal'),
        journal_id: s.journal_id,
        stage: String(s.current_stage ?? 'Submission'),
        status: String(s.status ?? 'Submitted'),
        date_submitted: String(s.created_at ?? '').split('T')[0] ?? '',
        days_in_stage: Math.floor((Date.now() - new Date(s.updated_at ?? s.created_at).getTime()) / (1000 * 60 * 60 * 24)),
        decision: s.status === 'accepted' ? 'Accept' : null,
        can_delete: s.current_stage === 'Submission' && s.status !== 'submitted' // Can delete if still in draft
      }))
      setSubmissions(formattedSubmissions)
    }
    load()
  }, [supabase])

  const getStageColor = (stage: string) => {
    switch (stage.toLowerCase()) {
      case 'submission': return { bg: '#fee', color: '#721c24' };
      case 'review': return { bg: '#fff3cd', color: '#856404' };
      case 'copyediting': return { bg: '#d1ecf1', color: '#0c5460' };
      case 'production': return { bg: '#d4edda', color: '#155724' };
      default: return { bg: '#e2e3e5', color: '#383d41' };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'submitted': return { bg: '#e2e3e5', color: '#383d41' };
      case 'under review': return { bg: '#fff3cd', color: '#856404' };
      case 'revision required': return { bg: '#fff3cd', color: '#856404' };
      case 'accepted': return { bg: '#d4edda', color: '#155724' };
      case 'rejected': return { bg: '#f8d7da', color: '#721c24' };
      default: return { bg: '#e2e3e5', color: '#383d41' };
    }
  };

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* OJS PKP 3.3 Style Header - Author Dashboard langsung menampilkan submissions */}
      <div style={{ 
        borderBottom: '2px solid #e5e5e5',
        paddingBottom: '1rem',
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            color: '#002C40',
            margin: 0,
            marginBottom: '0.25rem'
          }}>
            My Submissions
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: '#666',
            margin: 0
          }}>
            Submit and track your manuscript submissions
          </p>
        </div>
        <Link
          href="/author/submission/new"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: '#006798',
            color: '#fff',
            fontSize: '0.875rem',
            fontWeight: 600,
            padding: '0.5rem 1rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            textDecoration: 'none'
          }}
        >
          <Plus style={{ width: '1rem', height: '1rem' }} />
          New Submission
        </Link>
      </div>

      {/* Submissions Table - OJS PKP 3.3 Style */}
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e5e5e5',
          backgroundColor: '#f8f9fa'
        }}>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: 700,
            color: '#002C40',
            margin: 0
          }}>
            Submission History
          </h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}>
            <thead>
              <tr style={{
                backgroundColor: '#f8f9fa',
                borderBottom: '1px solid #e5e5e5'
              }}>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  ID
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  Title
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  Journal
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  Stage
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  Status
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  Date Submitted
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  Days in Stage
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  Decision
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40'
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{
                    padding: '2rem',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    color: '#666',
                    fontStyle: 'italic'
                  }}>
                    No submissions found. Click "New Submission" to get started.
                  </td>
                </tr>
              ) : (
                submissions.map((submission) => {
                  const stageColors = getStageColor(submission.stage)
                  const statusColors = getStatusColor(submission.status)
                  return (
                    <tr 
                      key={submission.id}
                      style={{
                        borderBottom: '1px solid #e5e5e5',
                        backgroundColor: '#fff'
                      }}
                    >
                      <td style={{
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        color: '#333',
                        borderRight: '1px solid #e5e5e5',
                        fontWeight: 600
                      }}>
                        {submission.id}
                      </td>
                      <td style={{
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        color: '#333',
                        borderRight: '1px solid #e5e5e5',
                        maxWidth: '300px'
                      }}>
                        <Link
                          href={`/author/submissions/${submission.id}`}
                          style={{
                            fontWeight: 500,
                            color: '#006798',
                            textDecoration: 'none',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            display: 'block'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                          onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                        >
                          {submission.title}
                        </Link>
                      </td>
                      <td style={{
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        color: '#333',
                        borderRight: '1px solid #e5e5e5'
                      }}>
                        {submission.journal}
                      </td>
                      <td style={{
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        borderRight: '1px solid #e5e5e5'
                      }}>
                        <span style={{
                          backgroundColor: stageColors.bg,
                          color: stageColors.color,
                          fontSize: '0.75rem',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '4px',
                          fontWeight: 600,
                          display: 'inline-block'
                        }}>
                          {submission.stage}
                        </span>
                      </td>
                      <td style={{
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        borderRight: '1px solid #e5e5e5'
                      }}>
                        <span style={{
                          backgroundColor: statusColors.bg,
                          color: statusColors.color,
                          fontSize: '0.75rem',
                          padding: '0.125rem 0.5rem',
                          borderRadius: '4px',
                          fontWeight: 600,
                          display: 'inline-block'
                        }}>
                          {submission.status}
                        </span>
                      </td>
                      <td style={{
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        color: '#333',
                        borderRight: '1px solid #e5e5e5'
                      }}>
                        {submission.date_submitted}
                      </td>
                      <td style={{
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        color: '#333',
                        borderRight: '1px solid #e5e5e5'
                      }}>
                        {submission.days_in_stage} days
                      </td>
                      <td style={{
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem',
                        borderRight: '1px solid #e5e5e5'
                      }}>
                        {submission.decision ? (
                          <span style={{
                            backgroundColor: submission.decision === 'Accept' ? '#d4edda' : '#fff3cd',
                            color: submission.decision === 'Accept' ? '#155724' : '#856404',
                            fontSize: '0.75rem',
                            padding: '0.125rem 0.5rem',
                            borderRadius: '4px',
                            fontWeight: 600,
                            display: 'inline-block'
                          }}>
                            {submission.decision}
                          </span>
                        ) : (
                          <span style={{ color: '#666' }}>-</span>
                        )}
                      </td>
                      <td style={{
                        padding: '0.75rem 1rem',
                        fontSize: '0.875rem'
                      }}>
                        <div style={{
                          display: 'flex',
                          gap: '0.5rem'
                        }}>
                          <Link
                            href={`/author/submissions/${submission.id}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.5rem',
                              backgroundColor: 'transparent',
                              border: '1px solid #d5d5d5',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              color: '#006798',
                              textDecoration: 'none'
                            }}
                            title="View Submission"
                          >
                            <Eye style={{ width: '1rem', height: '1rem' }} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default withAuth(AuthorDashboardPage, 'author')

    </div>
  );
}

export default withAuth(AuthorDashboardPage, 'author')

    </div>
  );
}

export default withAuth(AuthorDashboardPage, 'author')

    </div>
  );
}

export default withAuth(AuthorDashboardPage, 'author')
