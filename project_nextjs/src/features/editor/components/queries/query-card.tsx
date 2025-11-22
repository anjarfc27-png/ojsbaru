"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Query } from "../../types";
import { QueryDetailModal } from "./query-detail-modal";
import { FormMessage } from "@/components/ui/form-message";

type Props = {
  submissionId: string;
  query: Query;
  participants: Array<{ userId: string; name: string; role: string }>;
};

/**
 * Query Card
 * Component for displaying a single query/discussion thread
 * Based on OJS 3.3 query display
 */
export function QueryCard({ submissionId, query, participants }: Props) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const lastNote = query.notes.length > 0 ? query.notes[query.notes.length - 1] : null;
  const participantNames = query.participants
    .map((userId) => participants.find((p) => p.userId === userId)?.name || "Unknown")
    .join(", ");

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    startTransition(() => {
      router.refresh();
    });
  };

  const formatDate = (dateString: string) => {
    try {
      return new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(dateString));
    } catch {
      return dateString;
    }
  };

  return (
    <>
      <div
        onClick={handleOpen}
        style={{
          borderRadius: "0.25rem",
          border: "1px solid #e5e5e5",
          backgroundColor: query.closed ? "#f8f9fa" : "#ffffff",
          padding: "0.75rem 1rem",
          cursor: "pointer",
          transition: "all 0.2s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#f8f9fa";
          e.currentTarget.style.borderColor = "#d0d0d0";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = query.closed ? "#f8f9fa" : "#ffffff";
          e.currentTarget.style.borderColor = "#e5e5e5";
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.25rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#002C40",
                }}
              >
                {lastNote?.title || "Discussion Thread"}
              </span>
              {query.closed && (
                <span
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#ffffff",
                    backgroundColor: "rgba(0, 0, 0, 0.54)",
                    padding: "0.125rem 0.5rem",
                    borderRadius: "0.125rem",
                  }}
                >
                  Closed
                </span>
              )}
            </div>
            {lastNote && (
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "rgba(0, 0, 0, 0.84)",
                  marginBottom: "0.25rem",
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {lastNote.contents}
              </p>
            )}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                fontSize: "0.75rem",
                color: "rgba(0, 0, 0, 0.54)",
              }}
            >
              <span>Participants: {participantNames || "None"}</span>
              <span>•</span>
              <span>{query.notes.length} {query.notes.length === 1 ? "message" : "messages"}</span>
              <span>•</span>
              <span>{formatDate(query.datePosted)}</span>
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <QueryDetailModal
          open={true}
          onClose={handleClose}
          submissionId={submissionId}
          query={query}
          participants={participants}
        />
      )}
    </>
  );
}



