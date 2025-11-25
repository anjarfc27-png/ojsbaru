import { redirect } from "next/navigation";
import { getCurrentUserServer } from "@/lib/auth-server";
import Link from "next/link";
import { Settings as SettingsIcon, Workflow, Globe, Truck, Lock } from "lucide-react";

const settingsCategories = [
  {
    id: "context",
    title: "Journal Settings",
    description: "Configure journal information, contact details, sections, and categories",
    icon: SettingsIcon,
    href: "/manager/settings/context",
  },
  {
    id: "workflow",
    title: "Workflow",
    description: "Configure submission, review, and publication workflow",
    icon: Workflow,
    href: "/manager/settings/workflow",
  },
  {
    id: "website",
    title: "Website",
    description: "Manage website appearance, navigation, and languages",
    icon: Globe,
    href: "/manager/settings/website",
  },
  {
    id: "distribution",
    title: "Distribution",
    description: "Configure indexing, metadata, and access settings",
    icon: Truck,
    href: "/manager/settings/distribution",
  },
  {
    id: "access",
    title: "Access",
    description: "Manage user registration, login, and permissions",
    icon: Lock,
    href: "/manager/settings/access",
  },
];

export default async function ManagerSettingsPage() {
  const user = await getCurrentUserServer();

  if (!user) {
    redirect("/login");
  }

  const hasManagerRole = user.roles?.some((r) => {
    const rolePath = r.role_path?.toLowerCase();
    return rolePath === "manager" || rolePath === "admin";
  });

  if (!hasManagerRole) {
    redirect("/dashboard");
  }

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
          Journal Settings
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: '#666',
          margin: 0
        }}>
          Configure your journal's settings and preferences
        </p>
      </div>

      {/* Settings Categories - OJS PKP 3.3 Style */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem'
      }}>
        {settingsCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Link
              key={category.id}
              href={category.href}
              style={{
                display: 'block',
                height: '100%',
                textDecoration: 'none'
              }}
            >
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                padding: '1.5rem',
                height: '100%',
                transition: 'border-color 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#006798';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#dee2e6';
              }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{
                    padding: '0.5rem',
                    backgroundColor: 'rgba(0, 103, 152, 0.1)',
                    borderRadius: '0.375rem'
                  }}>
                    <Icon style={{ height: '1.5rem', width: '1.5rem', color: '#006798' }} />
                  </div>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#111827',
                    margin: 0
                  }}>
                    {category.title}
                  </h2>
                </div>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  margin: 0,
                  marginTop: '0.5rem'
                }}>
                  {category.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Links - OJS PKP 3.3 Style */}
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
            Quick Links
          </h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '0.75rem'
        }}>
          <Link
            href="/manager/settings/context"
            style={{
              padding: '0.75rem',
              border: '1px solid #dee2e6',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              transition: 'background-color 0.2s',
              display: 'block'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div style={{
              fontWeight: 500,
              color: '#111827',
              fontSize: '0.875rem',
              marginBottom: '0.25rem'
            }}>
              Journal Settings
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#6b7280'
            }}>
              Configure journal information, contact details, sections, and categories
            </div>
          </Link>
          <Link
            href="/manager/settings/workflow"
            style={{
              padding: '0.75rem',
              border: '1px solid #dee2e6',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              transition: 'background-color 0.2s',
              display: 'block'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div style={{
              fontWeight: 500,
              color: '#111827',
              fontSize: '0.875rem',
              marginBottom: '0.25rem'
            }}>
              Workflow Settings
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#6b7280'
            }}>
              Configure submission stages, review process, and publication workflow
            </div>
          </Link>
          <Link
            href="/manager/settings/website"
            style={{
              padding: '0.75rem',
              border: '1px solid #dee2e6',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              transition: 'background-color 0.2s',
              display: 'block'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div style={{
              fontWeight: 500,
              color: '#111827',
              fontSize: '0.875rem',
              marginBottom: '0.25rem'
            }}>
              Website Settings
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#6b7280'
            }}>
              Customize journal website appearance, navigation, and languages
            </div>
          </Link>
          <Link
            href="/manager/settings/distribution"
            style={{
              padding: '0.75rem',
              border: '1px solid #dee2e6',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              transition: 'background-color 0.2s',
              display: 'block'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div style={{
              fontWeight: 500,
              color: '#111827',
              fontSize: '0.875rem',
              marginBottom: '0.25rem'
            }}>
              Distribution Settings
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#6b7280'
            }}>
              Configure indexing, metadata, and access control settings
            </div>
          </Link>
          <Link
            href="/manager/settings/access"
            style={{
              padding: '0.75rem',
              border: '1px solid #dee2e6',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              transition: 'background-color 0.2s',
              display: 'block'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div style={{
              fontWeight: 500,
              color: '#111827',
              fontSize: '0.875rem',
              marginBottom: '0.25rem'
            }}>
              Access Settings
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#6b7280'
            }}>
              Manage user registration, login, and role permissions
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}



