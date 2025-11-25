"use client";

import { BarChart3, Users, FileText, CheckCircle, XCircle, Clock } from "lucide-react";

type Statistics = {
  totalSubmissions: number;
  byStatus: {
    published: number;
    declined: number;
    accepted: number;
    inReview: number;
  };
  byStage: {
    submission: number;
    review: number;
    copyediting: number;
    production: number;
  };
  averageReviewTime: number;
  averagePublicationTime: number;
  totalUsers: number;
  roleDistribution: Record<string, number>;
};

type Props = {
  statistics: Statistics;
};

export function StatisticsClient({ statistics }: Props) {
  const formatDays = (days: number) => {
    if (days === 0) return "N/A";
    return `${Math.round(days)} days`;
  };

  return (
    <div style={{
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Page Header - OJS PKP 3.3 Style */}
      <div>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: '#002C40',
          margin: 0,
          marginBottom: '0.25rem'
        }}>
          Statistics & Reports
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: '#666',
          margin: 0
        }}>
          View detailed statistics about your journal
        </p>
      </div>

      {/* Overview Cards - OJS PKP 3.3 Style */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid #f3f4f6'
          }}>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#4b5563'
            }}>
              Total Submissions
            </span>
            <FileText style={{ height: '1rem', width: '1rem', color: '#9ca3af' }} />
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#111827',
            marginBottom: '0.25rem'
          }}>
            {statistics.totalSubmissions}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            margin: 0
          }}>
            All time
          </p>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid #f3f4f6'
          }}>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#4b5563'
            }}>
              Published
            </span>
            <CheckCircle style={{ height: '1rem', width: '1rem', color: '#9ca3af' }} />
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#16a34a',
            marginBottom: '0.25rem'
          }}>
            {statistics.byStatus.published}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            margin: 0
          }}>
            {statistics.totalSubmissions > 0
              ? Math.round((statistics.byStatus.published / statistics.totalSubmissions) * 100)
              : 0}
            % of total
          </p>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid #f3f4f6'
          }}>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#4b5563'
            }}>
              Declined
            </span>
            <XCircle style={{ height: '1rem', width: '1rem', color: '#9ca3af' }} />
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#dc2626',
            marginBottom: '0.25rem'
          }}>
            {statistics.byStatus.declined}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            margin: 0
          }}>
            {statistics.totalSubmissions > 0
              ? Math.round((statistics.byStatus.declined / statistics.totalSubmissions) * 100)
              : 0}
            % of total
          </p>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid #f3f4f6'
          }}>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#4b5563'
            }}>
              Total Users
            </span>
            <Users style={{ height: '1rem', width: '1rem', color: '#9ca3af' }} />
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#2563eb',
            marginBottom: '0.25rem'
          }}>
            {statistics.totalUsers}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            margin: 0
          }}>
            Registered users
          </p>
        </div>
      </div>

      {/* Submissions by Stage - OJS PKP 3.3 Style */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '1.5rem'
      }}>
        <div style={{
          marginBottom: '1rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #f3f4f6'
        }}>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: '#111827',
            margin: 0
          }}>
            Submissions by Stage
          </h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            padding: '1rem',
            border: '1px solid #dee2e6',
            borderRadius: '0.5rem'
          }}>
            <div style={{
              fontSize: '0.875rem',
              color: '#4b5563',
              marginBottom: '0.25rem'
            }}>
              Submission
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#111827'
            }}>
              {statistics.byStage.submission}
            </div>
          </div>
          <div style={{
            padding: '1rem',
            border: '1px solid #dee2e6',
            borderRadius: '0.5rem'
          }}>
            <div style={{
              fontSize: '0.875rem',
              color: '#4b5563',
              marginBottom: '0.25rem'
            }}>
              Review
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#ea580c'
            }}>
              {statistics.byStage.review}
            </div>
          </div>
          <div style={{
            padding: '1rem',
            border: '1px solid #dee2e6',
            borderRadius: '0.5rem'
          }}>
            <div style={{
              fontSize: '0.875rem',
              color: '#4b5563',
              marginBottom: '0.25rem'
            }}>
              Copyediting
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#9333ea'
            }}>
              {statistics.byStage.copyediting}
            </div>
          </div>
          <div style={{
            padding: '1rem',
            border: '1px solid #dee2e6',
            borderRadius: '0.5rem'
          }}>
            <div style={{
              fontSize: '0.875rem',
              color: '#4b5563',
              marginBottom: '0.25rem'
            }}>
              Production
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#4f46e5'
            }}>
              {statistics.byStage.production}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics - OJS PKP 3.3 Style */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '1.5rem'
      }}>
        <div style={{
          marginBottom: '1rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #f3f4f6'
        }}>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: '#111827',
            margin: 0
          }}>
            Performance Metrics
          </h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            padding: '1rem',
            border: '1px solid #dee2e6',
            borderRadius: '0.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <Clock style={{ height: '1.25rem', width: '1.25rem', color: '#9ca3af' }} />
              <div style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#374151'
              }}>
                Average Review Time
              </div>
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#111827',
              marginBottom: '0.25rem'
            }}>
              {formatDays(statistics.averageReviewTime)}
            </div>
            <p style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              margin: 0
            }}>
              Time from assignment to completion
            </p>
          </div>
          <div style={{
            padding: '1rem',
            border: '1px solid #dee2e6',
            borderRadius: '0.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <BarChart3 style={{ height: '1.25rem', width: '1.25rem', color: '#9ca3af' }} />
              <div style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#374151'
              }}>
                Average Publication Time
              </div>
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#111827',
              marginBottom: '0.25rem'
            }}>
              {formatDays(statistics.averagePublicationTime)}
            </div>
            <p style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              margin: 0
            }}>
              Time from submission to publication
            </p>
          </div>
        </div>
      </div>

      {/* Role Distribution - OJS PKP 3.3 Style */}
      {Object.keys(statistics.roleDistribution).length > 0 && (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.5rem'
        }}>
          <div style={{
            marginBottom: '1rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #f3f4f6'
          }}>
            <h2 style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: '#111827',
              margin: 0
            }}>
              User Role Distribution
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Object.entries(statistics.roleDistribution).map(([role, count]) => (
              <div key={role} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#374151'
                }}>
                  {role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <div style={{
                    width: '128px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '9999px',
                    height: '0.5rem'
                  }}>
                    <div
                      style={{
                        backgroundColor: '#006798',
                        height: '0.5rem',
                        borderRadius: '9999px',
                        width: `${
                          statistics.totalUsers > 0
                            ? Math.round((count / statistics.totalUsers) * 100)
                            : 0
                        }%`,
                        transition: 'width 0.3s'
                      }}
                    />
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#111827',
                    width: '3rem',
                    textAlign: 'right'
                  }}>
                    {count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}




