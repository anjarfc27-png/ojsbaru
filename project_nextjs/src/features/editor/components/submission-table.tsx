import Link from "next/link";
import { Eye, MessageSquare, UserPlus, FileText, Calendar, User } from "lucide-react";

import { StageBadge } from "./stage-badge";
import { StatusBadge } from "./status-badge";
import type { SubmissionSummary } from "../types";

type Props = {
  submissions: SubmissionSummary[];
  emptyMessage?: string;
  bare?: boolean;
};

export function SubmissionTable({ submissions, emptyMessage = "No submissions found.", bare = false }: Props) {
  console.log("SubmissionTable received submissions:", submissions.length, "items");
  
  if (submissions.length === 0) {
    return (
      <div className="empty px-6 py-10 text-center text-sm text-[var(--muted)] italic">
        {emptyMessage}
      </div>
    );
  }

  const table = (
    <table className="min-w-full border-collapse">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left text-xs font-normal text-[var(--muted)] tracking-wider" style={{boxShadow: 'inset 0 -1px 0 #eee'}}>
              ID
            </th>
            <th className="px-4 py-2 text-left text-xs font-normal text-[var(--muted)] tracking-wider" style={{boxShadow: 'inset 0 -1px 0 #eee'}}>
              Title
            </th>
            <th className="px-4 py-2 text-left text-xs font-normal text-[var(--muted)] tracking-wider" style={{boxShadow: 'inset 0 -1px 0 #eee'}}>
              Stage
            </th>
            <th className="px-4 py-2 text-left text-xs font-normal text-[var(--muted)] tracking-wider" style={{boxShadow: 'inset 0 -1px 0 #eee'}}>
              Status
            </th>
            <th className="px-4 py-2 text-left text-xs font-normal text-[var(--muted)] tracking-wider" style={{boxShadow: 'inset 0 -1px 0 #eee'}}>
              Last Activity
            </th>
            <th className="px-4 py-2 text-left text-xs font-normal text-[var(--muted)] tracking-wider" style={{boxShadow: 'inset 0 -1px 0 #eee'}}>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission, index) => (
            <tr key={submission.id} className="gridRow" style={{borderTop: index > 0 ? '1px solid #eee' : 'none'}}>
              <td className="px-4 py-2 align-top" style={{fontSize: '0.75rem', color: 'rgba(0,0,0,0.54)'}}>
                <span className="label">
                  {submission.id}
                </span>
              </td>
              <td className="px-4 py-2 align-top" style={{lineHeight: '1.5rem'}}>
                <div className="text-sm font-medium">
                  <Link href={`/editor/submissions/${submission.id}`} className="pkp_linkaction font-semibold hover:text-[var(--primary-dark)] hover:underline">
                    {submission.title}
                  </Link>
                </div>
                <div className="text-sm text-[var(--muted)] flex items-center mt-1">
                  <User className="h-3 w-3 mr-1" />
                  {submission.author_name || "Author not specified"}
                </div>
                <div className="text-xs text-[var(--muted)] flex items-center mt-1">
                  <Calendar className="h-3 w-3 mr-1" />
                  Submitted {new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(submission.submittedAt))}
                </div>
              </td>
              <td className="px-4 py-2 align-top" style={{lineHeight: '1.5rem'}}>
                <StageBadge stage={submission.stage} />
              </td>
              <td className="px-4 py-2 align-top" style={{lineHeight: '1.5rem'}}>
                <StatusBadge status={submission.status} />
              </td>
              <td className="px-4 py-2 align-top text-sm text-[var(--muted)]" style={{lineHeight: '1.5rem'}}>
                {formatRelative(submission.updatedAt)}
              </td>
              <td className="px-4 py-2 align-top text-sm">
                <div className="row_actions flex space-x-1 justify-end">
                  <Link
                    href={`/editor/submissions/${submission.id}`}
                    className="pkp_button_link text-[var(--primary)] hover:text-[var(--primary-dark)] p-1"
                    title="View Submission"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/editor/submissions/${submission.id}/discussions`}
                    className="pkp_button_link text-[var(--primary)] hover:text-[var(--primary-dark)] p-1"
                    title="Discussions"
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Link>
                  {submission.current_stage === "review" && (
                    <Link
                      href={`/editor/submissions/${submission.id}/review`}
                      className="pkp_button_link text-[var(--primary)] hover:text-[var(--primary-dark)] p-1"
                      title="Review"
                    >
                      <FileText className="h-4 w-4" />
                    </Link>
                  )}
                  {submission.assignees.length === 0 && (
                    <Link
                      href={`/editor/submissions/${submission.id}/assign`}
                      className="pkp_button_link text-[var(--primary)] hover:text-[var(--primary-dark)] p-1"
                      title="Assign Editor"
                    >
                      <UserPlus className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
  );

  if (bare) return table;

  return (
    <div className="pkp_controllers_grid overflow-hidden bg-white shadow-sm" style={{boxShadow: '0 1px 2px rgba(0,0,0,0.3)', borderRadius: '2px'}}>
      <div className="header px-4 py-2 border-b border-[var(--border)] flex justify-between items-center">
        <h4 className="text-base font-normal m-0 leading-8">Submissions</h4>
        <div className="actions">
          <button className="pkp_button text-sm">
            <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </button>
          <button className="pkp_button text-sm ml-2">
            <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filter
          </button>
        </div>
      </div>
      {table}
    </div>
  );
}

function formatRelative(value: string) {
  try {
    const date = new Date(value);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  } catch {
    return value;
  }
}

