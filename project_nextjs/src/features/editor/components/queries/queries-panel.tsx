"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Query, SubmissionStage } from "../../types";
import { QueryCard } from "./query-card";
import { CreateQueryModal } from "./create-query-modal";

type Props = {
  submissionId: string;
  stage: SubmissionStage;
  queries: Query[];
  participants: Array<{ userId: string; name: string; role: string }>;
};

/**
 * Queries Panel
 * Component for displaying and managing discussion queries/threads
 * Based on OJS 3.3 queries system
 */
export function QueriesPanel({ submissionId, stage, queries, participants }: Props) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isPending, startTransition] = useTransition();

  const openQueries = queries.filter((q) => !q.closed);
  const closedQueries = queries.filter((q) => q.closed);

  const handleCreateQuery = () => {
    setIsCreating(true);
  };

  const handleCloseModal = () => {
    setIsCreating(false);
  };

  const handleQueryCreated = () => {
    setIsCreating(false);
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div
      style={{
        borderRadius: "0.25rem",
        border: "1px solid #e5e5e5",
        backgroundColor: "#ffffff",
        padding: "1.5rem",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.125rem",
            fontWeight: 600,
            color: "#002C40",
          }}
        >
          Queries ({queries.length})
        </h2>
        <button
          type="button"
          onClick={handleCreateQuery}
          disabled={isPending}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "0.25rem",
            border: "1px solid #006798",
            backgroundColor: "#006798",
            color: "#ffffff",
            height: "2.25rem",
            paddingLeft: "1rem",
            paddingRight: "1rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: isPending ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            if (!isPending) {
              e.currentTarget.style.backgroundColor = "#005a82";
              e.currentTarget.style.borderColor = "#005a82";
            }
          }}
          onMouseLeave={(e) => {
            if (!isPending) {
              e.currentTarget.style.backgroundColor = "#006798";
              e.currentTarget.style.borderColor = "#006798";
            }
          }}
        >
          Create Query
        </button>
      </div>

      {queries.length === 0 ? (
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            fontSize: "0.875rem",
            color: "rgba(0, 0, 0, 0.54)",
            backgroundColor: "#f8f9fa",
            borderRadius: "0.25rem",
            border: "1px solid #e5e5e5",
          }}
        >
          No queries yet. Create a query to start a discussion.
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          {/* Open Queries */}
          {openQueries.length > 0 && (
            <div>
              <h3
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#002C40",
                  marginBottom: "0.75rem",
                }}
              >
                Open Queries ({openQueries.length})
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {openQueries.map((query) => (
                  <QueryCard
                    key={query.id}
                    submissionId={submissionId}
                    query={query}
                    participants={participants}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Closed Queries */}
          {closedQueries.length > 0 && (
            <div>
              <h3
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#002C40",
                  marginBottom: "0.75rem",
                }}
              >
                Closed Queries ({closedQueries.length})
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {closedQueries.map((query) => (
                  <QueryCard
                    key={query.id}
                    submissionId={submissionId}
                    query={query}
                    participants={participants}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {isCreating && (
        <CreateQueryModal
          open={true}
          onClose={handleCloseModal}
          submissionId={submissionId}
          stage={stage}
          participants={participants}
          onQueryCreated={handleQueryCreated}
        />
      )}
    </div>
  );
}