import { BarChart3, Users, FileText, CheckCircle, XCircle, Clock } from "lucide-react";

type Statistics = {
  totalSubmissions: number;
  byStatus: {
    published: number;
    declined: number;
    accepted: number;
    inReview: number;
  };
  byStage: {
    submission: number;
    review: number;
    copyediting: number;
    production: number;
  };
  averageReviewTime: number;
  averagePublicationTime: number;
  totalUsers: number;
  roleDistribution: Record<string, number>;
};

type Props = {
  statistics: Statistics;
};

export function StatisticsClient({ statistics }: Props) {
  const formatDays = (days: number) => {
    if (days === 0) return "N/A";
    return `${Math.round(days)} days`;
  };

  return (
    <div style={{
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Page Header - OJS PKP 3.3 Style */}
      <div>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: '#002C40',
          margin: 0,
          marginBottom: '0.25rem'
        }}>
          Statistics & Reports
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: '#666',
          margin: 0
        }}>
          View detailed statistics about your journal
        </p>
      </div>

      {/* Overview Cards - OJS PKP 3.3 Style */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid #f3f4f6'
          }}>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#4b5563'
            }}>
              Total Submissions
            </span>
            <FileText style={{ height: '1rem', width: '1rem', color: '#9ca3af' }} />
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#111827',
            marginBottom: '0.25rem'
          }}>
            {statistics.totalSubmissions}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            margin: 0
          }}>
            All time
          </p>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid #f3f4f6'
          }}>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#4b5563'
            }}>
              Published
            </span>
            <CheckCircle style={{ height: '1rem', width: '1rem', color: '#9ca3af' }} />
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#16a34a',
            marginBottom: '0.25rem'
          }}>
            {statistics.byStatus.published}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            margin: 0
          }}>
            {statistics.totalSubmissions > 0
              ? Math.round((statistics.byStatus.published / statistics.totalSubmissions) * 100)
              : 0}
            % of total
          </p>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid #f3f4f6'
          }}>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#4b5563'
            }}>
              Declined
            </span>
            <XCircle style={{ height: '1rem', width: '1rem', color: '#9ca3af' }} />
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#dc2626',
            marginBottom: '0.25rem'
          }}>
            {statistics.byStatus.declined}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            margin: 0
          }}>
            {statistics.totalSubmissions > 0
              ? Math.round((statistics.byStatus.declined / statistics.totalSubmissions) * 100)
              : 0}
            % of total
          </p>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid #f3f4f6'
          }}>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#4b5563'
            }}>
              Total Users
            </span>
            <Users style={{ height: '1rem', width: '1rem', color: '#9ca3af' }} />
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#2563eb',
            marginBottom: '0.25rem'
          }}>
            {statistics.totalUsers}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            margin: 0
          }}>
            Registered users
          </p>
        </div>
      </div>

      {/* Submissions by Stage - OJS PKP 3.3 Style */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '1.5rem'
      }}>
        <div style={{
          marginBottom: '1rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #f3f4f6'
        }}>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: '#111827',
            margin: 0
          }}>
            Submissions by Stage
          </h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            padding: '1rem',
            border: '1px solid #dee2e6',
            borderRadius: '0.5rem'
          }}>
            <div style={{
              fontSize: '0.875rem',
              color: '#4b5563',
              marginBottom: '0.25rem'
            }}>
              Submission
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#111827'
            }}>
              {statistics.byStage.submission}
            </div>
          </div>
          <div style={{
            padding: '1rem',
            border: '1px solid #dee2e6',
            borderRadius: '0.5rem'
          }}>
            <div style={{
              fontSize: '0.875rem',
              color: '#4b5563',
              marginBottom: '0.25rem'
            }}>
              Review
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#ea580c'
            }}>
              {statistics.byStage.review}
            </div>
          </div>
          <div style={{
            padding: '1rem',
            border: '1px solid #dee2e6',
            borderRadius: '0.5rem'
          }}>
            <div style={{
              fontSize: '0.875rem',
              color: '#4b5563',
              marginBottom: '0.25rem'
            }}>
              Copyediting
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#9333ea'
            }}>
              {statistics.byStage.copyediting}
            </div>
          </div>
          <div style={{
            padding: '1rem',
            border: '1px solid #dee2e6',
            borderRadius: '0.5rem'
          }}>
            <div style={{
              fontSize: '0.875rem',
              color: '#4b5563',
              marginBottom: '0.25rem'
            }}>
              Production
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#4f46e5'
            }}>
              {statistics.byStage.production}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics - OJS PKP 3.3 Style */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '1.5rem'
      }}>
        <div style={{
          marginBottom: '1rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #f3f4f6'
        }}>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: '#111827',
            margin: 0
          }}>
            Performance Metrics
          </h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            padding: '1rem',
            border: '1px solid #dee2e6',
            borderRadius: '0.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <Clock style={{ height: '1.25rem', width: '1.25rem', color: '#9ca3af' }} />
              <div style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#374151'
              }}>
                Average Review Time
              </div>
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#111827',
              marginBottom: '0.25rem'
            }}>
              {formatDays(statistics.averageReviewTime)}
            </div>
            <p style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              margin: 0
            }}>
              Time from assignment to completion
            </p>
          </div>
          <div style={{
            padding: '1rem',
            border: '1px solid #dee2e6',
            borderRadius: '0.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <BarChart3 style={{ height: '1.25rem', width: '1.25rem', color: '#9ca3af' }} />
              <div style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#374151'
              }}>
                Average Publication Time
              </div>
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#111827',
              marginBottom: '0.25rem'
            }}>
              {formatDays(statistics.averagePublicationTime)}
            </div>
            <p style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              margin: 0
            }}>
              Time from submission to publication
            </p>
          </div>
        </div>
      </div>

      {/* Role Distribution - OJS PKP 3.3 Style */}
      {Object.keys(statistics.roleDistribution).length > 0 && (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.5rem'
        }}>
          <div style={{
            marginBottom: '1rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #f3f4f6'
          }}>
            <h2 style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: '#111827',
              margin: 0
            }}>
              User Role Distribution
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Object.entries(statistics.roleDistribution).map(([role, count]) => (
              <div key={role} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#374151'
                }}>
                  {role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <div style={{
                    width: '128px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '9999px',
                    height: '0.5rem'
                  }}>
                    <div
                      style={{
                        backgroundColor: '#006798',
                        height: '0.5rem',
                        borderRadius: '9999px',
                        width: `${
                          statistics.totalUsers > 0
                            ? Math.round((count / statistics.totalUsers) * 100)
                            : 0
                        }%`,
                        transition: 'width 0.3s'
                      }}
                    />
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#111827',
                    width: '3rem',
                    textAlign: 'right'
                  }}>
                    {count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}




