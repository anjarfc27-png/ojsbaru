"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, Filter, Eye } from "lucide-react";

type Submission = {
  id: string;
  title: string;
  journalId: string;
  journalTitle?: string;
  stage: string;
  status: string;
  isArchived: boolean;
  submittedAt: string | null;
  updatedAt: string | null;
  assignees: Array<{ id: string; name: string }>;
};

type Props = {
  submissions: Submission[];
};

export function SubmissionsClient({ submissions: initialSubmissions }: Props) {
  const [stageFilter, setStageFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { bgColor: string; textColor: string; borderColor: string; label: string }> = {
      published: { bgColor: '#d4edda', textColor: '#155724', borderColor: '#c3e6cb', label: "Published" },
      declined: { bgColor: '#f8d7da', textColor: '#721c24', borderColor: '#f5c6cb', label: "Declined" },
      accepted: { bgColor: '#d4edda', textColor: '#155724', borderColor: '#c3e6cb', label: "Accepted" },
      submitted: { bgColor: '#e2e3e5', textColor: '#383d41', borderColor: '#d6d8db', label: "Submitted" },
      in_review: { bgColor: 'transparent', textColor: '#383d41', borderColor: '#dee2e6', label: "In Review" },
    };

    const config = variants[status] || { bgColor: '#e2e3e5', textColor: '#383d41', borderColor: '#d6d8db', label: status };
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.25rem 0.5rem',
        fontSize: '0.75rem',
        fontWeight: 600,
        backgroundColor: config.bgColor,
        color: config.textColor,
        border: `1px solid ${config.borderColor}`,
        borderRadius: '0.25rem'
      }}>
        {config.label}
      </span>
    );
  };

  const getStageBadge = (stage: string) => {
    const stageLabels: Record<string, string> = {
      submission: "Submission",
      review: "Review",
      copyediting: "Copyediting",
      production: "Production",
    };
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.25rem 0.5rem',
        fontSize: '0.75rem',
        fontWeight: 600,
        backgroundColor: 'transparent',
        color: '#383d41',
        border: '1px solid #dee2e6',
        borderRadius: '0.25rem'
      }}>
        {stageLabels[stage] || stage}
      </span>
    );
  };

  // Filter submissions
  const filteredSubmissions = initialSubmissions.filter((submission) => {
    const matchesSearch = searchQuery === "" || 
      submission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      submission.journalTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === "all" || submission.stage === stageFilter;
    const matchesStatus = statusFilter === "all" || submission.status === statusFilter;
    return matchesSearch && matchesStage && matchesStatus;
  });

  return (
    <div style={{
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* Page Header - OJS PKP 3.3 Style */}
      <div style={{
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
            Submissions
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: '#666',
            margin: 0
          }}>
            Manage all journal submissions
          </p>
        </div>
      </div>

      {/* Filters - OJS PKP 3.3 Style */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '1rem'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ position: 'relative' }}>
              <Search style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                height: '1rem',
                width: '1rem',
                color: '#9ca3af'
              }} />
              <input
                type="text"
                placeholder="Search submissions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem 0.5rem 2.5rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  fontSize: '0.875rem'
                }}
              />
            </div>
          </div>
          <div style={{
            display: 'flex',
            gap: '0.5rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ position: 'relative' }}>
              <Filter style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                height: '1rem',
                width: '1rem',
                color: '#9ca3af',
                pointerEvents: 'none',
                zIndex: 1
              }} />
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                style={{
                  width: '150px',
                  padding: '0.5rem 0.75rem 0.5rem 2.5rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Stages</option>
                <option value="submission">Submission</option>
                <option value="review">Review</option>
                <option value="copyediting">Copyediting</option>
                <option value="production">Production</option>
              </select>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '150px',
                padding: '0.5rem 0.75rem',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '0.875rem',
                backgroundColor: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="in_review">In Review</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submissions List - OJS PKP 3.3 Style */}
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
            All Submissions ({filteredSubmissions.length})
          </h2>
        </div>
        <div>
          {filteredSubmissions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#6b7280'
            }}>
              <p style={{ margin: 0 }}>No submissions found</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  style={{
                    border: '1px solid #f3f4f6',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{ flex: 1, minWidth: 0, marginRight: '1rem' }}>
                      <h4 style={{
                        fontWeight: 500,
                        color: '#111827',
                        fontSize: '0.875rem',
                        lineHeight: '1.5',
                        margin: 0,
                        marginBottom: '0.25rem'
                      }}>
                        {submission.title || "Untitled Submission"}
                      </h4>
                      {submission.journalTitle && (
                        <p style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          margin: 0,
                          marginTop: '0.25rem'
                        }}>
                          {submission.journalTitle}
                        </p>
                      )}
                      <p style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        margin: 0,
                        marginTop: '0.25rem'
                      }}>
                        Updated: {formatDate(submission.updatedAt)}
                      </p>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      flexShrink: 0
                    }}>
                      {getStatusBadge(submission.status)}
                      {getStageBadge(submission.stage)}
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '0.75rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{
                        fontSize: '0.75rem',
                        color: '#6b7280'
                      }}>
                        Submitted: {formatDate(submission.submittedAt)}
                      </span>
                      {submission.assignees.length > 0 && (
                        <span style={{
                          fontSize: '0.75rem',
                          color: '#6b7280'
                        }}>
                          Assigned to: {submission.assignees.map((a) => a.name).join(", ")}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link
                        href={`/editor/submissions/${submission.id}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.25rem 0.75rem',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: '#006798',
                          backgroundColor: 'transparent',
                          border: '1px solid transparent',
                          borderRadius: '4px',
                          textDecoration: 'none',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Eye style={{ height: '0.75rem', width: '0.75rem' }} />
                        <span>View</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

                zIndex: 1
              }} />
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                style={{
                  width: '150px',
                  padding: '0.5rem 0.75rem 0.5rem 2.5rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Stages</option>
                <option value="submission">Submission</option>
                <option value="review">Review</option>
                <option value="copyediting">Copyediting</option>
                <option value="production">Production</option>
              </select>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '150px',
                padding: '0.5rem 0.75rem',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '0.875rem',
                backgroundColor: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="in_review">In Review</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submissions List - OJS PKP 3.3 Style */}
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
            All Submissions ({filteredSubmissions.length})
          </h2>
        </div>
        <div>
          {filteredSubmissions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#6b7280'
            }}>
              <p style={{ margin: 0 }}>No submissions found</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  style={{
                    border: '1px solid #f3f4f6',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{ flex: 1, minWidth: 0, marginRight: '1rem' }}>
                      <h4 style={{
                        fontWeight: 500,
                        color: '#111827',
                        fontSize: '0.875rem',
                        lineHeight: '1.5',
                        margin: 0,
                        marginBottom: '0.25rem'
                      }}>
                        {submission.title || "Untitled Submission"}
                      </h4>
                      {submission.journalTitle && (
                        <p style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          margin: 0,
                          marginTop: '0.25rem'
                        }}>
                          {submission.journalTitle}
                        </p>
                      )}
                      <p style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        margin: 0,
                        marginTop: '0.25rem'
                      }}>
                        Updated: {formatDate(submission.updatedAt)}
                      </p>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      flexShrink: 0
                    }}>
                      {getStatusBadge(submission.status)}
                      {getStageBadge(submission.stage)}
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '0.75rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{
                        fontSize: '0.75rem',
                        color: '#6b7280'
                      }}>
                        Submitted: {formatDate(submission.submittedAt)}
                      </span>
                      {submission.assignees.length > 0 && (
                        <span style={{
                          fontSize: '0.75rem',
                          color: '#6b7280'
                        }}>
                          Assigned to: {submission.assignees.map((a) => a.name).join(", ")}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link
                        href={`/editor/submissions/${submission.id}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.25rem 0.75rem',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: '#006798',
                          backgroundColor: 'transparent',
                          border: '1px solid transparent',
                          borderRadius: '4px',
                          textDecoration: 'none',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Eye style={{ height: '0.75rem', width: '0.75rem' }} />
                        <span>View</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

                zIndex: 1
              }} />
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                style={{
                  width: '150px',
                  padding: '0.5rem 0.75rem 0.5rem 2.5rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Stages</option>
                <option value="submission">Submission</option>
                <option value="review">Review</option>
                <option value="copyediting">Copyediting</option>
                <option value="production">Production</option>
              </select>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '150px',
                padding: '0.5rem 0.75rem',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '0.875rem',
                backgroundColor: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="in_review">In Review</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submissions List - OJS PKP 3.3 Style */}
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
            All Submissions ({filteredSubmissions.length})
          </h2>
        </div>
        <div>
          {filteredSubmissions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#6b7280'
            }}>
              <p style={{ margin: 0 }}>No submissions found</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  style={{
                    border: '1px solid #f3f4f6',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{ flex: 1, minWidth: 0, marginRight: '1rem' }}>
                      <h4 style={{
                        fontWeight: 500,
                        color: '#111827',
                        fontSize: '0.875rem',
                        lineHeight: '1.5',
                        margin: 0,
                        marginBottom: '0.25rem'
                      }}>
                        {submission.title || "Untitled Submission"}
                      </h4>
                      {submission.journalTitle && (
                        <p style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          margin: 0,
                          marginTop: '0.25rem'
                        }}>
                          {submission.journalTitle}
                        </p>
                      )}
                      <p style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        margin: 0,
                        marginTop: '0.25rem'
                      }}>
                        Updated: {formatDate(submission.updatedAt)}
                      </p>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      flexShrink: 0
                    }}>
                      {getStatusBadge(submission.status)}
                      {getStageBadge(submission.stage)}
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '0.75rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{
                        fontSize: '0.75rem',
                        color: '#6b7280'
                      }}>
                        Submitted: {formatDate(submission.submittedAt)}
                      </span>
                      {submission.assignees.length > 0 && (
                        <span style={{
                          fontSize: '0.75rem',
                          color: '#6b7280'
                        }}>
                          Assigned to: {submission.assignees.map((a) => a.name).join(", ")}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link
                        href={`/editor/submissions/${submission.id}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.25rem 0.75rem',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: '#006798',
                          backgroundColor: 'transparent',
                          border: '1px solid transparent',
                          borderRadius: '4px',
                          textDecoration: 'none',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Eye style={{ height: '0.75rem', width: '0.75rem' }} />
                        <span>View</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

                zIndex: 1
              }} />
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                style={{
                  width: '150px',
                  padding: '0.5rem 0.75rem 0.5rem 2.5rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Stages</option>
                <option value="submission">Submission</option>
                <option value="review">Review</option>
                <option value="copyediting">Copyediting</option>
                <option value="production">Production</option>
              </select>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                width: '150px',
                padding: '0.5rem 0.75rem',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '0.875rem',
                backgroundColor: '#ffffff',
                cursor: 'pointer'
              }}
            >
              <option value="all">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="in_review">In Review</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
              <option value="published">Published</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submissions List - OJS PKP 3.3 Style */}
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
            All Submissions ({filteredSubmissions.length})
          </h2>
        </div>
        <div>
          {filteredSubmissions.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#6b7280'
            }}>
              <p style={{ margin: 0 }}>No submissions found</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {filteredSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  style={{
                    border: '1px solid #f3f4f6',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{ flex: 1, minWidth: 0, marginRight: '1rem' }}>
                      <h4 style={{
                        fontWeight: 500,
                        color: '#111827',
                        fontSize: '0.875rem',
                        lineHeight: '1.5',
                        margin: 0,
                        marginBottom: '0.25rem'
                      }}>
                        {submission.title || "Untitled Submission"}
                      </h4>
                      {submission.journalTitle && (
                        <p style={{
                          fontSize: '0.75rem',
                          color: '#6b7280',
                          margin: 0,
                          marginTop: '0.25rem'
                        }}>
                          {submission.journalTitle}
                        </p>
                      )}
                      <p style={{
                        fontSize: '0.75rem',
                        color: '#6b7280',
                        margin: 0,
                        marginTop: '0.25rem'
                      }}>
                        Updated: {formatDate(submission.updatedAt)}
                      </p>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      flexShrink: 0
                    }}>
                      {getStatusBadge(submission.status)}
                      {getStageBadge(submission.stage)}
                    </div>
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '0.75rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{
                        fontSize: '0.75rem',
                        color: '#6b7280'
                      }}>
                        Submitted: {formatDate(submission.submittedAt)}
                      </span>
                      {submission.assignees.length > 0 && (
                        <span style={{
                          fontSize: '0.75rem',
                          color: '#6b7280'
                        }}>
                          Assigned to: {submission.assignees.map((a) => a.name).join(", ")}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link
                        href={`/editor/submissions/${submission.id}`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.25rem 0.75rem',
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: '#006798',
                          backgroundColor: 'transparent',
                          border: '1px solid transparent',
                          borderRadius: '4px',
                          textDecoration: 'none',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Eye style={{ height: '0.75rem', width: '0.75rem' }} />
                        <span>View</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