import Link from "next/link";
import { Settings as SettingsIcon, Workflow, Globe, Truck, Lock } from "lucide-react";

const settingsCategories = [
  {
    id: "context",
    title: "Journal Settings",
    description: "Configure journal information, contact details, sections, and categories",
    icon: SettingsIcon,
    href: "/manager/settings/context",
  },
  {
    id: "workflow",
    title: "Workflow",
    description: "Configure submission, review, and publication workflow",
    icon: Workflow,
    href: "/manager/settings/workflow",
  },
  {
    id: "website",
    title: "Website",
    description: "Manage website appearance, navigation, and languages",
    icon: Globe,
    href: "/manager/settings/website",
  },
  {
    id: "distribution",
    title: "Distribution",
    description: "Configure indexing, metadata, and access settings",
    icon: Truck,
    href: "/manager/settings/distribution",
  },
  {
    id: "access",
    title: "Access",
    description: "Manage user registration, login, and permissions",
    icon: Lock,
    href: "/manager/settings/access",
  },
];

export default async function ManagerSettingsPage() {
  const user = await getCurrentUserServer();

  if (!user) {
    redirect("/login");
  }

  const hasManagerRole = user.roles?.some((r) => {
    const rolePath = r.role_path?.toLowerCase();
    return rolePath === "manager" || rolePath === "admin";
  });

  if (!hasManagerRole) {
    redirect("/dashboard");
  }

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
          Journal Settings
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: '#666',
          margin: 0
        }}>
          Configure your journal's settings and preferences
        </p>
      </div>

      {/* Settings Categories - OJS PKP 3.3 Style */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem'
      }}>
        {settingsCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Link
              key={category.id}
              href={category.href}
              style={{
                display: 'block',
                height: '100%',
                textDecoration: 'none'
              }}
            >
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                padding: '1.5rem',
                height: '100%',
                transition: 'border-color 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#006798';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#dee2e6';
              }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{
                    padding: '0.5rem',
                    backgroundColor: 'rgba(0, 103, 152, 0.1)',
                    borderRadius: '0.375rem'
                  }}>
                    <Icon style={{ height: '1.5rem', width: '1.5rem', color: '#006798' }} />
                  </div>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#111827',
                    margin: 0
                  }}>
                    {category.title}
                  </h2>
                </div>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  margin: 0,
                  marginTop: '0.5rem'
                }}>
                  {category.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Links - OJS PKP 3.3 Style */}
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
            Quick Links
          </h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '0.75rem'
        }}>
          <Link
            href="/manager/settings/context"
            style={{
              padding: '0.75rem',
              border: '1px solid #dee2e6',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              transition: 'background-color 0.2s',
              display: 'block'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div style={{
              fontWeight: 500,
              color: '#111827',
              fontSize: '0.875rem',
              marginBottom: '0.25rem'
            }}>
              Journal Settings
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#6b7280'
            }}>
              Configure journal information, contact details, sections, and categories
            </div>
          </Link>
          <Link
            href="/manager/settings/workflow"
            style={{
              padding: '0.75rem',
              border: '1px solid #dee2e6',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              transition: 'background-color 0.2s',
              display: 'block'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div style={{
              fontWeight: 500,
              color: '#111827',
              fontSize: '0.875rem',
              marginBottom: '0.25rem'
            }}>
              Workflow Settings
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#6b7280'
            }}>
              Configure submission stages, review process, and publication workflow
            </div>
          </Link>
          <Link
            href="/manager/settings/website"
            style={{
              padding: '0.75rem',
              border: '1px solid #dee2e6',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              transition: 'background-color 0.2s',
              display: 'block'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div style={{
              fontWeight: 500,
              color: '#111827',
              fontSize: '0.875rem',
              marginBottom: '0.25rem'
            }}>
              Website Settings
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#6b7280'
            }}>
              Customize journal website appearance, navigation, and languages
            </div>
          </Link>
          <Link
            href="/manager/settings/distribution"
            style={{
              padding: '0.75rem',
              border: '1px solid #dee2e6',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              transition: 'background-color 0.2s',
              display: 'block'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div style={{
              fontWeight: 500,
              color: '#111827',
              fontSize: '0.875rem',
              marginBottom: '0.25rem'
            }}>
              Distribution Settings
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#6b7280'
            }}>
              Configure indexing, metadata, and access control settings
            </div>
          </Link>
          <Link
            href="/manager/settings/access"
            style={{
              padding: '0.75rem',
              border: '1px solid #dee2e6',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              transition: 'background-color 0.2s',
              display: 'block'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div style={{
              fontWeight: 500,
              color: '#111827',
              fontSize: '0.875rem',
              marginBottom: '0.25rem'
            }}>
              Access Settings
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#6b7280'
            }}>
              Manage user registration, login, and role permissions
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}