import { BarChart3, Users, FileText, CheckCircle, XCircle, Clock } from "lucide-react";

type Statistics = {
  totalSubmissions: number;
  byStatus: {
    published: number;
    declined: number;
    accepted: number;
    inReview: number;
  };
  byStage: {
    submission: number;
    review: number;
    copyediting: number;
    production: number;
  };
  averageReviewTime: number;
  averagePublicationTime: number;
  totalUsers: number;
  roleDistribution: Record<string, number>;
};

type Props = {
  statistics: Statistics;
};

export function StatisticsClient({ statistics }: Props) {
  const formatDays = (days: number) => {
    if (days === 0) return "N/A";
    return `${Math.round(days)} days`;
  };

  return (
    <div style={{
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Page Header - OJS PKP 3.3 Style */}
      <div>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: '#002C40',
          margin: 0,
          marginBottom: '0.25rem'
        }}>
          Statistics & Reports
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: '#666',
          margin: 0
        }}>
          View detailed statistics about your journal
        </p>
      </div>

      {/* Overview Cards - OJS PKP 3.3 Style */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid #f3f4f6'
          }}>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#4b5563'
            }}>
              Total Submissions
            </span>
            <FileText style={{ height: '1rem', width: '1rem', color: '#9ca3af' }} />
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#111827',
            marginBottom: '0.25rem'
          }}>
            {statistics.totalSubmissions}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            margin: 0
          }}>
            All time
          </p>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid #f3f4f6'
          }}>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#4b5563'
            }}>
              Published
            </span>
            <CheckCircle style={{ height: '1rem', width: '1rem', color: '#9ca3af' }} />
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#16a34a',
            marginBottom: '0.25rem'
          }}>
            {statistics.byStatus.published}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            margin: 0
          }}>
            {statistics.totalSubmissions > 0
              ? Math.round((statistics.byStatus.published / statistics.totalSubmissions) * 100)
              : 0}
            % of total
          </p>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid #f3f4f6'
          }}>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#4b5563'
            }}>
              Declined
            </span>
            <XCircle style={{ height: '1rem', width: '1rem', color: '#9ca3af' }} />
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#dc2626',
            marginBottom: '0.25rem'
          }}>
            {statistics.byStatus.declined}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            margin: 0
          }}>
            {statistics.totalSubmissions > 0
              ? Math.round((statistics.byStatus.declined / statistics.totalSubmissions) * 100)
              : 0}
            % of total
          </p>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid #f3f4f6'
          }}>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#4b5563'
            }}>
              Total Users
            </span>
            <Users style={{ height: '1rem', width: '1rem', color: '#9ca3af' }} />
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#2563eb',
            marginBottom: '0.25rem'
          }}>
            {statistics.totalUsers}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            margin: 0
          }}>
            Registered users
          </p>
        </div>
      </div>

      {/* Submissions by Stage - OJS PKP 3.3 Style */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '1.5rem'
      }}>
        <div style={{
          marginBottom: '1rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #f3f4f6'
        }}>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: '#111827',
            margin: 0
          }}>
            Submissions by Stage
          </h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            padding: '1rem',
            border: '1px solid #dee2e6',
            borderRadius: '0.5rem'
          }}>
            <div style={{
              fontSize: '0.875rem',
              color: '#4b5563',
              marginBottom: '0.25rem'
            }}>
              Submission
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#111827'
            }}>
              {statistics.byStage.submission}
            </div>
          </div>
          <div style={{
            padding: '1rem',
            border: '1px solid #dee2e6',
            borderRadius: '0.5rem'
          }}>
            <div style={{
              fontSize: '0.875rem',
              color: '#4b5563',
              marginBottom: '0.25rem'
            }}>
              Review
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#ea580c'
            }}>
              {statistics.byStage.review}
            </div>
          </div>
          <div style={{
            padding: '1rem',
            border: '1px solid #dee2e6',
            borderRadius: '0.5rem'
          }}>
            <div style={{
              fontSize: '0.875rem',
              color: '#4b5563',
              marginBottom: '0.25rem'
            }}>
              Copyediting
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#9333ea'
            }}>
              {statistics.byStage.copyediting}
            </div>
          </div>
          <div style={{
            padding: '1rem',
            border: '1px solid #dee2e6',
            borderRadius: '0.5rem'
          }}>
            <div style={{
              fontSize: '0.875rem',
              color: '#4b5563',
              marginBottom: '0.25rem'
            }}>
              Production
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#4f46e5'
            }}>
              {statistics.byStage.production}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics - OJS PKP 3.3 Style */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '1.5rem'
      }}>
        <div style={{
          marginBottom: '1rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #f3f4f6'
        }}>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: '#111827',
            margin: 0
          }}>
            Performance Metrics
          </h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            padding: '1rem',
            border: '1px solid #dee2e6',
            borderRadius: '0.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <Clock style={{ height: '1.25rem', width: '1.25rem', color: '#9ca3af' }} />
              <div style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#374151'
              }}>
                Average Review Time
              </div>
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#111827',
              marginBottom: '0.25rem'
            }}>
              {formatDays(statistics.averageReviewTime)}
            </div>
            <p style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              margin: 0
            }}>
              Time from assignment to completion
            </p>
          </div>
          <div style={{
            padding: '1rem',
            border: '1px solid #dee2e6',
            borderRadius: '0.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <BarChart3 style={{ height: '1.25rem', width: '1.25rem', color: '#9ca3af' }} />
              <div style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#374151'
              }}>
                Average Publication Time
              </div>
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#111827',
              marginBottom: '0.25rem'
            }}>
              {formatDays(statistics.averagePublicationTime)}
            </div>
            <p style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              margin: 0
            }}>
              Time from submission to publication
            </p>
          </div>
        </div>
      </div>

      {/* Role Distribution - OJS PKP 3.3 Style */}
      {Object.keys(statistics.roleDistribution).length > 0 && (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.5rem'
        }}>
          <div style={{
            marginBottom: '1rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #f3f4f6'
          }}>
            <h2 style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: '#111827',
              margin: 0
            }}>
              User Role Distribution
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Object.entries(statistics.roleDistribution).map(([role, count]) => (
              <div key={role} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#374151'
                }}>
                  {role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <div style={{
                    width: '128px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '9999px',
                    height: '0.5rem'
                  }}>
                    <div
                      style={{
                        backgroundColor: '#006798',
                        height: '0.5rem',
                        borderRadius: '9999px',
                        width: `${
                          statistics.totalUsers > 0
                            ? Math.round((count / statistics.totalUsers) * 100)
                            : 0
                        }%`,
                        transition: 'width 0.3s'
                      }}
                    />
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#111827',
                    width: '3rem',
                    textAlign: 'right'
                  }}>
                    {count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}




