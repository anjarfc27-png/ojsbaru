'use client'

import Link from "next/link";
import { BookOpen, Users, Settings, Plus, Eye } from "lucide-react";
import { withAuth } from "@/lib/auth-client";

// Mock data for journals
const mockJournals = [
  {
    id: 1,
    path: "jcs",
    title: "Journal of Computer Science",
    description: "A peer-reviewed journal covering all aspects of computer science",
    status: "Enabled",
    submissions: 45,
    users: 12,
    created_date: "2024-01-15"
  },
  {
    id: 2,
    path: "jbiotech",
    title: "Journal of Biotechnology",
    description: "Research articles in biotechnology and related fields",
    status: "Enabled",
    submissions: 32,
    users: 8,
    created_date: "2024-02-01"
  },
  {
    id: 3,
    path: "jmath",
    title: "Journal of Mathematics",
    description: "Mathematical research and theoretical studies",
    status: "Disabled",
    submissions: 0,
    users: 0,
    created_date: "2024-02-15"
  }
];

function SiteManagementPage() {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* OJS PKP 3.3 Style Header */}
      <div style={{ 
        borderBottom: '2px solid #e5e5e5',
        paddingBottom: '1rem',
        marginBottom: '1.5rem'
      }}>
        <h1 style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          color: '#002C40',
          margin: 0,
          marginBottom: '0.25rem'
        }}>
          Hosted Journals
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: '#666',
          margin: 0
        }}>
          Manage journals hosted on this site
        </p>
      </div>

      {/* Journal Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.25rem'
        }}>
          <div style={{
            paddingBottom: '0.75rem',
            marginBottom: '0.75rem',
            borderBottom: '1px solid #e5e5e5'
          }}>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#666',
              margin: 0
            }}>
              Total Journals
            </h3>
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#002C40',
            marginBottom: '0.25rem'
          }}>
            {mockJournals.length}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#666',
            margin: 0
          }}>
            Hosted on this site
          </p>
        </div>

        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.25rem'
        }}>
          <div style={{
            paddingBottom: '0.75rem',
            marginBottom: '0.75rem',
            borderBottom: '1px solid #e5e5e5'
          }}>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#666',
              margin: 0
            }}>
              Active Journals
            </h3>
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#00B24E',
            marginBottom: '0.25rem'
          }}>
            {mockJournals.filter(j => j.status === "Enabled").length}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#666',
            margin: 0
          }}>
            Currently active
          </p>
        </div>

        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.25rem'
        }}>
          <div style={{
            paddingBottom: '0.75rem',
            marginBottom: '0.75rem',
            borderBottom: '1px solid #e5e5e5'
          }}>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#666',
              margin: 0
            }}>
              Total Submissions
            </h3>
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#006798',
            marginBottom: '0.25rem'
          }}>
            {mockJournals.reduce((sum, j) => sum + j.submissions, 0)}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#666',
            margin: 0
          }}>
            Across all journals
          </p>
        </div>

        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.25rem'
        }}>
          <div style={{
            paddingBottom: '0.75rem',
            marginBottom: '0.75rem',
            borderBottom: '1px solid #e5e5e5'
          }}>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#666',
              margin: 0
            }}>
              Total Users
            </h3>
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#006798',
            marginBottom: '0.25rem'
          }}>
            {mockJournals.reduce((sum, j) => sum + j.users, 0)}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#666',
            margin: 0
          }}>
            Across all journals
          </p>
        </div>
      </div>

      {/* Create New Journal Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '1.5rem'
      }}>
        <Link
          href="/admin/site-management/hosted-journals/create"
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            padding: '0.5rem 1rem',
            backgroundColor: '#006798',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Plus style={{ width: '1rem', height: '1rem' }} />
          Create Journal
        </Link>
      </div>

      {/* Journals Table */}
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
            margin: '0 0 0.25rem 0'
          }}>
            Journal Management
          </h2>
          <p style={{
            fontSize: '0.875rem',
            color: '#666',
            margin: 0
          }}>
            Manage journals hosted on this site
          </p>
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
                  Path
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
                  Submissions
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  Users
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  Created Date
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
              {mockJournals.map((journal) => (
                <tr key={journal.id} style={{
                  borderBottom: '1px solid #e5e5e5',
                  backgroundColor: '#fff'
                }}>
                  <td style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    borderRight: '1px solid #e5e5e5'
                  }}>
                    <div>
                      <div style={{
                        fontWeight: 500,
                        color: '#002C40',
                        marginBottom: '0.25rem'
                      }}>
                        {journal.title}
                      </div>
                      <div style={{
                        fontSize: '0.875rem',
                        color: '#666',
                        maxWidth: '300px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {journal.description}
                      </div>
                    </div>
                  </td>
                  <td style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    borderRight: '1px solid #e5e5e5'
                  }}>
                    <code style={{
                      fontSize: '0.875rem',
                      backgroundColor: '#f8f9fa',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontFamily: 'monospace'
                    }}>
                      {journal.path}
                    </code>
                  </td>
                  <td style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    borderRight: '1px solid #e5e5e5'
                  }}>
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: journal.status === "Enabled" ? '#d4edda' : '#e2e3e5',
                      color: journal.status === "Enabled" ? '#155724' : '#383d41',
                      fontWeight: 600
                    }}>
                      {journal.status}
                    </span>
                  </td>
                  <td style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    borderRight: '1px solid #e5e5e5'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <BookOpen style={{
                        width: '0.75rem',
                        height: '0.75rem',
                        color: '#666'
                      }} />
                      <span>{journal.submissions}</span>
                    </div>
                  </td>
                  <td style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    borderRight: '1px solid #e5e5e5'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <Users style={{
                        width: '0.75rem',
                        height: '0.75rem',
                        color: '#666'
                      }} />
                      <span>{journal.users}</span>
                    </div>
                  </td>
                  <td style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    color: '#333',
                    borderRight: '1px solid #e5e5e5'
                  }}>
                    {journal.created_date}
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
                        href={`/admin/site-management/hosted-journals/${journal.id}`}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: 'transparent',
                          border: '1px solid #dee2e6',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#006798',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <Eye style={{ width: '0.75rem', height: '0.75rem' }} />
                        View
                      </Link>
                      <Link
                        href={`/admin/site-management/hosted-journals/${journal.id}/settings`}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: 'transparent',
                          border: '1px solid #dee2e6',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#006798',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <Settings style={{ width: '0.75rem', height: '0.75rem' }} />
                        Settings
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default withAuth(SiteManagementPage, 'admin')

              color: '#666',
              margin: 0
            }}>
              Total Users
            </h3>
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#006798',
            marginBottom: '0.25rem'
          }}>
            {mockJournals.reduce((sum, j) => sum + j.users, 0)}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#666',
            margin: 0
          }}>
            Across all journals
          </p>
        </div>
      </div>

      {/* Create New Journal Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '1.5rem'
      }}>
        <Link
          href="/admin/site-management/hosted-journals/create"
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            padding: '0.5rem 1rem',
            backgroundColor: '#006798',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Plus style={{ width: '1rem', height: '1rem' }} />
          Create Journal
        </Link>
      </div>

      {/* Journals Table */}
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
            margin: '0 0 0.25rem 0'
          }}>
            Journal Management
          </h2>
          <p style={{
            fontSize: '0.875rem',
            color: '#666',
            margin: 0
          }}>
            Manage journals hosted on this site
          </p>
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
                  Path
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
                  Submissions
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  Users
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  Created Date
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
              {mockJournals.map((journal) => (
                <tr key={journal.id} style={{
                  borderBottom: '1px solid #e5e5e5',
                  backgroundColor: '#fff'
                }}>
                  <td style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    borderRight: '1px solid #e5e5e5'
                  }}>
                    <div>
                      <div style={{
                        fontWeight: 500,
                        color: '#002C40',
                        marginBottom: '0.25rem'
                      }}>
                        {journal.title}
                      </div>
                      <div style={{
                        fontSize: '0.875rem',
                        color: '#666',
                        maxWidth: '300px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {journal.description}
                      </div>
                    </div>
                  </td>
                  <td style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    borderRight: '1px solid #e5e5e5'
                  }}>
                    <code style={{
                      fontSize: '0.875rem',
                      backgroundColor: '#f8f9fa',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontFamily: 'monospace'
                    }}>
                      {journal.path}
                    </code>
                  </td>
                  <td style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    borderRight: '1px solid #e5e5e5'
                  }}>
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: journal.status === "Enabled" ? '#d4edda' : '#e2e3e5',
                      color: journal.status === "Enabled" ? '#155724' : '#383d41',
                      fontWeight: 600
                    }}>
                      {journal.status}
                    </span>
                  </td>
                  <td style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    borderRight: '1px solid #e5e5e5'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <BookOpen style={{
                        width: '0.75rem',
                        height: '0.75rem',
                        color: '#666'
                      }} />
                      <span>{journal.submissions}</span>
                    </div>
                  </td>
                  <td style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    borderRight: '1px solid #e5e5e5'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <Users style={{
                        width: '0.75rem',
                        height: '0.75rem',
                        color: '#666'
                      }} />
                      <span>{journal.users}</span>
                    </div>
                  </td>
                  <td style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    color: '#333',
                    borderRight: '1px solid #e5e5e5'
                  }}>
                    {journal.created_date}
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
                        href={`/admin/site-management/hosted-journals/${journal.id}`}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: 'transparent',
                          border: '1px solid #dee2e6',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#006798',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <Eye style={{ width: '0.75rem', height: '0.75rem' }} />
                        View
                      </Link>
                      <Link
                        href={`/admin/site-management/hosted-journals/${journal.id}/settings`}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: 'transparent',
                          border: '1px solid #dee2e6',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#006798',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <Settings style={{ width: '0.75rem', height: '0.75rem' }} />
                        Settings
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default withAuth(SiteManagementPage, 'admin')

              color: '#666',
              margin: 0
            }}>
              Total Users
            </h3>
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#006798',
            marginBottom: '0.25rem'
          }}>
            {mockJournals.reduce((sum, j) => sum + j.users, 0)}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#666',
            margin: 0
          }}>
            Across all journals
          </p>
        </div>
      </div>

      {/* Create New Journal Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '1.5rem'
      }}>
        <Link
          href="/admin/site-management/hosted-journals/create"
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            padding: '0.5rem 1rem',
            backgroundColor: '#006798',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Plus style={{ width: '1rem', height: '1rem' }} />
          Create Journal
        </Link>
      </div>

      {/* Journals Table */}
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
            margin: '0 0 0.25rem 0'
          }}>
            Journal Management
          </h2>
          <p style={{
            fontSize: '0.875rem',
            color: '#666',
            margin: 0
          }}>
            Manage journals hosted on this site
          </p>
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
                  Path
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
                  Submissions
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  Users
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  Created Date
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
              {mockJournals.map((journal) => (
                <tr key={journal.id} style={{
                  borderBottom: '1px solid #e5e5e5',
                  backgroundColor: '#fff'
                }}>
                  <td style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    borderRight: '1px solid #e5e5e5'
                  }}>
                    <div>
                      <div style={{
                        fontWeight: 500,
                        color: '#002C40',
                        marginBottom: '0.25rem'
                      }}>
                        {journal.title}
                      </div>
                      <div style={{
                        fontSize: '0.875rem',
                        color: '#666',
                        maxWidth: '300px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {journal.description}
                      </div>
                    </div>
                  </td>
                  <td style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    borderRight: '1px solid #e5e5e5'
                  }}>
                    <code style={{
                      fontSize: '0.875rem',
                      backgroundColor: '#f8f9fa',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontFamily: 'monospace'
                    }}>
                      {journal.path}
                    </code>
                  </td>
                  <td style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    borderRight: '1px solid #e5e5e5'
                  }}>
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: journal.status === "Enabled" ? '#d4edda' : '#e2e3e5',
                      color: journal.status === "Enabled" ? '#155724' : '#383d41',
                      fontWeight: 600
                    }}>
                      {journal.status}
                    </span>
                  </td>
                  <td style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    borderRight: '1px solid #e5e5e5'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <BookOpen style={{
                        width: '0.75rem',
                        height: '0.75rem',
                        color: '#666'
                      }} />
                      <span>{journal.submissions}</span>
                    </div>
                  </td>
                  <td style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    borderRight: '1px solid #e5e5e5'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <Users style={{
                        width: '0.75rem',
                        height: '0.75rem',
                        color: '#666'
                      }} />
                      <span>{journal.users}</span>
                    </div>
                  </td>
                  <td style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    color: '#333',
                    borderRight: '1px solid #e5e5e5'
                  }}>
                    {journal.created_date}
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
                        href={`/admin/site-management/hosted-journals/${journal.id}`}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: 'transparent',
                          border: '1px solid #dee2e6',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#006798',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <Eye style={{ width: '0.75rem', height: '0.75rem' }} />
                        View
                      </Link>
                      <Link
                        href={`/admin/site-management/hosted-journals/${journal.id}/settings`}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: 'transparent',
                          border: '1px solid #dee2e6',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#006798',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <Settings style={{ width: '0.75rem', height: '0.75rem' }} />
                        Settings
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default withAuth(SiteManagementPage, 'admin')

              color: '#666',
              margin: 0
            }}>
              Total Users
            </h3>
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#006798',
            marginBottom: '0.25rem'
          }}>
            {mockJournals.reduce((sum, j) => sum + j.users, 0)}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#666',
            margin: 0
          }}>
            Across all journals
          </p>
        </div>
      </div>

      {/* Create New Journal Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginBottom: '1.5rem'
      }}>
        <Link
          href="/admin/site-management/hosted-journals/create"
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            padding: '0.5rem 1rem',
            backgroundColor: '#006798',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          <Plus style={{ width: '1rem', height: '1rem' }} />
          Create Journal
        </Link>
      </div>

      {/* Journals Table */}
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
            margin: '0 0 0.25rem 0'
          }}>
            Journal Management
          </h2>
          <p style={{
            fontSize: '0.875rem',
            color: '#666',
            margin: 0
          }}>
            Manage journals hosted on this site
          </p>
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
                  Path
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
                  Submissions
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  Users
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  Created Date
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
              {mockJournals.map((journal) => (
                <tr key={journal.id} style={{
                  borderBottom: '1px solid #e5e5e5',
                  backgroundColor: '#fff'
                }}>
                  <td style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    borderRight: '1px solid #e5e5e5'
                  }}>
                    <div>
                      <div style={{
                        fontWeight: 500,
                        color: '#002C40',
                        marginBottom: '0.25rem'
                      }}>
                        {journal.title}
                      </div>
                      <div style={{
                        fontSize: '0.875rem',
                        color: '#666',
                        maxWidth: '300px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {journal.description}
                      </div>
                    </div>
                  </td>
                  <td style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    borderRight: '1px solid #e5e5e5'
                  }}>
                    <code style={{
                      fontSize: '0.875rem',
                      backgroundColor: '#f8f9fa',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontFamily: 'monospace'
                    }}>
                      {journal.path}
                    </code>
                  </td>
                  <td style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    borderRight: '1px solid #e5e5e5'
                  }}>
                    <span style={{
                      fontSize: '0.75rem',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '4px',
                      backgroundColor: journal.status === "Enabled" ? '#d4edda' : '#e2e3e5',
                      color: journal.status === "Enabled" ? '#155724' : '#383d41',
                      fontWeight: 600
                    }}>
                      {journal.status}
                    </span>
                  </td>
                  <td style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    borderRight: '1px solid #e5e5e5'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <BookOpen style={{
                        width: '0.75rem',
                        height: '0.75rem',
                        color: '#666'
                      }} />
                      <span>{journal.submissions}</span>
                    </div>
                  </td>
                  <td style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    borderRight: '1px solid #e5e5e5'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <Users style={{
                        width: '0.75rem',
                        height: '0.75rem',
                        color: '#666'
                      }} />
                      <span>{journal.users}</span>
                    </div>
                  </td>
                  <td style={{
                    padding: '0.75rem 1rem',
                    fontSize: '0.875rem',
                    color: '#333',
                    borderRight: '1px solid #e5e5e5'
                  }}>
                    {journal.created_date}
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
                        href={`/admin/site-management/hosted-journals/${journal.id}`}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: 'transparent',
                          border: '1px solid #dee2e6',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#006798',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <Eye style={{ width: '0.75rem', height: '0.75rem' }} />
                        View
                      </Link>
                      <Link
                        href={`/admin/site-management/hosted-journals/${journal.id}/settings`}
                        style={{
                          fontSize: '0.75rem',
                          padding: '0.25rem 0.5rem',
                          backgroundColor: 'transparent',
                          border: '1px solid #dee2e6',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          color: '#006798',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem'
                        }}
                      >
                        <Settings style={{ width: '0.75rem', height: '0.75rem' }} />
                        Settings
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default withAuth(SiteManagementPage, 'admin')
