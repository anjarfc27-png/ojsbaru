"use client";

import { useState } from "react";
import type { SubmissionDetail } from "../../../types";

type Props = {
  submissionId: string;
  detail: SubmissionDetail;
  isPublished: boolean;
};

export function TitleAbstractTab({ submissionId, detail, isPublished }: Props) {
  const [title, setTitle] = useState(detail.summary.title ?? "");
  const [abstract, setAbstract] = useState((detail.metadata as { abstract?: string })?.abstract ?? "");
  const [prefix, setPrefix] = useState((detail.metadata as { prefix?: string })?.prefix ?? "");
  const [subtitle, setSubtitle] = useState((detail.metadata as { subtitle?: string })?.subtitle ?? "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save title and abstract via server action
    console.log("Save title and abstract:", { title, abstract, prefix, subtitle });
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
        Title & Abstract
      </h2>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        {/* Prefix */}
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
            Prefix
          </span>
          <input
            type="text"
            value={prefix}
            onChange={(e) => setPrefix(e.target.value)}
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

        {/* Title */}
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
            Title <span style={{ color: "#dc3545" }}>*</span>
          </span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isPublished}
            required
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

        {/* Subtitle */}
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
            Subtitle
          </span>
          <input
            type="text"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
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

        {/* Abstract */}
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
            Abstract
          </span>
          <textarea
            rows={10}
            value={abstract}
            onChange={(e) => setAbstract(e.target.value)}
            disabled={isPublished}
            style={{
              width: "100%",
              borderRadius: "0.25rem",
              border: "1px solid #e5e5e5",
              backgroundColor: isPublished ? "#f8f9fa" : "#ffffff",
              padding: "0.5rem 0.75rem",
              fontSize: "0.875rem",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.075)",
              outline: "none",
              resize: "vertical",
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