import { BarChart3, Users, FileText, CheckCircle, XCircle, Clock } from "lucide-react";

type Statistics = {
  totalSubmissions: number;
  byStatus: {
    published: number;
    declined: number;
    accepted: number;
    inReview: number;
  };
  byStage: {
    submission: number;
    review: number;
    copyediting: number;
    production: number;
  };
  averageReviewTime: number;
  averagePublicationTime: number;
  totalUsers: number;
  roleDistribution: Record<string, number>;
};

type Props = {
  statistics: Statistics;
};

export function StatisticsClient({ statistics }: Props) {
  const formatDays = (days: number) => {
    if (days === 0) return "N/A";
    return `${Math.round(days)} days`;
  };

  return (
    <div style={{
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Page Header - OJS PKP 3.3 Style */}
      <div>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: '#002C40',
          margin: 0,
          marginBottom: '0.25rem'
        }}>
          Statistics & Reports
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: '#666',
          margin: 0
        }}>
          View detailed statistics about your journal
        </p>
      </div>

      {/* Overview Cards - OJS PKP 3.3 Style */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid #f3f4f6'
          }}>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#4b5563'
            }}>
              Total Submissions
            </span>
            <FileText style={{ height: '1rem', width: '1rem', color: '#9ca3af' }} />
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#111827',
            marginBottom: '0.25rem'
          }}>
            {statistics.totalSubmissions}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            margin: 0
          }}>
            All time
          </p>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid #f3f4f6'
          }}>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#4b5563'
            }}>
              Published
            </span>
            <CheckCircle style={{ height: '1rem', width: '1rem', color: '#9ca3af' }} />
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#16a34a',
            marginBottom: '0.25rem'
          }}>
            {statistics.byStatus.published}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            margin: 0
          }}>
            {statistics.totalSubmissions > 0
              ? Math.round((statistics.byStatus.published / statistics.totalSubmissions) * 100)
              : 0}
            % of total
          </p>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid #f3f4f6'
          }}>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#4b5563'
            }}>
              Declined
            </span>
            <XCircle style={{ height: '1rem', width: '1rem', color: '#9ca3af' }} />
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#dc2626',
            marginBottom: '0.25rem'
          }}>
            {statistics.byStatus.declined}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            margin: 0
          }}>
            {statistics.totalSubmissions > 0
              ? Math.round((statistics.byStatus.declined / statistics.totalSubmissions) * 100)
              : 0}
            % of total
          </p>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            paddingBottom: '0.75rem',
            borderBottom: '1px solid #f3f4f6'
          }}>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#4b5563'
            }}>
              Total Users
            </span>
            <Users style={{ height: '1rem', width: '1rem', color: '#9ca3af' }} />
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#2563eb',
            marginBottom: '0.25rem'
          }}>
            {statistics.totalUsers}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            margin: 0
          }}>
            Registered users
          </p>
        </div>
      </div>

      {/* Submissions by Stage - OJS PKP 3.3 Style */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '1.5rem'
      }}>
        <div style={{
          marginBottom: '1rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #f3f4f6'
        }}>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: '#111827',
            margin: 0
          }}>
            Submissions by Stage
          </h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            padding: '1rem',
            border: '1px solid #dee2e6',
            borderRadius: '0.5rem'
          }}>
            <div style={{
              fontSize: '0.875rem',
              color: '#4b5563',
              marginBottom: '0.25rem'
            }}>
              Submission
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#111827'
            }}>
              {statistics.byStage.submission}
            </div>
          </div>
          <div style={{
            padding: '1rem',
            border: '1px solid #dee2e6',
            borderRadius: '0.5rem'
          }}>
            <div style={{
              fontSize: '0.875rem',
              color: '#4b5563',
              marginBottom: '0.25rem'
            }}>
              Review
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#ea580c'
            }}>
              {statistics.byStage.review}
            </div>
          </div>
          <div style={{
            padding: '1rem',
            border: '1px solid #dee2e6',
            borderRadius: '0.5rem'
          }}>
            <div style={{
              fontSize: '0.875rem',
              color: '#4b5563',
              marginBottom: '0.25rem'
            }}>
              Copyediting
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#9333ea'
            }}>
              {statistics.byStage.copyediting}
            </div>
          </div>
          <div style={{
            padding: '1rem',
            border: '1px solid #dee2e6',
            borderRadius: '0.5rem'
          }}>
            <div style={{
              fontSize: '0.875rem',
              color: '#4b5563',
              marginBottom: '0.25rem'
            }}>
              Production
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#4f46e5'
            }}>
              {statistics.byStage.production}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics - OJS PKP 3.3 Style */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '1.5rem'
      }}>
        <div style={{
          marginBottom: '1rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #f3f4f6'
        }}>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: '#111827',
            margin: 0
          }}>
            Performance Metrics
          </h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            padding: '1rem',
            border: '1px solid #dee2e6',
            borderRadius: '0.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <Clock style={{ height: '1.25rem', width: '1.25rem', color: '#9ca3af' }} />
              <div style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#374151'
              }}>
                Average Review Time
              </div>
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#111827',
              marginBottom: '0.25rem'
            }}>
              {formatDays(statistics.averageReviewTime)}
            </div>
            <p style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              margin: 0
            }}>
              Time from assignment to completion
            </p>
          </div>
          <div style={{
            padding: '1rem',
            border: '1px solid #dee2e6',
            borderRadius: '0.5rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '0.5rem'
            }}>
              <BarChart3 style={{ height: '1.25rem', width: '1.25rem', color: '#9ca3af' }} />
              <div style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#374151'
              }}>
                Average Publication Time
              </div>
            </div>
            <div style={{
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#111827',
              marginBottom: '0.25rem'
            }}>
              {formatDays(statistics.averagePublicationTime)}
            </div>
            <p style={{
              fontSize: '0.75rem',
              color: '#6b7280',
              margin: 0
            }}>
              Time from submission to publication
            </p>
          </div>
        </div>
      </div>

      {/* Role Distribution - OJS PKP 3.3 Style */}
      {Object.keys(statistics.roleDistribution).length > 0 && (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.5rem'
        }}>
          <div style={{
            marginBottom: '1rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #f3f4f6'
          }}>
            <h2 style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: '#111827',
              margin: 0
            }}>
              User Role Distribution
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {Object.entries(statistics.roleDistribution).map(([role, count]) => (
              <div key={role} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#374151'
                }}>
                  {role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <div style={{
                    width: '128px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '9999px',
                    height: '0.5rem'
                  }}>
                    <div
                      style={{
                        backgroundColor: '#006798',
                        height: '0.5rem',
                        borderRadius: '9999px',
                        width: `${
                          statistics.totalUsers > 0
                            ? Math.round((count / statistics.totalUsers) * 100)
                            : 0
                        }%`,
                        transition: 'width 0.3s'
                      }}
                    />
                  </div>
                  <div style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#111827',
                    width: '3rem',
                    textAlign: 'right'
                  }}>
                    {count}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}



