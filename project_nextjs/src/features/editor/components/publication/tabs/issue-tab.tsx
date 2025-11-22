"use client";

import { useState } from "react";
import type { SubmissionDetail } from "../../../types";

type Props = {
  submissionId: string;
  detail: SubmissionDetail;
  isPublished: boolean;
};

export function IssueTab({ submissionId, detail, isPublished }: Props) {
  const currentVersion = detail.versions?.[0];
  const [issueId, setIssueId] = useState<string | null>(currentVersion?.issue?.id ?? null);
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [pages, setPages] = useState<string>("");
  const [urlPath, setUrlPath] = useState<string>("");
  const [datePublished, setDatePublished] = useState<string>(
    currentVersion?.publishedAt ?? new Date().toISOString().split("T")[0]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save issue assignment via server action
    console.log("Save issue assignment:", { issueId, sectionId, pages, urlPath, datePublished });
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}
    >
      <h2
        style={{
          fontSize: "1.125rem",
          fontWeight: 600,
          color: "#002C40",
          marginBottom: "0.5rem",
        }}
      >
        Issue
      </h2>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          borderRadius: "0.25rem",
          border: "1px solid #e5e5e5",
          backgroundColor: "#ffffff",
          padding: "1.5rem",
        }}
      >
        {/* Issue Assignment */}
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            fontSize: "0.875rem",
          }}
        >
          <span
            style={{
              fontWeight: 600,
              color: "#002C40",
            }}
          >
            Issue
          </span>
          <select
            value={issueId ?? ""}
            onChange={(e) => setIssueId(e.target.value || null)}
            disabled={isPublished}
            title="Select issue for publication"
            style={{
              height: "2.75rem",
              borderRadius: "0.25rem",
              border: "1px solid #e5e5e5",
              backgroundColor: isPublished ? "#f8f9fa" : "#ffffff",
              padding: "0 0.75rem",
              fontSize: "0.875rem",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.075)",
              outline: "none",
              cursor: isPublished ? "not-allowed" : "pointer",
            }}
          >
            <option value="">Select an issue...</option>
            {/* TODO: Load issues from server */}
            <option value="1">Volume 1, Issue 1 (2024)</option>
            <option value="2">Volume 1, Issue 2 (2024)</option>
          </select>
        </label>

        {/* Section */}
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            fontSize: "0.875rem",
          }}
        >
          <span
            style={{
              fontWeight: 600,
              color: "#002C40",
            }}
          >
            Section
          </span>
          <select
            value={sectionId ?? ""}
            onChange={(e) => setSectionId(e.target.value || null)}
            disabled={isPublished}
            title="Select section for publication"
            style={{
              height: "2.75rem",
              borderRadius: "0.25rem",
              border: "1px solid #e5e5e5",
              backgroundColor: isPublished ? "#f8f9fa" : "#ffffff",
              padding: "0 0.75rem",
              fontSize: "0.875rem",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.075)",
              outline: "none",
              cursor: isPublished ? "not-allowed" : "pointer",
            }}
          >
            <option value="">Select a section...</option>
            {/* TODO: Load sections from server */}
            <option value="articles">Articles</option>
            <option value="reviews">Reviews</option>
          </select>
        </label>

        {/* Pages */}
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            fontSize: "0.875rem",
          }}
        >
          <span
            style={{
              fontWeight: 600,
              color: "#002C40",
            }}
          >
            Pages
          </span>
          <input
            type="text"
            value={pages}
            onChange={(e) => setPages(e.target.value)}
            disabled={isPublished}
            placeholder="e.g., 1-10"
            style={{
              height: "2.75rem",
              borderRadius: "0.25rem",
              border: "1px solid #e5e5e5",
              backgroundColor: isPublished ? "#f8f9fa" : "#ffffff",
              padding: "0 0.75rem",
              fontSize: "0.875rem",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.075)",
              outline: "none",
              cursor: isPublished ? "not-allowed" : "text",
            }}
          />
        </label>

        {/* URL Path */}
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            fontSize: "0.875rem",
          }}
        >
          <span
            style={{
              fontWeight: 600,
              color: "#002C40",
            }}
          >
            URL Path
          </span>
          <input
            type="text"
            value={urlPath}
            onChange={(e) => setUrlPath(e.target.value)}
            disabled={isPublished}
            placeholder="e.g., article-title"
            style={{
              height: "2.75rem",
              borderRadius: "0.25rem",
              border: "1px solid #e5e5e5",
              backgroundColor: isPublished ? "#f8f9fa" : "#ffffff",
              padding: "0 0.75rem",
              fontSize: "0.875rem",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.075)",
              outline: "none",
              cursor: isPublished ? "not-allowed" : "text",
            }}
          />
        </label>

        {/* Date Published */}
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            fontSize: "0.875rem",
          }}
        >
          <span
            style={{
              fontWeight: 600,
              color: "#002C40",
            }}
          >
            Date Published
          </span>
          <input
            type="date"
            value={datePublished}
            onChange={(e) => setDatePublished(e.target.value)}
            disabled={isPublished}
            style={{
              height: "2.75rem",
              borderRadius: "0.25rem",
              border: "1px solid #e5e5e5",
              backgroundColor: isPublished ? "#f8f9fa" : "#ffffff",
              padding: "0 0.75rem",
              fontSize: "0.875rem",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.075)",
              outline: "none",
              cursor: isPublished ? "not-allowed" : "text",
            }}
          />
        </label>

        {!isPublished && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "0.5rem",
              marginTop: "0.5rem",
            }}
          >
            <button
              type="submit"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "0.25rem",
                border: "1px solid #006798",
                backgroundColor: "#006798",
                color: "#ffffff",
                height: "2rem",
                paddingLeft: "0.75rem",
                paddingRight: "0.75rem",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#005a82";
                e.currentTarget.style.borderColor = "#005a82";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#006798";
                e.currentTarget.style.borderColor = "#006798";
              }}
            >
              Save
            </button>
          </div>
        )}
      </form>
    </div>
  );
}



