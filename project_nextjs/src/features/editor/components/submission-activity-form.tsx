"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";

type Props = {
  submissionId: string;
};

export function SubmissionActivityForm({ submissionId }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!message.trim()) {
      setFeedback({ tone: "error", message: "Catatan tidak boleh kosong." });
      return;
    }
    startTransition(async () => {
      setFeedback(null);
      try {
        const res = await fetch(`/api/editor/submissions/${submissionId}/activity`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message }),
        });
        const json = await res.json();
        if (!json.ok) {
          setFeedback({ tone: "error", message: json.message ?? "Tidak dapat menambahkan catatan." });
          return;
        }
        setMessage("");
        setFeedback({ tone: "success", message: "Catatan ditambahkan." });
        router.refresh();
      } catch {
        setFeedback({ tone: "error", message: "Kesalahan jaringan saat menambahkan catatan." });
      }
    });
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <label className="block text-sm text-[var(--foreground)]">
        <span className="mb-2 block font-semibold">Tambahkan Catatan</span>
        <textarea
          rows={3}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm shadow-inner focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-muted)]"
        />
      </label>
      {feedback && <FormMessage tone={feedback.tone}>{feedback.message}</FormMessage>}
      <div className="flex justify-end">
        <Button type="submit" loading={isPending} disabled={isPending}>
          Simpan Catatan
        </Button>
      </div>
    </form>
  );
}

