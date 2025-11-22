"use client";

import { useState } from "react";
import type { SubmissionDetail } from "../../../types";

type Props = {
  submissionId: string;
  detail: SubmissionDetail;
  isPublished: boolean;
};

export function IdentifiersTab({ submissionId, detail, isPublished }: Props) {
  const metadata = detail.metadata as Record<string, unknown>;
  const identifiers = (metadata.identifiers as Record<string, string | null>) || {};

  const [doi, setDoi] = useState<string>(identifiers.doi || "");
  const [isbn, setIsbn] = useState<string>(identifiers.isbn || "");
  const [issn, setIssn] = useState<string>(identifiers.issn || "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // TODO: Save identifiers via API
      console.log("Save identifiers:", { doi, isbn, issn });
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsSaving(false);
    } catch (error) {
      console.error("Error saving identifiers:", error);
      setIsSaving(false);
    }
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
        Identifiers
      </h2>

      <form
        onSubmit={handleSave}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
          borderRadius: "0.25rem",
          border: "1px solid #e5e5e5",
          backgroundColor: "#ffffff",
          padding: "1.5rem",
        }}
      >
        <p
          style={{
            fontSize: "0.875rem",
            color: "rgba(0, 0, 0, 0.84)",
            marginBottom: "0.5rem",
          }}
        >
          Manage identifiers such as DOI, ISBN, ISSN for this publication.
        </p>

        {/* DOI */}
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
            DOI (Digital Object Identifier)
          </span>
          <input
            type="text"
            value={doi}
            onChange={(e) => setDoi(e.target.value)}
            placeholder="10.1234/example"
            disabled={isPublished}
            style={{
              height: "2.75rem",
              padding: "0 0.75rem",
              borderRadius: "0.25rem",
              border: "1px solid #e5e5e5",
              backgroundColor: isPublished ? "#f8f9fa" : "#ffffff",
              fontSize: "0.875rem",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.075)",
              outline: "none",
              cursor: isPublished ? "not-allowed" : "text",
            }}
          />
          <span
            style={{
              fontSize: "0.75rem",
              color: "rgba(0, 0, 0, 0.54)",
            }}
          >
            Enter the DOI for this publication (e.g., 10.1234/example)
          </span>
        </label>

        {/* ISBN */}
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
            ISBN (International Standard Book Number)
          </span>
          <input
            type="text"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            placeholder="978-0-123456-78-9"
            disabled={isPublished}
            style={{
              height: "2.75rem",
              padding: "0 0.75rem",
              borderRadius: "0.25rem",
              border: "1px solid #e5e5e5",
              backgroundColor: isPublished ? "#f8f9fa" : "#ffffff",
              fontSize: "0.875rem",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.075)",
              outline: "none",
              cursor: isPublished ? "not-allowed" : "text",
            }}
          />
        </label>

        {/* ISSN */}
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
            ISSN (International Standard Serial Number)
          </span>
          <input
            type="text"
            value={issn}
            onChange={(e) => setIssn(e.target.value)}
            placeholder="1234-5678"
            disabled={isPublished}
            style={{
              height: "2.75rem",
              padding: "0 0.75rem",
              borderRadius: "0.25rem",
              border: "1px solid #e5e5e5",
              backgroundColor: isPublished ? "#f8f9fa" : "#ffffff",
              fontSize: "0.875rem",
              boxShadow: "inset 0 1px 2px rgba(0,0,0,0.075)",
              outline: "none",
              cursor: isPublished ? "not-allowed" : "text",
            }}
          />
        </label>

        {/* Save Button */}
        {!isPublished && (
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: "0.5rem",
            }}
          >
            <button
              type="submit"
              disabled={isSaving}
              style={{
                padding: "0.75rem 1.5rem",
                borderRadius: "0.25rem",
                border: "none",
                backgroundColor: isSaving ? "#e5e5e5" : "#006798",
                color: isSaving ? "rgba(0, 0, 0, 0.54)" : "#ffffff",
                fontSize: "0.875rem",
                fontWeight: 600,
                cursor: isSaving ? "not-allowed" : "pointer",
              }}
            >
              {isSaving ? "Saving..." : "Save Identifiers"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}

