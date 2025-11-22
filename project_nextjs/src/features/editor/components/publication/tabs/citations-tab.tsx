"use client";

import { useState } from "react";
import type { SubmissionDetail } from "../../../types";

type Props = {
  submissionId: string;
  detail: SubmissionDetail;
  isPublished: boolean;
};

export function CitationsTab({ submissionId, detail, isPublished }: Props) {
  const metadata = detail.metadata as Record<string, unknown>;
  const citations = Array.isArray(metadata.citations) ? (metadata.citations as string[]) : [];

  const [citationList, setCitationList] = useState<string[]>(citations);
  const [newCitation, setNewCitation] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const handleAddCitation = () => {
    if (newCitation.trim()) {
      setCitationList([...citationList, newCitation.trim()]);
      setNewCitation("");
    }
  };

  const handleRemoveCitation = (index: number) => {
    setCitationList(citationList.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Save citations via API
      console.log("Save citations:", citationList);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsSaving(false);
    } catch (error) {
      console.error("Error saving citations:", error);
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
        Citations
      </h2>

      <div
        style={{
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
            marginBottom: "1.5rem",
          }}
        >
          Manage references and citations for this publication. Citations can be entered in any format (e.g., APA, MLA, Chicago).
        </p>

        {/* Add Citation Form */}
        {!isPublished && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              marginBottom: "1.5rem",
              padding: "1rem",
              backgroundColor: "#f8f9fa",
              borderRadius: "0.25rem",
            }}
          >
            <label
              style={{
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#002C40",
              }}
            >
              Add Citation
            </label>
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
              }}
            >
              <textarea
                value={newCitation}
                onChange={(e) => setNewCitation(e.target.value)}
                placeholder="Enter citation (e.g., Author, A. (2024). Title. Journal, 1(1), 1-10.)"
                style={{
                  flex: 1,
                  minHeight: "4rem",
                  padding: "0.75rem",
                  borderRadius: "0.25rem",
                  border: "1px solid #e5e5e5",
                  backgroundColor: "#ffffff",
                  fontSize: "0.875rem",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
              <button
                type="button"
                onClick={handleAddCitation}
                disabled={!newCitation.trim()}
                style={{
                  padding: "0.75rem 1.5rem",
                  borderRadius: "0.25rem",
                  border: "none",
                  backgroundColor: newCitation.trim() ? "#006798" : "#e5e5e5",
                  color: newCitation.trim() ? "#ffffff" : "rgba(0, 0, 0, 0.54)",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor: newCitation.trim() ? "pointer" : "not-allowed",
                  alignSelf: "flex-start",
                }}
              >
                Add
              </button>
            </div>
          </div>
        )}

        {/* Citations List */}
        {citationList.length === 0 ? (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              fontSize: "0.875rem",
              color: "rgba(0, 0, 0, 0.54)",
              backgroundColor: "#f8f9fa",
              borderRadius: "0.25rem",
            }}
          >
            No citations added yet.
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
            }}
          >
            {citationList.map((citation, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "0.75rem",
                  padding: "1rem",
                  borderRadius: "0.25rem",
                  border: "1px solid #e5e5e5",
                  backgroundColor: "#ffffff",
                }}
              >
                <span
                  style={{
                    flex: 1,
                    fontSize: "0.875rem",
                    color: "rgba(0, 0, 0, 0.84)",
                    lineHeight: "1.5",
                  }}
                >
                  {citation}
                </span>
                {!isPublished && (
                  <button
                    type="button"
                    onClick={() => handleRemoveCitation(index)}
                    style={{
                      padding: "0.5rem",
                      borderRadius: "0.25rem",
                      border: "1px solid #e5e5e5",
                      backgroundColor: "transparent",
                      color: "#d32f2f",
                      fontSize: "0.875rem",
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Save Button */}
        {!isPublished && citationList.length > 0 && (
          <div
            style={{
              marginTop: "1.5rem",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={handleSave}
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
              {isSaving ? "Saving..." : "Save Citations"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

