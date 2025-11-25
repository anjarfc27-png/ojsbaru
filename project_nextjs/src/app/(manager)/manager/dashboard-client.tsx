"use client";

import Link from "next/link";

type ManagerStats = {
  totalSubmissions: number;
  inReview: number;
  inCopyediting: number;
  inProduction: number;
  published: number;
  declined: number;
  totalUsers: number;
  recentSubmissions: Array<{
    id: string;
    title: string | null;
    status: string;
    current_stage: string;
    submitted_at: string | null;
    updated_at: string | null;
  }>;
};

type Props = {
  stats: ManagerStats;
};

export function ManagerDashboardClient({ stats }: Props) {
  return (
    <div
      style={{
        padding: "1.5rem",
        display: "grid",
        gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
        gap: "1.5rem",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div>
        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            marginBottom: "0.75rem",
            color: "#002C40",
          }}
        >
          Journal Settings
        </h2>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            marginBottom: "2rem",
          }}
        >
          <li style={{ marginBottom: "0.5rem" }}>
            <Link
              href="/manager/settings"
              style={{
                color: "#006798",
                textDecoration: "underline",
                fontSize: "0.9375rem",
              }}
            >
              Context / Journal Settings
            </Link>
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            <Link
              href="/manager/submissions"
              style={{
                color: "#006798",
                textDecoration: "underline",
                fontSize: "0.9375rem",
              }}
            >
              Submissions &amp; Workflow
            </Link>
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            <Link
              href="/manager/users"
              style={{
                color: "#006798",
                textDecoration: "underline",
                fontSize: "0.9375rem",
              }}
            >
              Users &amp; Roles
            </Link>
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            <Link
              href="/manager/statistics"
              style={{
                color: "#006798",
                textDecoration: "underline",
                fontSize: "0.9375rem",
              }}
            >
              Statistics &amp; Reports
            </Link>
          </li>
        </ul>

        <h2
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            marginBottom: "0.75rem",
            color: "#002C40",
          }}
        >
          Workflow Tools
        </h2>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
          }}
        >
          <li style={{ marginBottom: "0.5rem" }}>
            <Link
              href="/manager/submissions"
              style={{
                color: "#006798",
                textDecoration: "underline",
                fontSize: "0.9375rem",
              }}
            >
              View All Submissions
            </Link>
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            <Link
              href="/editor/tools"
              style={{
                color: "#006798",
                textDecoration: "underline",
                fontSize: "0.9375rem",
              }}
            >
              Import / Export Tools
            </Link>
          </li>
        </ul>
      </div>

      <div>
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #dee2e6",
            borderRadius: "4px",
            padding: "1rem",
          }}
        >
          <h2
            style={{
              fontSize: "1rem",
              fontWeight: 600,
              color: "#111827",
              marginTop: 0,
              marginBottom: "0.75rem",
            }}
          >
            Workflow Overview
          </h2>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.875rem",
            }}
          >
            <tbody>
              <tr>
                <td style={{ padding: "0.25rem 0.5rem", color: "#4b5563" }}>
                  Total submissions
                </td>
                <td
                  style={{
                    padding: "0.25rem 0.5rem",
                    textAlign: "right",
                    color: "#111827",
                    fontWeight: 600,
                  }}
                >
                  {stats.totalSubmissions}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "0.25rem 0.5rem", color: "#4b5563" }}>
                  In review
                </td>
                <td style={{ padding: "0.25rem 0.5rem", textAlign: "right" }}>
                  {stats.inReview}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "0.25rem 0.5rem", color: "#4b5563" }}>
                  In copyediting
                </td>
                <td style={{ padding: "0.25rem 0.5rem", textAlign: "right" }}>
                  {stats.inCopyediting}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "0.25rem 0.5rem", color: "#4b5563" }}>
                  In production
                </td>
                <td style={{ padding: "0.25rem 0.5rem", textAlign: "right" }}>
                  {stats.inProduction}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "0.25rem 0.5rem", color: "#4b5563" }}>
                  Published
                </td>
                <td style={{ padding: "0.25rem 0.5rem", textAlign: "right" }}>
                  {stats.published}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "0.25rem 0.5rem", color: "#4b5563" }}>
                  Declined
                </td>
                <td style={{ padding: "0.25rem 0.5rem", textAlign: "right" }}>
                  {stats.declined}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "0.25rem 0.5rem", color: "#4b5563" }}>
                  Total users
                </td>
                <td style={{ padding: "0.25rem 0.5rem", textAlign: "right" }}>
                  {stats.totalUsers}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


