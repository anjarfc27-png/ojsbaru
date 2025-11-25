"use client";

import { useState, useMemo } from "react";
import { Search, Plus, Edit, Trash2, Mail, UserCheck, UserX, Filter } from "lucide-react";

type User = {
  id: string;
  email: string;
  name: string;
  roles: string[];
  status: string;
  registeredAt: string | null;
  lastLogin: string | null;
};

type Role = {
  id: string;
  role_path: string;
  name: string | null;
};

type Props = {
  users: User[];
  roles: Role[];
};

export function UsersManagementClient({ users: initialUsers, roles }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === "all" || user.roles.includes(roleFilter);

      const matchesStatus = statusFilter === "all" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, { bgColor: string; textColor: string; borderColor: string }> = {
      manager: { bgColor: '#006798', textColor: '#ffffff', borderColor: '#006798' },
      editor: { bgColor: '#006798', textColor: '#ffffff', borderColor: '#006798' },
      section_editor: { bgColor: '#e2e3e5', textColor: '#383d41', borderColor: '#d6d8db' },
      reviewer: { bgColor: 'transparent', textColor: '#383d41', borderColor: '#dee2e6' },
      author: { bgColor: 'transparent', textColor: '#383d41', borderColor: '#dee2e6' },
      copyeditor: { bgColor: '#e2e3e5', textColor: '#383d41', borderColor: '#d6d8db' },
      layout_editor: { bgColor: '#e2e3e5', textColor: '#383d41', borderColor: '#d6d8db' },
      proofreader: { bgColor: '#e2e3e5', textColor: '#383d41', borderColor: '#d6d8db' },
    };
    const config = roleColors[role] || { bgColor: 'transparent', textColor: '#383d41', borderColor: '#dee2e6' };
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
        borderRadius: '0.25rem',
        marginRight: '0.25rem',
        marginBottom: '0.25rem'
      }}>
        {role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
      </span>
    );
  };

  const handleAddUser = () => {
    // TODO: Open add user modal
    console.log("Add user");
  };

  const handleEditUser = (user: User) => {
    // TODO: Open edit user modal
    console.log("Edit user:", user);
  };

  const handleDeleteUser = (user: User) => {
    if (confirm(`Are you sure you want to delete user ${user.name}?`)) {
      // TODO: Implement delete user
      console.log("Delete user:", user);
    }
  };

  const handleSendEmail = (user: User) => {
    // TODO: Open send email modal
    console.log("Send email to:", user);
  };

  const handleToggleStatus = (user: User) => {
    // TODO: Implement toggle status
    setUsers(
      users.map((u) =>
        u.id === user.id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u
      )
    );
  };

  const uniqueRoles = useMemo(() => {
    const allRoles = new Set<string>();
    users.forEach((user) => {
      user.roles.forEach((role) => allRoles.add(role));
    });
    return Array.from(allRoles).sort();
  }, [users]);

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
            Users & Roles
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: '#666',
            margin: 0
          }}>
            Manage journal users and their roles
          </p>
        </div>
        <button
          onClick={handleAddUser}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            backgroundColor: '#006798',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#005687';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#006798';
          }}
        >
          <Plus style={{ height: '1rem', width: '1rem' }} />
          <span>Add User</span>
        </button>
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
                placeholder="Search by name or email..."
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
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{
                  width: '180px',
                  padding: '0.5rem 0.75rem 0.5rem 2.5rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Roles</option>
                {uniqueRoles.map((role) => (
                  <option key={role} value={role}>
                    {role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table - OJS PKP 3.3 Style */}
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
            Users ({filteredUsers.length})
          </h2>
        </div>
        <div>
          {filteredUsers.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#6b7280'
            }}>
              <p style={{ margin: 0 }}>No users found</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                    <th style={{
                      textAlign: 'left',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151'
                    }}>
                      Name
                    </th>
                    <th style={{
                      textAlign: 'left',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151'
                    }}>
                      Email
                    </th>
                    <th style={{
                      textAlign: 'left',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151'
                    }}>
                      Roles
                    </th>
                    <th style={{
                      textAlign: 'left',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151'
                    }}>
                      Status
                    </th>
                    <th style={{
                      textAlign: 'left',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151'
                    }}>
                      Registered
                    </th>
                    <th style={{
                      textAlign: 'left',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151'
                    }}>
                      Last Login
                    </th>
                    <th style={{
                      textAlign: 'right',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151'
                    }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom: '1px solid #f3f4f6',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{
                          fontWeight: 500,
                          color: '#111827'
                        }}>
                          {user.name || "N/A"}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{
                          fontSize: '0.875rem',
                          color: '#4b5563'
                        }}>
                          {user.email}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.25rem'
                        }}>
                          {user.roles.length > 0 ? (
                            user.roles.map((role) => (
                              <span key={role}>
                                {getRoleBadge(role)}
                              </span>
                            ))
                          ) : (
                            <span style={{
                              fontSize: '0.75rem',
                              color: '#9ca3af'
                            }}>
                              No roles
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: user.status === "active" ? '#d4edda' : '#e2e3e5',
                          color: user.status === "active" ? '#155724' : '#383d41',
                          border: `1px solid ${user.status === "active" ? '#c3e6cb' : '#d6d8db'}`,
                          borderRadius: '0.25rem'
                        }}>
                          {user.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{
                          fontSize: '0.875rem',
                          color: '#4b5563'
                        }}>
                          {formatDate(user.registeredAt)}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{
                          fontSize: '0.875rem',
                          color: '#4b5563'
                        }}>
                          {formatDate(user.lastLogin)}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <button
                            onClick={() => handleEditUser(user)}
                            style={{
                              height: '2rem',
                              width: '2rem',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'transparent',
                              border: '1px solid transparent',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              color: '#4b5563'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f3f4f6';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <Edit style={{ height: '1rem', width: '1rem' }} />
                          </button>
                          <button
                            onClick={() => handleSendEmail(user)}
                            style={{
                              height: '2rem',
                              width: '2rem',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'transparent',
                              border: '1px solid transparent',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              color: '#4b5563'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f3f4f6';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <Mail style={{ height: '1rem', width: '1rem' }} />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user)}
                            style={{
                              height: '2rem',
                              width: '2rem',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'transparent',
                              border: '1px solid transparent',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              color: user.status === "active" ? '#dc2626' : '#16a34a'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f3f4f6';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            {user.status === "active" ? (
                              <UserX style={{ height: '1rem', width: '1rem' }} />
                            ) : (
                              <UserCheck style={{ height: '1rem', width: '1rem' }} />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            style={{
                              height: '2rem',
                              width: '2rem',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'transparent',
                              border: '1px solid transparent',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              color: '#dc2626'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#fee2e2';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <Trash2 style={{ height: '1rem', width: '1rem' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




import { useState, useMemo } from "react";
import { Search, Plus, Edit, Trash2, Mail, UserCheck, UserX, Filter } from "lucide-react";

type User = {
  id: string;
  email: string;
  name: string;
  roles: string[];
  status: string;
  registeredAt: string | null;
  lastLogin: string | null;
};

type Role = {
  id: string;
  role_path: string;
  name: string | null;
};

type Props = {
  users: User[];
  roles: Role[];
};

export function UsersManagementClient({ users: initialUsers, roles }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === "all" || user.roles.includes(roleFilter);

      const matchesStatus = statusFilter === "all" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, { bgColor: string; textColor: string; borderColor: string }> = {
      manager: { bgColor: '#006798', textColor: '#ffffff', borderColor: '#006798' },
      editor: { bgColor: '#006798', textColor: '#ffffff', borderColor: '#006798' },
      section_editor: { bgColor: '#e2e3e5', textColor: '#383d41', borderColor: '#d6d8db' },
      reviewer: { bgColor: 'transparent', textColor: '#383d41', borderColor: '#dee2e6' },
      author: { bgColor: 'transparent', textColor: '#383d41', borderColor: '#dee2e6' },
      copyeditor: { bgColor: '#e2e3e5', textColor: '#383d41', borderColor: '#d6d8db' },
      layout_editor: { bgColor: '#e2e3e5', textColor: '#383d41', borderColor: '#d6d8db' },
      proofreader: { bgColor: '#e2e3e5', textColor: '#383d41', borderColor: '#d6d8db' },
    };
    const config = roleColors[role] || { bgColor: 'transparent', textColor: '#383d41', borderColor: '#dee2e6' };
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
        borderRadius: '0.25rem',
        marginRight: '0.25rem',
        marginBottom: '0.25rem'
      }}>
        {role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
      </span>
    );
  };

  const handleAddUser = () => {
    // TODO: Open add user modal
    console.log("Add user");
  };

  const handleEditUser = (user: User) => {
    // TODO: Open edit user modal
    console.log("Edit user:", user);
  };

  const handleDeleteUser = (user: User) => {
    if (confirm(`Are you sure you want to delete user ${user.name}?`)) {
      // TODO: Implement delete user
      console.log("Delete user:", user);
    }
  };

  const handleSendEmail = (user: User) => {
    // TODO: Open send email modal
    console.log("Send email to:", user);
  };

  const handleToggleStatus = (user: User) => {
    // TODO: Implement toggle status
    setUsers(
      users.map((u) =>
        u.id === user.id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u
      )
    );
  };

  const uniqueRoles = useMemo(() => {
    const allRoles = new Set<string>();
    users.forEach((user) => {
      user.roles.forEach((role) => allRoles.add(role));
    });
    return Array.from(allRoles).sort();
  }, [users]);

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
            Users & Roles
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: '#666',
            margin: 0
          }}>
            Manage journal users and their roles
          </p>
        </div>
        <button
          onClick={handleAddUser}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            backgroundColor: '#006798',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#005687';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#006798';
          }}
        >
          <Plus style={{ height: '1rem', width: '1rem' }} />
          <span>Add User</span>
        </button>
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
                placeholder="Search by name or email..."
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
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{
                  width: '180px',
                  padding: '0.5rem 0.75rem 0.5rem 2.5rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Roles</option>
                {uniqueRoles.map((role) => (
                  <option key={role} value={role}>
                    {role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table - OJS PKP 3.3 Style */}
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
            Users ({filteredUsers.length})
          </h2>
        </div>
        <div>
          {filteredUsers.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#6b7280'
            }}>
              <p style={{ margin: 0 }}>No users found</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                    <th style={{
                      textAlign: 'left',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151'
                    }}>
                      Name
                    </th>
                    <th style={{
                      textAlign: 'left',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151'
                    }}>
                      Email
                    </th>
                    <th style={{
                      textAlign: 'left',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151'
                    }}>
                      Roles
                    </th>
                    <th style={{
                      textAlign: 'left',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151'
                    }}>
                      Status
                    </th>
                    <th style={{
                      textAlign: 'left',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151'
                    }}>
                      Registered
                    </th>
                    <th style={{
                      textAlign: 'left',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151'
                    }}>
                      Last Login
                    </th>
                    <th style={{
                      textAlign: 'right',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151'
                    }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom: '1px solid #f3f4f6',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{
                          fontWeight: 500,
                          color: '#111827'
                        }}>
                          {user.name || "N/A"}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{
                          fontSize: '0.875rem',
                          color: '#4b5563'
                        }}>
                          {user.email}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.25rem'
                        }}>
                          {user.roles.length > 0 ? (
                            user.roles.map((role) => (
                              <span key={role}>
                                {getRoleBadge(role)}
                              </span>
                            ))
                          ) : (
                            <span style={{
                              fontSize: '0.75rem',
                              color: '#9ca3af'
                            }}>
                              No roles
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: user.status === "active" ? '#d4edda' : '#e2e3e5',
                          color: user.status === "active" ? '#155724' : '#383d41',
                          border: `1px solid ${user.status === "active" ? '#c3e6cb' : '#d6d8db'}`,
                          borderRadius: '0.25rem'
                        }}>
                          {user.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{
                          fontSize: '0.875rem',
                          color: '#4b5563'
                        }}>
                          {formatDate(user.registeredAt)}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{
                          fontSize: '0.875rem',
                          color: '#4b5563'
                        }}>
                          {formatDate(user.lastLogin)}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <button
                            onClick={() => handleEditUser(user)}
                            style={{
                              height: '2rem',
                              width: '2rem',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'transparent',
                              border: '1px solid transparent',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              color: '#4b5563'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f3f4f6';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <Edit style={{ height: '1rem', width: '1rem' }} />
                          </button>
                          <button
                            onClick={() => handleSendEmail(user)}
                            style={{
                              height: '2rem',
                              width: '2rem',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'transparent',
                              border: '1px solid transparent',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              color: '#4b5563'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f3f4f6';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <Mail style={{ height: '1rem', width: '1rem' }} />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user)}
                            style={{
                              height: '2rem',
                              width: '2rem',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'transparent',
                              border: '1px solid transparent',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              color: user.status === "active" ? '#dc2626' : '#16a34a'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f3f4f6';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            {user.status === "active" ? (
                              <UserX style={{ height: '1rem', width: '1rem' }} />
                            ) : (
                              <UserCheck style={{ height: '1rem', width: '1rem' }} />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            style={{
                              height: '2rem',
                              width: '2rem',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'transparent',
                              border: '1px solid transparent',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              color: '#dc2626'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#fee2e2';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <Trash2 style={{ height: '1rem', width: '1rem' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




import { useState, useMemo } from "react";
import { Search, Plus, Edit, Trash2, Mail, UserCheck, UserX, Filter } from "lucide-react";

type User = {
  id: string;
  email: string;
  name: string;
  roles: string[];
  status: string;
  registeredAt: string | null;
  lastLogin: string | null;
};

type Role = {
  id: string;
  role_path: string;
  name: string | null;
};

type Props = {
  users: User[];
  roles: Role[];
};

export function UsersManagementClient({ users: initialUsers, roles }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === "all" || user.roles.includes(roleFilter);

      const matchesStatus = statusFilter === "all" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, { bgColor: string; textColor: string; borderColor: string }> = {
      manager: { bgColor: '#006798', textColor: '#ffffff', borderColor: '#006798' },
      editor: { bgColor: '#006798', textColor: '#ffffff', borderColor: '#006798' },
      section_editor: { bgColor: '#e2e3e5', textColor: '#383d41', borderColor: '#d6d8db' },
      reviewer: { bgColor: 'transparent', textColor: '#383d41', borderColor: '#dee2e6' },
      author: { bgColor: 'transparent', textColor: '#383d41', borderColor: '#dee2e6' },
      copyeditor: { bgColor: '#e2e3e5', textColor: '#383d41', borderColor: '#d6d8db' },
      layout_editor: { bgColor: '#e2e3e5', textColor: '#383d41', borderColor: '#d6d8db' },
      proofreader: { bgColor: '#e2e3e5', textColor: '#383d41', borderColor: '#d6d8db' },
    };
    const config = roleColors[role] || { bgColor: 'transparent', textColor: '#383d41', borderColor: '#dee2e6' };
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
        borderRadius: '0.25rem',
        marginRight: '0.25rem',
        marginBottom: '0.25rem'
      }}>
        {role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
      </span>
    );
  };

  const handleAddUser = () => {
    // TODO: Open add user modal
    console.log("Add user");
  };

  const handleEditUser = (user: User) => {
    // TODO: Open edit user modal
    console.log("Edit user:", user);
  };

  const handleDeleteUser = (user: User) => {
    if (confirm(`Are you sure you want to delete user ${user.name}?`)) {
      // TODO: Implement delete user
      console.log("Delete user:", user);
    }
  };

  const handleSendEmail = (user: User) => {
    // TODO: Open send email modal
    console.log("Send email to:", user);
  };

  const handleToggleStatus = (user: User) => {
    // TODO: Implement toggle status
    setUsers(
      users.map((u) =>
        u.id === user.id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u
      )
    );
  };

  const uniqueRoles = useMemo(() => {
    const allRoles = new Set<string>();
    users.forEach((user) => {
      user.roles.forEach((role) => allRoles.add(role));
    });
    return Array.from(allRoles).sort();
  }, [users]);

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
            Users & Roles
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: '#666',
            margin: 0
          }}>
            Manage journal users and their roles
          </p>
        </div>
        <button
          onClick={handleAddUser}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            backgroundColor: '#006798',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#005687';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#006798';
          }}
        >
          <Plus style={{ height: '1rem', width: '1rem' }} />
          <span>Add User</span>
        </button>
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
                placeholder="Search by name or email..."
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
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{
                  width: '180px',
                  padding: '0.5rem 0.75rem 0.5rem 2.5rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Roles</option>
                {uniqueRoles.map((role) => (
                  <option key={role} value={role}>
                    {role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table - OJS PKP 3.3 Style */}
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
            Users ({filteredUsers.length})
          </h2>
        </div>
        <div>
          {filteredUsers.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#6b7280'
            }}>
              <p style={{ margin: 0 }}>No users found</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                    <th style={{
                      textAlign: 'left',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151'
                    }}>
                      Name
                    </th>
                    <th style={{
                      textAlign: 'left',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151'
                    }}>
                      Email
                    </th>
                    <th style={{
                      textAlign: 'left',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151'
                    }}>
                      Roles
                    </th>
                    <th style={{
                      textAlign: 'left',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151'
                    }}>
                      Status
                    </th>
                    <th style={{
                      textAlign: 'left',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151'
                    }}>
                      Registered
                    </th>
                    <th style={{
                      textAlign: 'left',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151'
                    }}>
                      Last Login
                    </th>
                    <th style={{
                      textAlign: 'right',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151'
                    }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom: '1px solid #f3f4f6',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{
                          fontWeight: 500,
                          color: '#111827'
                        }}>
                          {user.name || "N/A"}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{
                          fontSize: '0.875rem',
                          color: '#4b5563'
                        }}>
                          {user.email}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.25rem'
                        }}>
                          {user.roles.length > 0 ? (
                            user.roles.map((role) => (
                              <span key={role}>
                                {getRoleBadge(role)}
                              </span>
                            ))
                          ) : (
                            <span style={{
                              fontSize: '0.75rem',
                              color: '#9ca3af'
                            }}>
                              No roles
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: user.status === "active" ? '#d4edda' : '#e2e3e5',
                          color: user.status === "active" ? '#155724' : '#383d41',
                          border: `1px solid ${user.status === "active" ? '#c3e6cb' : '#d6d8db'}`,
                          borderRadius: '0.25rem'
                        }}>
                          {user.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{
                          fontSize: '0.875rem',
                          color: '#4b5563'
                        }}>
                          {formatDate(user.registeredAt)}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{
                          fontSize: '0.875rem',
                          color: '#4b5563'
                        }}>
                          {formatDate(user.lastLogin)}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <button
                            onClick={() => handleEditUser(user)}
                            style={{
                              height: '2rem',
                              width: '2rem',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'transparent',
                              border: '1px solid transparent',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              color: '#4b5563'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f3f4f6';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <Edit style={{ height: '1rem', width: '1rem' }} />
                          </button>
                          <button
                            onClick={() => handleSendEmail(user)}
                            style={{
                              height: '2rem',
                              width: '2rem',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'transparent',
                              border: '1px solid transparent',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              color: '#4b5563'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f3f4f6';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <Mail style={{ height: '1rem', width: '1rem' }} />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user)}
                            style={{
                              height: '2rem',
                              width: '2rem',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'transparent',
                              border: '1px solid transparent',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              color: user.status === "active" ? '#dc2626' : '#16a34a'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f3f4f6';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            {user.status === "active" ? (
                              <UserX style={{ height: '1rem', width: '1rem' }} />
                            ) : (
                              <UserCheck style={{ height: '1rem', width: '1rem' }} />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            style={{
                              height: '2rem',
                              width: '2rem',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'transparent',
                              border: '1px solid transparent',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              color: '#dc2626'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#fee2e2';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <Trash2 style={{ height: '1rem', width: '1rem' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




import { useState, useMemo } from "react";
import { Search, Plus, Edit, Trash2, Mail, UserCheck, UserX, Filter } from "lucide-react";

type User = {
  id: string;
  email: string;
  name: string;
  roles: string[];
  status: string;
  registeredAt: string | null;
  lastLogin: string | null;
};

type Role = {
  id: string;
  role_path: string;
  name: string | null;
};

type Props = {
  users: User[];
  roles: Role[];
};

export function UsersManagementClient({ users: initialUsers, roles }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === "all" || user.roles.includes(roleFilter);

      const matchesStatus = statusFilter === "all" || user.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, { bgColor: string; textColor: string; borderColor: string }> = {
      manager: { bgColor: '#006798', textColor: '#ffffff', borderColor: '#006798' },
      editor: { bgColor: '#006798', textColor: '#ffffff', borderColor: '#006798' },
      section_editor: { bgColor: '#e2e3e5', textColor: '#383d41', borderColor: '#d6d8db' },
      reviewer: { bgColor: 'transparent', textColor: '#383d41', borderColor: '#dee2e6' },
      author: { bgColor: 'transparent', textColor: '#383d41', borderColor: '#dee2e6' },
      copyeditor: { bgColor: '#e2e3e5', textColor: '#383d41', borderColor: '#d6d8db' },
      layout_editor: { bgColor: '#e2e3e5', textColor: '#383d41', borderColor: '#d6d8db' },
      proofreader: { bgColor: '#e2e3e5', textColor: '#383d41', borderColor: '#d6d8db' },
    };
    const config = roleColors[role] || { bgColor: 'transparent', textColor: '#383d41', borderColor: '#dee2e6' };
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
        borderRadius: '0.25rem',
        marginRight: '0.25rem',
        marginBottom: '0.25rem'
      }}>
        {role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
      </span>
    );
  };

  const handleAddUser = () => {
    // TODO: Open add user modal
    console.log("Add user");
  };

  const handleEditUser = (user: User) => {
    // TODO: Open edit user modal
    console.log("Edit user:", user);
  };

  const handleDeleteUser = (user: User) => {
    if (confirm(`Are you sure you want to delete user ${user.name}?`)) {
      // TODO: Implement delete user
      console.log("Delete user:", user);
    }
  };

  const handleSendEmail = (user: User) => {
    // TODO: Open send email modal
    console.log("Send email to:", user);
  };

  const handleToggleStatus = (user: User) => {
    // TODO: Implement toggle status
    setUsers(
      users.map((u) =>
        u.id === user.id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u
      )
    );
  };

  const uniqueRoles = useMemo(() => {
    const allRoles = new Set<string>();
    users.forEach((user) => {
      user.roles.forEach((role) => allRoles.add(role));
    });
    return Array.from(allRoles).sort();
  }, [users]);

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
            Users & Roles
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: '#666',
            margin: 0
          }}>
            Manage journal users and their roles
          </p>
        </div>
        <button
          onClick={handleAddUser}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            backgroundColor: '#006798',
            color: '#ffffff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#005687';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#006798';
          }}
        >
          <Plus style={{ height: '1rem', width: '1rem' }} />
          <span>Add User</span>
        </button>
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
                placeholder="Search by name or email..."
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
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                style={{
                  width: '180px',
                  padding: '0.5rem 0.75rem 0.5rem 2.5rem',
                  border: '1px solid #dee2e6',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Roles</option>
                {uniqueRoles.map((role) => (
                  <option key={role} value={role}>
                    {role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table - OJS PKP 3.3 Style */}
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
            Users ({filteredUsers.length})
          </h2>
        </div>
        <div>
          {filteredUsers.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: '#6b7280'
            }}>
              <p style={{ margin: 0 }}>No users found</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #dee2e6' }}>
                    <th style={{
                      textAlign: 'left',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151'
                    }}>
                      Name
                    </th>
                    <th style={{
                      textAlign: 'left',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151'
                    }}>
                      Email
                    </th>
                    <th style={{
                      textAlign: 'left',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151'
                    }}>
                      Roles
                    </th>
                    <th style={{
                      textAlign: 'left',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151'
                    }}>
                      Status
                    </th>
                    <th style={{
                      textAlign: 'left',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151'
                    }}>
                      Registered
                    </th>
                    <th style={{
                      textAlign: 'left',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151'
                    }}>
                      Last Login
                    </th>
                    <th style={{
                      textAlign: 'right',
                      padding: '0.75rem 1rem',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#374151'
                    }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom: '1px solid #f3f4f6',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{
                          fontWeight: 500,
                          color: '#111827'
                        }}>
                          {user.name || "N/A"}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{
                          fontSize: '0.875rem',
                          color: '#4b5563'
                        }}>
                          {user.email}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '0.25rem'
                        }}>
                          {user.roles.length > 0 ? (
                            user.roles.map((role) => (
                              <span key={role}>
                                {getRoleBadge(role)}
                              </span>
                            ))
                          ) : (
                            <span style={{
                              fontSize: '0.75rem',
                              color: '#9ca3af'
                            }}>
                              No roles
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          backgroundColor: user.status === "active" ? '#d4edda' : '#e2e3e5',
                          color: user.status === "active" ? '#155724' : '#383d41',
                          border: `1px solid ${user.status === "active" ? '#c3e6cb' : '#d6d8db'}`,
                          borderRadius: '0.25rem'
                        }}>
                          {user.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{
                          fontSize: '0.875rem',
                          color: '#4b5563'
                        }}>
                          {formatDate(user.registeredAt)}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{
                          fontSize: '0.875rem',
                          color: '#4b5563'
                        }}>
                          {formatDate(user.lastLogin)}
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'flex-end',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}>
                          <button
                            onClick={() => handleEditUser(user)}
                            style={{
                              height: '2rem',
                              width: '2rem',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'transparent',
                              border: '1px solid transparent',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              color: '#4b5563'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f3f4f6';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <Edit style={{ height: '1rem', width: '1rem' }} />
                          </button>
                          <button
                            onClick={() => handleSendEmail(user)}
                            style={{
                              height: '2rem',
                              width: '2rem',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'transparent',
                              border: '1px solid transparent',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              color: '#4b5563'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f3f4f6';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <Mail style={{ height: '1rem', width: '1rem' }} />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(user)}
                            style={{
                              height: '2rem',
                              width: '2rem',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'transparent',
                              border: '1px solid transparent',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              color: user.status === "active" ? '#dc2626' : '#16a34a'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#f3f4f6';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            {user.status === "active" ? (
                              <UserX style={{ height: '1rem', width: '1rem' }} />
                            ) : (
                              <UserCheck style={{ height: '1rem', width: '1rem' }} />
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            style={{
                              height: '2rem',
                              width: '2rem',
                              padding: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: 'transparent',
                              border: '1px solid transparent',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              color: '#dc2626'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#fee2e2';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            <Trash2 style={{ height: '1rem', width: '1rem' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