import Link from "next/link";
import { Settings as SettingsIcon, Workflow, Globe, Truck, Lock } from "lucide-react";

const settingsCategories = [
  {
    id: "context",
    title: "Journal Settings",
    description: "Configure journal information, contact details, sections, and categories",
    icon: SettingsIcon,
    href: "/manager/settings/context",
  },
  {
    id: "workflow",
    title: "Workflow",
    description: "Configure submission, review, and publication workflow",
    icon: Workflow,
    href: "/manager/settings/workflow",
  },
  {
    id: "website",
    title: "Website",
    description: "Manage website appearance, navigation, and languages",
    icon: Globe,
    href: "/manager/settings/website",
  },
  {
    id: "distribution",
    title: "Distribution",
    description: "Configure indexing, metadata, and access settings",
    icon: Truck,
    href: "/manager/settings/distribution",
  },
  {
    id: "access",
    title: "Access",
    description: "Manage user registration, login, and permissions",
    icon: Lock,
    href: "/manager/settings/access",
  },
];

export default async function ManagerSettingsPage() {
  const user = await getCurrentUserServer();

  if (!user) {
    redirect("/login");
  }

  const hasManagerRole = user.roles?.some((r) => {
    const rolePath = r.role_path?.toLowerCase();
    return rolePath === "manager" || rolePath === "admin";
  });

  if (!hasManagerRole) {
    redirect("/dashboard");
  }

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
          Journal Settings
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: '#666',
          margin: 0
        }}>
          Configure your journal's settings and preferences
        </p>
      </div>

      {/* Settings Categories - OJS PKP 3.3 Style */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem'
      }}>
        {settingsCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Link
              key={category.id}
              href={category.href}
              style={{
                display: 'block',
                height: '100%',
                textDecoration: 'none'
              }}
            >
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                padding: '1.5rem',
                height: '100%',
                transition: 'border-color 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#006798';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#dee2e6';
              }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{
                    padding: '0.5rem',
                    backgroundColor: 'rgba(0, 103, 152, 0.1)',
                    borderRadius: '0.375rem'
                  }}>
                    <Icon style={{ height: '1.5rem', width: '1.5rem', color: '#006798' }} />
                  </div>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#111827',
                    margin: 0
                  }}>
                    {category.title}
                  </h2>
                </div>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  margin: 0,
                  marginTop: '0.5rem'
                }}>
                  {category.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Links - OJS PKP 3.3 Style */}
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
            Quick Links
          </h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '0.75rem'
        }}>
          <Link
            href="/manager/settings/context"
            style={{
              padding: '0.75rem',
              border: '1px solid #dee2e6',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              transition: 'background-color 0.2s',
              display: 'block'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div style={{
              fontWeight: 500,
              color: '#111827',
              fontSize: '0.875rem',
              marginBottom: '0.25rem'
            }}>
              Journal Settings
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#6b7280'
            }}>
              Configure journal information, contact details, sections, and categories
            </div>
          </Link>
          <Link
            href="/manager/settings/workflow"
            style={{
              padding: '0.75rem',
              border: '1px solid #dee2e6',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              transition: 'background-color 0.2s',
              display: 'block'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div style={{
              fontWeight: 500,
              color: '#111827',
              fontSize: '0.875rem',
              marginBottom: '0.25rem'
            }}>
              Workflow Settings
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#6b7280'
            }}>
              Configure submission stages, review process, and publication workflow
            </div>
          </Link>
          <Link
            href="/manager/settings/website"
            style={{
              padding: '0.75rem',
              border: '1px solid #dee2e6',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              transition: 'background-color 0.2s',
              display: 'block'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div style={{
              fontWeight: 500,
              color: '#111827',
              fontSize: '0.875rem',
              marginBottom: '0.25rem'
            }}>
              Website Settings
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#6b7280'
            }}>
              Customize journal website appearance, navigation, and languages
            </div>
          </Link>
          <Link
            href="/manager/settings/distribution"
            style={{
              padding: '0.75rem',
              border: '1px solid #dee2e6',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              transition: 'background-color 0.2s',
              display: 'block'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div style={{
              fontWeight: 500,
              color: '#111827',
              fontSize: '0.875rem',
              marginBottom: '0.25rem'
            }}>
              Distribution Settings
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#6b7280'
            }}>
              Configure indexing, metadata, and access control settings
            </div>
          </Link>
          <Link
            href="/manager/settings/access"
            style={{
              padding: '0.75rem',
              border: '1px solid #dee2e6',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              transition: 'background-color 0.2s',
              display: 'block'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div style={{
              fontWeight: 500,
              color: '#111827',
              fontSize: '0.875rem',
              marginBottom: '0.25rem'
            }}>
              Access Settings
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#6b7280'
            }}>
              Manage user registration, login, and role permissions
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}



