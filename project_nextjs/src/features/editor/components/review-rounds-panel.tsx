"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import type { SubmissionReviewRound, SubmissionStage } from "../types";
import { SUBMISSION_STAGES } from "../types";

type Props = {
  submissionId: string;
  rounds: SubmissionReviewRound[];
};

export function ReviewRoundsPanel({ submissionId, rounds }: Props) {
  const router = useRouter();
  const [stage, setStage] = useState<SubmissionStage>("review");
  const [notes, setNotes] = useState("");
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCreateRound = (event: React.FormEvent) => {
    event.preventDefault();
    startTransition(async () => {
      setFeedback(null);
      try {
        const res = await fetch(`/api/editor/submissions/${submissionId}/review-rounds`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ stage, notes: notes.trim() || null }),
        });
        const json = await res.json();
        if (!json.ok) {
          setFeedback({ tone: "error", message: json.message ?? "Tidak dapat membuat review round." });
          return;
        }
        setNotes("");
        setFeedback({ tone: "success", message: "Review round dibuat." });
        router.refresh();
      } catch {
        setFeedback({ tone: "error", message: "Kesalahan jaringan saat membuat review round." });
      }
    });
  };

  return (
    <div className="space-y-4">
      <form className="flex flex-col gap-3 rounded-md border border-[var(--border)] bg-white p-4 shadow-sm md:flex-row md:items-end" onSubmit={handleCreateRound}>
        <label className="flex-1 text-sm font-semibold text-[var(--foreground)]">
          Tahap
          <select
            className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm shadow-inner focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-muted)]"
            value={stage}
            onChange={(event) => setStage(event.target.value as SubmissionStage)}
          >
            {SUBMISSION_STAGES.filter((value) => value !== "submission").map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label className="flex-1 text-sm font-semibold text-[var(--foreground)]">
          Catatan (opsional)
          <textarea
            className="mt-1 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm shadow-inner focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-muted)]"
            rows={2}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
          />
        </label>
        <Button type="submit" loading={isPending} disabled={isPending}>
          Buka Review Round
        </Button>
      </form>

      {feedback && <FormMessage tone={feedback.tone}>{feedback.message}</FormMessage>}

      <div className="space-y-4">
        {rounds.length === 0 ? (
          <div className="rounded-md border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-6 text-center text-sm text-[var(--muted)]">
            Belum ada review round.
          </div>
        ) : (
          rounds.map((round) => (
            <div key={round.id} className="rounded-md border border-[var(--border)] bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground)]">
                    {round.stage} · Round {round.round}
                  </p>
                  <p className="text-xs text-[var(--muted)]">Status: {round.status}</p>
                </div>
                <p className="text-xs text-[var(--muted)]">
                  {formatDate(round.startedAt)}
                  {round.closedAt && ` · Closed ${formatDate(round.closedAt)}`}
                </p>
              </div>
              {round.notes && <p className="mt-2 text-sm text-[var(--muted)]">{round.notes}</p>}
              <div className="mt-3 space-y-2">
                {round.reviews.length === 0 ? (
                  <p className="text-xs text-[var(--muted)]">Belum ada reviewer yang ditugaskan pada round ini.</p>
                ) : (
                  round.reviews.map((review) => (
                    <div key={review.id} className="rounded border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-2 text-xs">
                      <p className="font-semibold text-[var(--foreground)]">Reviewer: {review.reviewerId}</p>
                      <p className="text-[var(--muted)]">
                        Status: {review.status} · Due {review.dueDate ? formatDate(review.dueDate) : "—"}
                        {review.recommendation && ` · Recommendation: ${review.recommendation}`}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  try {
    return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
  } catch {
    return value;
  }
}

