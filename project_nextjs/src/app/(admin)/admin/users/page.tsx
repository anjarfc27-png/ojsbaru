'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, Mail, UserCheck, UserX, Search, Filter } from 'lucide-react';
import { withAuth } from '@/lib/auth-client';

function AdminUsers() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const [users] = useState([
    {
      id: 1,
      username: 'johnson.m',
      full_name: 'Dr. Michael Johnson',
      email: 'johnson.m@university.edu',
      roles: ['Editor', 'Author'],
      status: 'Active',
      last_login: '2024-01-20 14:30',
      date_registered: '2023-03-15',
      submissions: 8,
      reviews: 12
    },
    {
      id: 2,
      username: 'smith.a',
      full_name: 'Prof. Anna Smith',
      email: 'smith.a@institute.org',
      roles: ['Reviewer'],
      status: 'Active',
      last_login: '2024-01-19 09:15',
      date_registered: '2023-06-22',
      submissions: 0,
      reviews: 28
    },
    {
      id: 3,
      username: 'lee.david',
      full_name: 'Dr. David Lee',
      email: 'lee.david@college.edu',
      roles: ['Author'],
      status: 'Active',
      last_login: '2024-01-18 16:45',
      date_registered: '2023-09-10',
      submissions: 15,
      reviews: 0
    },
    {
      id: 4,
      username: 'wilson.s',
      full_name: 'Sarah Wilson',
      email: 'wilson.s@research.org',
      roles: ['Author', 'Reviewer'],
      status: 'Inactive',
      last_login: '2023-12-20 11:20',
      date_registered: '2023-01-05',
      submissions: 3,
      reviews: 8
    },
    {
      id: 5,
      username: 'chen.ming',
      full_name: 'Dr. Ming Chen',
      email: 'chen.ming@university.edu',
      roles: ['Editor'],
      status: 'Active',
      last_login: '2024-01-20 10:30',
      date_registered: '2022-11-18',
      submissions: 5,
      reviews: 35
    }
  ]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.roles.some(role => role.toLowerCase() === filterRole.toLowerCase());
    const matchesStatus = filterStatus === 'all' || user.status.toLowerCase() === filterStatus.toLowerCase();
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {/* OJS PKP 3.3 Style Header */}
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
            User Management
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: '#666',
            margin: 0
          }}>
            Manage all users across the site
          </p>
        </div>
        <Link
          href="/admin/users/create"
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
          <UserPlus style={{ width: '1rem', height: '1rem' }} />
          Add New User
        </Link>
      </div>

      {/* Filters */}
      <div style={{
        backgroundColor: '#fff',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        padding: '1.5rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          paddingBottom: '1rem',
          marginBottom: '1rem',
          borderBottom: '1px solid #e5e5e5'
        }}>
          <h2 style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: '#002C40',
            margin: 0
          }}>
            Filter Users
          </h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <label htmlFor="search" style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#002C40'
            }}>
              Search
            </label>
            <div style={{ position: 'relative' }}>
              <Search style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '1rem',
                height: '1rem',
                color: '#666'
              }} />
              <input
                id="search"
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.5rem 0.5rem 2.5rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  fontFamily: 'inherit'
                }}
              />
            </div>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <label htmlFor="role" style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#002C40'
            }}>
              Role
            </label>
            <select
              id="role"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                backgroundColor: '#fff'
              }}
            >
              <option value="all">All Roles</option>
              <option value="editor">Editor</option>
              <option value="author">Author</option>
              <option value="reviewer">Reviewer</option>
            </select>
          </div>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            <label htmlFor="status" style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#002C40'
            }}>
              Status
            </label>
            <select
              id="status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                backgroundColor: '#fff'
              }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'flex-end'
          }}>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setFilterRole('all');
                setFilterStatus('all');
              }}
              style={{
                width: '100%',
                fontSize: '0.875rem',
                fontWeight: 600,
                padding: '0.5rem 1rem',
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#006798',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <Filter style={{ width: '1rem', height: '1rem' }} />
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
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
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#002C40',
              margin: 0
            }}>
              Total Users
            </h3>
            <UserCheck style={{ width: '1rem', height: '1rem', color: '#666' }} />
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#002C40',
            marginBottom: '0.25rem'
          }}>
            {users.length}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#666',
            margin: 0
          }}>
            {users.filter(u => u.status === 'Active').length} active
          </p>
        </div>
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.25rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#002C40',
              margin: 0
            }}>
              Editors
            </h3>
            <span style={{
              fontSize: '0.75rem',
              padding: '0.125rem 0.5rem',
              borderRadius: '4px',
              backgroundColor: '#e9d5ff',
              color: '#6b21a8',
              fontWeight: 600
            }}>
              ED
            </span>
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#7c3aed',
            marginBottom: '0.25rem'
          }}>
            {users.filter(u => u.roles.includes('Editor')).length}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#666',
            margin: 0
          }}>
            Active editors
          </p>
        </div>
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.25rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#002C40',
              margin: 0
            }}>
              Authors
            </h3>
            <span style={{
              fontSize: '0.75rem',
              padding: '0.125rem 0.5rem',
              borderRadius: '4px',
              backgroundColor: '#dbeafe',
              color: '#1e40af',
              fontWeight: 600
            }}>
              AU
            </span>
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#3b82f6',
            marginBottom: '0.25rem'
          }}>
            {users.filter(u => u.roles.includes('Author')).length}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#666',
            margin: 0
          }}>
            Active authors
          </p>
        </div>
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.25rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#002C40',
              margin: 0
            }}>
              Reviewers
            </h3>
            <span style={{
              fontSize: '0.75rem',
              padding: '0.125rem 0.5rem',
              borderRadius: '4px',
              backgroundColor: '#fed7aa',
              color: '#9a3412',
              fontWeight: 600
            }}>
              RV
            </span>
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#ea580c',
            marginBottom: '0.25rem'
          }}>
            {users.filter(u => u.roles.includes('Reviewer')).length}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#666',
            margin: 0
          }}>
            Active reviewers
          </p>
        </div>
      </div>

      {/* Users Table */}
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
            User List ({filteredUsers.length} users)
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
                  User
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  Email
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  Roles
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
                  Last Login
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  Registered
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  Activity
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
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{
                    padding: '2rem',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    color: '#666',
                    fontStyle: 'italic'
                  }}>
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} style={{
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
                          {user.full_name}
                        </div>
                        <div style={{
                          fontSize: '0.875rem',
                          color: '#666'
                        }}>
                          @{user.username}
                        </div>
                      </div>
                    </td>
                    <td style={{
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      color: '#333',
                      borderRight: '1px solid #e5e5e5',
                      maxWidth: '250px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {user.email}
                    </td>
                    <td style={{
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      borderRight: '1px solid #e5e5e5'
                    }}>
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.25rem'
                      }}>
                        {user.roles.map((role, index) => {
                          const roleColors: Record<string, { bg: string; text: string }> = {
                            'Editor': { bg: '#e9d5ff', text: '#6b21a8' },
                            'Author': { bg: '#dbeafe', text: '#1e40af' },
                            'Reviewer': { bg: '#fed7aa', text: '#9a3412' }
                          };
                          const colors = roleColors[role] || { bg: '#e2e3e5', text: '#383d41' };
                          return (
                            <span
                              key={index}
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.125rem 0.5rem',
                                borderRadius: '4px',
                                backgroundColor: colors.bg,
                                color: colors.text,
                                fontWeight: 600
                              }}
                            >
                              {role}
                            </span>
                          );
                        })}
                      </div>
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
                        backgroundColor: user.status === 'Active' ? '#d4edda' : user.status === 'Inactive' ? '#e2e3e5' : '#f8d7da',
                        color: user.status === 'Active' ? '#155724' : user.status === 'Inactive' ? '#383d41' : '#721c24',
                        fontWeight: 600
                      }}>
                        {user.status}
                      </span>
                    </td>
                    <td style={{
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      color: '#333',
                      borderRight: '1px solid #e5e5e5'
                    }}>
                      {user.last_login}
                    </td>
                    <td style={{
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      color: '#333',
                      borderRight: '1px solid #e5e5e5'
                    }}>
                      {user.date_registered}
                    </td>
                    <td style={{
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      borderRight: '1px solid #e5e5e5'
                    }}>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#666',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.125rem'
                      }}>
                        <div>Submissions: {user.submissions}</div>
                        <div>Reviews: {user.reviews}</div>
                      </div>
                    </td>
                    <td style={{
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        gap: '0.5rem'
                      }}>
                        <button
                          type="button"
                          title="Send Email"
                          style={{
                            padding: '0.25rem',
                            backgroundColor: 'transparent',
                            border: '1px solid #dee2e6',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: '#006798',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Mail style={{ width: '1rem', height: '1rem' }} />
                        </button>
                        <button
                          type="button"
                          title="Enable User"
                          style={{
                            padding: '0.25rem',
                            backgroundColor: 'transparent',
                            border: '1px solid #dee2e6',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: '#00B24E',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <UserCheck style={{ width: '1rem', height: '1rem' }} />
                        </button>
                        <button
                          type="button"
                          title="Disable User"
                          style={{
                            padding: '0.25rem',
                            backgroundColor: 'transparent',
                            border: '1px solid #dee2e6',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: '#d32f2f',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <UserX style={{ width: '1rem', height: '1rem' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default withAuth(AdminUsers, 'admin')

            color: '#002C40',
            marginBottom: '0.25rem'
          }}>
            {users.length}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#666',
            margin: 0
          }}>
            {users.filter(u => u.status === 'Active').length} active
          </p>
        </div>
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.25rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#002C40',
              margin: 0
            }}>
              Editors
            </h3>
            <span style={{
              fontSize: '0.75rem',
              padding: '0.125rem 0.5rem',
              borderRadius: '4px',
              backgroundColor: '#e9d5ff',
              color: '#6b21a8',
              fontWeight: 600
            }}>
              ED
            </span>
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#7c3aed',
            marginBottom: '0.25rem'
          }}>
            {users.filter(u => u.roles.includes('Editor')).length}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#666',
            margin: 0
          }}>
            Active editors
          </p>
        </div>
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.25rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#002C40',
              margin: 0
            }}>
              Authors
            </h3>
            <span style={{
              fontSize: '0.75rem',
              padding: '0.125rem 0.5rem',
              borderRadius: '4px',
              backgroundColor: '#dbeafe',
              color: '#1e40af',
              fontWeight: 600
            }}>
              AU
            </span>
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#3b82f6',
            marginBottom: '0.25rem'
          }}>
            {users.filter(u => u.roles.includes('Author')).length}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#666',
            margin: 0
          }}>
            Active authors
          </p>
        </div>
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.25rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#002C40',
              margin: 0
            }}>
              Reviewers
            </h3>
            <span style={{
              fontSize: '0.75rem',
              padding: '0.125rem 0.5rem',
              borderRadius: '4px',
              backgroundColor: '#fed7aa',
              color: '#9a3412',
              fontWeight: 600
            }}>
              RV
            </span>
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#ea580c',
            marginBottom: '0.25rem'
          }}>
            {users.filter(u => u.roles.includes('Reviewer')).length}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#666',
            margin: 0
          }}>
            Active reviewers
          </p>
        </div>
      </div>

      {/* Users Table */}
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
            User List ({filteredUsers.length} users)
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
                  User
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  Email
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  Roles
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
                  Last Login
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  Registered
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  Activity
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
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{
                    padding: '2rem',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    color: '#666',
                    fontStyle: 'italic'
                  }}>
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} style={{
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
                          {user.full_name}
                        </div>
                        <div style={{
                          fontSize: '0.875rem',
                          color: '#666'
                        }}>
                          @{user.username}
                        </div>
                      </div>
                    </td>
                    <td style={{
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      color: '#333',
                      borderRight: '1px solid #e5e5e5',
                      maxWidth: '250px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {user.email}
                    </td>
                    <td style={{
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      borderRight: '1px solid #e5e5e5'
                    }}>
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.25rem'
                      }}>
                        {user.roles.map((role, index) => {
                          const roleColors: Record<string, { bg: string; text: string }> = {
                            'Editor': { bg: '#e9d5ff', text: '#6b21a8' },
                            'Author': { bg: '#dbeafe', text: '#1e40af' },
                            'Reviewer': { bg: '#fed7aa', text: '#9a3412' }
                          };
                          const colors = roleColors[role] || { bg: '#e2e3e5', text: '#383d41' };
                          return (
                            <span
                              key={index}
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.125rem 0.5rem',
                                borderRadius: '4px',
                                backgroundColor: colors.bg,
                                color: colors.text,
                                fontWeight: 600
                              }}
                            >
                              {role}
                            </span>
                          );
                        })}
                      </div>
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
                        backgroundColor: user.status === 'Active' ? '#d4edda' : user.status === 'Inactive' ? '#e2e3e5' : '#f8d7da',
                        color: user.status === 'Active' ? '#155724' : user.status === 'Inactive' ? '#383d41' : '#721c24',
                        fontWeight: 600
                      }}>
                        {user.status}
                      </span>
                    </td>
                    <td style={{
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      color: '#333',
                      borderRight: '1px solid #e5e5e5'
                    }}>
                      {user.last_login}
                    </td>
                    <td style={{
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      color: '#333',
                      borderRight: '1px solid #e5e5e5'
                    }}>
                      {user.date_registered}
                    </td>
                    <td style={{
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      borderRight: '1px solid #e5e5e5'
                    }}>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#666',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.125rem'
                      }}>
                        <div>Submissions: {user.submissions}</div>
                        <div>Reviews: {user.reviews}</div>
                      </div>
                    </td>
                    <td style={{
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        gap: '0.5rem'
                      }}>
                        <button
                          type="button"
                          title="Send Email"
                          style={{
                            padding: '0.25rem',
                            backgroundColor: 'transparent',
                            border: '1px solid #dee2e6',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: '#006798',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Mail style={{ width: '1rem', height: '1rem' }} />
                        </button>
                        <button
                          type="button"
                          title="Enable User"
                          style={{
                            padding: '0.25rem',
                            backgroundColor: 'transparent',
                            border: '1px solid #dee2e6',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: '#00B24E',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <UserCheck style={{ width: '1rem', height: '1rem' }} />
                        </button>
                        <button
                          type="button"
                          title="Disable User"
                          style={{
                            padding: '0.25rem',
                            backgroundColor: 'transparent',
                            border: '1px solid #dee2e6',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: '#d32f2f',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <UserX style={{ width: '1rem', height: '1rem' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default withAuth(AdminUsers, 'admin')

            color: '#002C40',
            marginBottom: '0.25rem'
          }}>
            {users.length}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#666',
            margin: 0
          }}>
            {users.filter(u => u.status === 'Active').length} active
          </p>
        </div>
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.25rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#002C40',
              margin: 0
            }}>
              Editors
            </h3>
            <span style={{
              fontSize: '0.75rem',
              padding: '0.125rem 0.5rem',
              borderRadius: '4px',
              backgroundColor: '#e9d5ff',
              color: '#6b21a8',
              fontWeight: 600
            }}>
              ED
            </span>
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#7c3aed',
            marginBottom: '0.25rem'
          }}>
            {users.filter(u => u.roles.includes('Editor')).length}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#666',
            margin: 0
          }}>
            Active editors
          </p>
        </div>
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.25rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#002C40',
              margin: 0
            }}>
              Authors
            </h3>
            <span style={{
              fontSize: '0.75rem',
              padding: '0.125rem 0.5rem',
              borderRadius: '4px',
              backgroundColor: '#dbeafe',
              color: '#1e40af',
              fontWeight: 600
            }}>
              AU
            </span>
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#3b82f6',
            marginBottom: '0.25rem'
          }}>
            {users.filter(u => u.roles.includes('Author')).length}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#666',
            margin: 0
          }}>
            Active authors
          </p>
        </div>
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.25rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#002C40',
              margin: 0
            }}>
              Reviewers
            </h3>
            <span style={{
              fontSize: '0.75rem',
              padding: '0.125rem 0.5rem',
              borderRadius: '4px',
              backgroundColor: '#fed7aa',
              color: '#9a3412',
              fontWeight: 600
            }}>
              RV
            </span>
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#ea580c',
            marginBottom: '0.25rem'
          }}>
            {users.filter(u => u.roles.includes('Reviewer')).length}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#666',
            margin: 0
          }}>
            Active reviewers
          </p>
        </div>
      </div>

      {/* Users Table */}
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
            User List ({filteredUsers.length} users)
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
                  User
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  Email
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  Roles
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
                  Last Login
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  Registered
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  Activity
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
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{
                    padding: '2rem',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    color: '#666',
                    fontStyle: 'italic'
                  }}>
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} style={{
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
                          {user.full_name}
                        </div>
                        <div style={{
                          fontSize: '0.875rem',
                          color: '#666'
                        }}>
                          @{user.username}
                        </div>
                      </div>
                    </td>
                    <td style={{
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      color: '#333',
                      borderRight: '1px solid #e5e5e5',
                      maxWidth: '250px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {user.email}
                    </td>
                    <td style={{
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      borderRight: '1px solid #e5e5e5'
                    }}>
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.25rem'
                      }}>
                        {user.roles.map((role, index) => {
                          const roleColors: Record<string, { bg: string; text: string }> = {
                            'Editor': { bg: '#e9d5ff', text: '#6b21a8' },
                            'Author': { bg: '#dbeafe', text: '#1e40af' },
                            'Reviewer': { bg: '#fed7aa', text: '#9a3412' }
                          };
                          const colors = roleColors[role] || { bg: '#e2e3e5', text: '#383d41' };
                          return (
                            <span
                              key={index}
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.125rem 0.5rem',
                                borderRadius: '4px',
                                backgroundColor: colors.bg,
                                color: colors.text,
                                fontWeight: 600
                              }}
                            >
                              {role}
                            </span>
                          );
                        })}
                      </div>
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
                        backgroundColor: user.status === 'Active' ? '#d4edda' : user.status === 'Inactive' ? '#e2e3e5' : '#f8d7da',
                        color: user.status === 'Active' ? '#155724' : user.status === 'Inactive' ? '#383d41' : '#721c24',
                        fontWeight: 600
                      }}>
                        {user.status}
                      </span>
                    </td>
                    <td style={{
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      color: '#333',
                      borderRight: '1px solid #e5e5e5'
                    }}>
                      {user.last_login}
                    </td>
                    <td style={{
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      color: '#333',
                      borderRight: '1px solid #e5e5e5'
                    }}>
                      {user.date_registered}
                    </td>
                    <td style={{
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      borderRight: '1px solid #e5e5e5'
                    }}>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#666',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.125rem'
                      }}>
                        <div>Submissions: {user.submissions}</div>
                        <div>Reviews: {user.reviews}</div>
                      </div>
                    </td>
                    <td style={{
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        gap: '0.5rem'
                      }}>
                        <button
                          type="button"
                          title="Send Email"
                          style={{
                            padding: '0.25rem',
                            backgroundColor: 'transparent',
                            border: '1px solid #dee2e6',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: '#006798',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Mail style={{ width: '1rem', height: '1rem' }} />
                        </button>
                        <button
                          type="button"
                          title="Enable User"
                          style={{
                            padding: '0.25rem',
                            backgroundColor: 'transparent',
                            border: '1px solid #dee2e6',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: '#00B24E',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <UserCheck style={{ width: '1rem', height: '1rem' }} />
                        </button>
                        <button
                          type="button"
                          title="Disable User"
                          style={{
                            padding: '0.25rem',
                            backgroundColor: 'transparent',
                            border: '1px solid #dee2e6',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: '#d32f2f',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <UserX style={{ width: '1rem', height: '1rem' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default withAuth(AdminUsers, 'admin')

            color: '#002C40',
            marginBottom: '0.25rem'
          }}>
            {users.length}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#666',
            margin: 0
          }}>
            {users.filter(u => u.status === 'Active').length} active
          </p>
        </div>
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.25rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#002C40',
              margin: 0
            }}>
              Editors
            </h3>
            <span style={{
              fontSize: '0.75rem',
              padding: '0.125rem 0.5rem',
              borderRadius: '4px',
              backgroundColor: '#e9d5ff',
              color: '#6b21a8',
              fontWeight: 600
            }}>
              ED
            </span>
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#7c3aed',
            marginBottom: '0.25rem'
          }}>
            {users.filter(u => u.roles.includes('Editor')).length}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#666',
            margin: 0
          }}>
            Active editors
          </p>
        </div>
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.25rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#002C40',
              margin: 0
            }}>
              Authors
            </h3>
            <span style={{
              fontSize: '0.75rem',
              padding: '0.125rem 0.5rem',
              borderRadius: '4px',
              backgroundColor: '#dbeafe',
              color: '#1e40af',
              fontWeight: 600
            }}>
              AU
            </span>
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#3b82f6',
            marginBottom: '0.25rem'
          }}>
            {users.filter(u => u.roles.includes('Author')).length}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#666',
            margin: 0
          }}>
            Active authors
          </p>
        </div>
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '1.25rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.75rem'
          }}>
            <h3 style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#002C40',
              margin: 0
            }}>
              Reviewers
            </h3>
            <span style={{
              fontSize: '0.75rem',
              padding: '0.125rem 0.5rem',
              borderRadius: '4px',
              backgroundColor: '#fed7aa',
              color: '#9a3412',
              fontWeight: 600
            }}>
              RV
            </span>
          </div>
          <div style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: '#ea580c',
            marginBottom: '0.25rem'
          }}>
            {users.filter(u => u.roles.includes('Reviewer')).length}
          </div>
          <p style={{
            fontSize: '0.75rem',
            color: '#666',
            margin: 0
          }}>
            Active reviewers
          </p>
        </div>
      </div>

      {/* Users Table */}
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
            User List ({filteredUsers.length} users)
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
                  User
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  Email
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  Roles
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
                  Last Login
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  Registered
                </th>
                <th style={{
                  padding: '0.75rem 1rem',
                  textAlign: 'left',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: '#002C40',
                  borderRight: '1px solid #e5e5e5'
                }}>
                  Activity
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
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{
                    padding: '2rem',
                    textAlign: 'center',
                    fontSize: '0.875rem',
                    color: '#666',
                    fontStyle: 'italic'
                  }}>
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} style={{
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
                          {user.full_name}
                        </div>
                        <div style={{
                          fontSize: '0.875rem',
                          color: '#666'
                        }}>
                          @{user.username}
                        </div>
                      </div>
                    </td>
                    <td style={{
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      color: '#333',
                      borderRight: '1px solid #e5e5e5',
                      maxWidth: '250px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {user.email}
                    </td>
                    <td style={{
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      borderRight: '1px solid #e5e5e5'
                    }}>
                      <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '0.25rem'
                      }}>
                        {user.roles.map((role, index) => {
                          const roleColors: Record<string, { bg: string; text: string }> = {
                            'Editor': { bg: '#e9d5ff', text: '#6b21a8' },
                            'Author': { bg: '#dbeafe', text: '#1e40af' },
                            'Reviewer': { bg: '#fed7aa', text: '#9a3412' }
                          };
                          const colors = roleColors[role] || { bg: '#e2e3e5', text: '#383d41' };
                          return (
                            <span
                              key={index}
                              style={{
                                fontSize: '0.75rem',
                                padding: '0.125rem 0.5rem',
                                borderRadius: '4px',
                                backgroundColor: colors.bg,
                                color: colors.text,
                                fontWeight: 600
                              }}
                            >
                              {role}
                            </span>
                          );
                        })}
                      </div>
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
                        backgroundColor: user.status === 'Active' ? '#d4edda' : user.status === 'Inactive' ? '#e2e3e5' : '#f8d7da',
                        color: user.status === 'Active' ? '#155724' : user.status === 'Inactive' ? '#383d41' : '#721c24',
                        fontWeight: 600
                      }}>
                        {user.status}
                      </span>
                    </td>
                    <td style={{
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      color: '#333',
                      borderRight: '1px solid #e5e5e5'
                    }}>
                      {user.last_login}
                    </td>
                    <td style={{
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      color: '#333',
                      borderRight: '1px solid #e5e5e5'
                    }}>
                      {user.date_registered}
                    </td>
                    <td style={{
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      borderRight: '1px solid #e5e5e5'
                    }}>
                      <div style={{
                        fontSize: '0.75rem',
                        color: '#666',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.125rem'
                      }}>
                        <div>Submissions: {user.submissions}</div>
                        <div>Reviews: {user.reviews}</div>
                      </div>
                    </td>
                    <td style={{
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem'
                    }}>
                      <div style={{
                        display: 'flex',
                        gap: '0.5rem'
                      }}>
                        <button
                          type="button"
                          title="Send Email"
                          style={{
                            padding: '0.25rem',
                            backgroundColor: 'transparent',
                            border: '1px solid #dee2e6',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: '#006798',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Mail style={{ width: '1rem', height: '1rem' }} />
                        </button>
                        <button
                          type="button"
                          title="Enable User"
                          style={{
                            padding: '0.25rem',
                            backgroundColor: 'transparent',
                            border: '1px solid #dee2e6',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: '#00B24E',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <UserCheck style={{ width: '1rem', height: '1rem' }} />
                        </button>
                        <button
                          type="button"
                          title="Disable User"
                          style={{
                            padding: '0.25rem',
                            backgroundColor: 'transparent',
                            border: '1px solid #dee2e6',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: '#d32f2f',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <UserX style={{ width: '1rem', height: '1rem' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default withAuth(AdminUsers, 'admin')
