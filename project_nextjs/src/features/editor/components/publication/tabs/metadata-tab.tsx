"use client";

import type { SubmissionDetail } from "../../../types";

type Props = {
  submissionId: string;
  detail: SubmissionDetail;
  isPublished: boolean;
};

export function MetadataTab({ submissionId, detail, isPublished }: Props) {
  const metadata = detail.metadata as Record<string, unknown>;
  const keywords = Array.isArray(metadata.keywords) ? metadata.keywords : [];
  const categories = Array.isArray(metadata.categories) ? metadata.categories : [];

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
        Metadata
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
            marginBottom: "1rem",
          }}
        >
          Additional metadata for this publication.
        </p>

        {/* Keywords */}
        <div
          style={{
            marginBottom: "1.5rem",
          }}
        >
          <label
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#002C40",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Keywords
          </label>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            {keywords.length === 0 ? (
              <span
                style={{
                  fontSize: "0.875rem",
                  color: "rgba(0, 0, 0, 0.54)",
                }}
              >
                No keywords
              </span>
            ) : (
              keywords.map((keyword: unknown, index: number) => (
                <span
                  key={index}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "0.25rem",
                    backgroundColor: "#f0f7fa",
                    color: "#006798",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                  }}
                >
                  {String(keyword)}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Categories */}
        <div>
          <label
            style={{
              fontSize: "0.875rem",
              fontWeight: 600,
              color: "#002C40",
              marginBottom: "0.5rem",
              display: "block",
            }}
          >
            Categories
          </label>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            {categories.length === 0 ? (
              <span
                style={{
                  fontSize: "0.875rem",
                  color: "rgba(0, 0, 0, 0.54)",
                }}
              >
                No categories
              </span>
            ) : (
              categories.map((category: unknown, index: number) => (
                <span
                  key={index}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "0.25rem",
                    backgroundColor: "#f0f7fa",
                    color: "#006798",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                  }}
                >
                  {String(category)}
                </span>
              ))
            )}
          </div>
        </div>
      </div>

      {!isPublished && (
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            type="button"
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
            Edit Metadata
          </button>
        </div>
      )}
    </div>
  );
}



