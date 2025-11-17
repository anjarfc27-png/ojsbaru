"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import type { SubmissionStage, SubmissionStatus } from "../types";
import { SUBMISSION_STAGES } from "../types";

type Props = {
  submissionId: string;
  currentStage: SubmissionStage;
  status: SubmissionStatus;
};

const STATUS_OPTIONS: SubmissionStatus[] = ["queued", "in_review", "accepted", "scheduled", "published", "declined", "archived"];

export function WorkflowStageActions({ submissionId, currentStage, status }: Props) {
  const router = useRouter();
  const [stage, setStage] = useState<SubmissionStage>(currentStage);
  const [currentStatus, setCurrentStatus] = useState<SubmissionStatus>(status);
  const [note, setNote] = useState("");
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleUpdate = () => {
    startTransition(async () => {
      setFeedback(null);
      try {
        const res = await fetch(`/api/editor/submissions/${submissionId}/workflow`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetStage: stage, status: currentStatus, note: note.trim() || undefined }),
        });
        const json = await res.json();
        if (!json.ok) {
          setFeedback({ tone: "error", message: json.message ?? "Tidak dapat memperbarui workflow." });
          return;
        }
        setFeedback({ tone: "success", message: "Workflow diperbarui." });
        setNote("");
        router.refresh();
      } catch {
        setFeedback({ tone: "error", message: "Kesalahan jaringan saat memperbarui workflow." });
      }
    });
  };

  return (
    <div className="rounded-lg border border-[var(--border)] bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-end">
        <div className="flex-1">
          <label className="text-sm font-semibold text-[var(--foreground)]">
            Tahap Workflow
            <select
              className="mt-2 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm shadow-inner focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-muted)]"
              value={stage}
              onChange={(event) => setStage(event.target.value as SubmissionStage)}
            >
              {SUBMISSION_STAGES.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex-1">
          <label className="text-sm font-semibold text-[var(--foreground)]">
            Status
            <select
              className="mt-2 w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm shadow-inner focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-muted)]"
              value={currentStatus}
              onChange={(event) => setCurrentStatus(event.target.value as SubmissionStatus)}
            >
              {STATUS_OPTIONS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <label className="mt-4 block text-sm text-[var(--foreground)]">
        <span className="mb-2 block font-semibold">Catatan aktivitas (opsional)</span>
        <textarea
          rows={3}
          value={note}
          onChange={(event) => setNote(event.target.value)}
          className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm shadow-inner focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-muted)]"
        />
      </label>

      {feedback && (
        <div className="mt-4">
          <FormMessage tone={feedback.tone}>{feedback.message}</FormMessage>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <Button onClick={handleUpdate} loading={isPending} disabled={isPending}>
          Perbarui Workflow
        </Button>
      </div>
    </div>
  );
}