import Link from "next/link";
import { Settings as SettingsIcon, Workflow, Globe, Truck, Lock } from "lucide-react";

const settingsCategories = [
  {
    id: "context",
    title: "Journal Settings",
    description: "Configure journal information, contact details, sections, and categories",
    icon: SettingsIcon,
    href: "/manager/settings/context",
  },
  {
    id: "workflow",
    title: "Workflow",
    description: "Configure submission, review, and publication workflow",
    icon: Workflow,
    href: "/manager/settings/workflow",
  },
  {
    id: "website",
    title: "Website",
    description: "Manage website appearance, navigation, and languages",
    icon: Globe,
    href: "/manager/settings/website",
  },
  {
    id: "distribution",
    title: "Distribution",
    description: "Configure indexing, metadata, and access settings",
    icon: Truck,
    href: "/manager/settings/distribution",
  },
  {
    id: "access",
    title: "Access",
    description: "Manage user registration, login, and permissions",
    icon: Lock,
    href: "/manager/settings/access",
  },
];

export default async function ManagerSettingsPage() {
  const user = await getCurrentUserServer();

  if (!user) {
    redirect("/login");
  }

  const hasManagerRole = user.roles?.some((r) => {
    const rolePath = r.role_path?.toLowerCase();
    return rolePath === "manager" || rolePath === "admin";
  });

  if (!hasManagerRole) {
    redirect("/dashboard");
  }

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
          Journal Settings
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: '#666',
          margin: 0
        }}>
          Configure your journal's settings and preferences
        </p>
      </div>

      {/* Settings Categories - OJS PKP 3.3 Style */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem'
      }}>
        {settingsCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Link
              key={category.id}
              href={category.href}
              style={{
                display: 'block',
                height: '100%',
                textDecoration: 'none'
              }}
            >
              <div style={{
                backgroundColor: '#ffffff',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                padding: '1.5rem',
                height: '100%',
                transition: 'border-color 0.2s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#006798';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#dee2e6';
              }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{
                    padding: '0.5rem',
                    backgroundColor: 'rgba(0, 103, 152, 0.1)',
                    borderRadius: '0.375rem'
                  }}>
                    <Icon style={{ height: '1.5rem', width: '1.5rem', color: '#006798' }} />
                  </div>
                  <h2 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#111827',
                    margin: 0
                  }}>
                    {category.title}
                  </h2>
                </div>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  margin: 0,
                  marginTop: '0.5rem'
                }}>
                  {category.description}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Links - OJS PKP 3.3 Style */}
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
            Quick Links
          </h2>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '0.75rem'
        }}>
          <Link
            href="/manager/settings/context"
            style={{
              padding: '0.75rem',
              border: '1px solid #dee2e6',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              transition: 'background-color 0.2s',
              display: 'block'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div style={{
              fontWeight: 500,
              color: '#111827',
              fontSize: '0.875rem',
              marginBottom: '0.25rem'
            }}>
              Journal Settings
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#6b7280'
            }}>
              Configure journal information, contact details, sections, and categories
            </div>
          </Link>
          <Link
            href="/manager/settings/workflow"
            style={{
              padding: '0.75rem',
              border: '1px solid #dee2e6',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              transition: 'background-color 0.2s',
              display: 'block'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div style={{
              fontWeight: 500,
              color: '#111827',
              fontSize: '0.875rem',
              marginBottom: '0.25rem'
            }}>
              Workflow Settings
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#6b7280'
            }}>
              Configure submission stages, review process, and publication workflow
            </div>
          </Link>
          <Link
            href="/manager/settings/website"
            style={{
              padding: '0.75rem',
              border: '1px solid #dee2e6',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              transition: 'background-color 0.2s',
              display: 'block'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div style={{
              fontWeight: 500,
              color: '#111827',
              fontSize: '0.875rem',
              marginBottom: '0.25rem'
            }}>
              Website Settings
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#6b7280'
            }}>
              Customize journal website appearance, navigation, and languages
            </div>
          </Link>
          <Link
            href="/manager/settings/distribution"
            style={{
              padding: '0.75rem',
              border: '1px solid #dee2e6',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              transition: 'background-color 0.2s',
              display: 'block'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div style={{
              fontWeight: 500,
              color: '#111827',
              fontSize: '0.875rem',
              marginBottom: '0.25rem'
            }}>
              Distribution Settings
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#6b7280'
            }}>
              Configure indexing, metadata, and access control settings
            </div>
          </Link>
          <Link
            href="/manager/settings/access"
            style={{
              padding: '0.75rem',
              border: '1px solid #dee2e6',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              transition: 'background-color 0.2s',
              display: 'block'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9fafb';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div style={{
              fontWeight: 500,
              color: '#111827',
              fontSize: '0.875rem',
              marginBottom: '0.25rem'
            }}>
              Access Settings
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: '#6b7280'
            }}>
              Manage user registration, login, and role permissions
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}


