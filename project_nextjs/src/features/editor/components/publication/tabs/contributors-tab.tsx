"use client";

import type { SubmissionDetail } from "../../../types";

type Props = {
  submissionId: string;
  detail: SubmissionDetail;
  isPublished: boolean;
};

export function ContributorsTab({ submissionId, detail, isPublished }: Props) {
  // Extract authors from metadata
  const authors = ((detail.metadata as { authors?: Array<{ givenName?: string; familyName?: string; affiliation?: string }> })?.authors) ?? [];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <h2
          style={{
            fontSize: "1.125rem",
            fontWeight: 600,
            color: "#002C40",
          }}
        >
          Contributors
        </h2>
        {!isPublished && (
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
            Add Contributor
          </button>
        )}
      </div>

      {/* Contributors List */}
      <div
        style={{
          borderRadius: "0.25rem",
          border: "1px solid #e5e5e5",
          backgroundColor: "#ffffff",
          overflow: "hidden",
        }}
      >
        {authors.length === 0 ? (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              fontSize: "0.875rem",
              color: "rgba(0, 0, 0, 0.54)",
            }}
          >
            No contributors yet.
          </div>
        ) : (
          <table
            className="pkpTable"
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.875rem",
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: "#f8f9fa",
                }}
              >
                <th
                  style={{
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    fontSize: "0.75rem",
                    fontWeight: 400,
                    color: "rgba(0, 0, 0, 0.54)",
                    borderBottom: "1px solid #e5e5e5",
                  }}
                >
                  Name
                </th>
                <th
                  style={{
                    padding: "0.75rem 1rem",
                    textAlign: "left",
                    fontSize: "0.75rem",
                    fontWeight: 400,
                    color: "rgba(0, 0, 0, 0.54)",
                    borderBottom: "1px solid #e5e5e5",
                  }}
                >
                  Affiliation
                </th>
                <th
                  style={{
                    padding: "0.75rem 1rem",
                    textAlign: "right",
                    fontSize: "0.75rem",
                    fontWeight: 400,
                    color: "rgba(0, 0, 0, 0.54)",
                    borderBottom: "1px solid #e5e5e5",
                  }}
                />
              </tr>
            </thead>
            <tbody>
              {authors.map((author, index) => (
                <tr
                  key={index}
                  style={{
                    borderTop: index > 0 ? "1px solid #e5e5e5" : "none",
                    backgroundColor: "transparent",
                  }}
                >
                  <td
                    style={{
                      padding: "0.75rem 1rem",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      color: "#002C40",
                    }}
                  >
                    {`${author.givenName ?? ""} ${author.familyName ?? ""}`.trim() || "—"}
                  </td>
                  <td
                    style={{
                      padding: "0.75rem 1rem",
                      fontSize: "0.875rem",
                      color: "rgba(0, 0, 0, 0.84)",
                    }}
                  >
                    {author.affiliation ?? "—"}
                  </td>
                  <td
                    style={{
                      padding: "0.75rem 1rem",
                      textAlign: "right",
                    }}
                  >
                    {!isPublished && (
                      <button
                        type="button"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "0.25rem",
                          border: "1px solid #e5e5e5",
                          backgroundColor: "transparent",
                          color: "#006798",
                          height: "2rem",
                          paddingLeft: "0.75rem",
                          paddingRight: "0.75rem",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f8f9fa";
                          e.currentTarget.style.borderColor = "#d0d0d0";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                          e.currentTarget.style.borderColor = "#e5e5e5";
                        }}
                      >
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p
        style={{
          fontSize: "0.75rem",
          color: "rgba(0, 0, 0, 0.54)",
          marginTop: "-0.5rem",
        }}
      >
        Contributors are managed from the submission metadata. Authors added during submission will appear here.
      </p>
    </div>
  );
}



