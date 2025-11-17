"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { useSupabase } from "@/providers/supabase-provider";

import type { SubmissionFile, SubmissionStage } from "../types";

type Props = {
  submissionId: string;
  stage: SubmissionStage;
  files: SubmissionFile[];
};

const KIND_OPTIONS = [
  { value: "manuscript", label: "Manuscript" },
  { value: "review", label: "Review File" },
  { value: "copyedit", label: "Copyediting" },
  { value: "production", label: "Production" },
  { value: "supplemental", label: "Supplemental" },
];

export function SubmissionFileGrid({ submissionId, stage, files }: Props) {
  const router = useRouter();
  const supabase = useSupabase();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [form, setForm] = useState({
    label: "",
    storagePath: "",
    size: "",
    versionLabel: "",
    kind: "manuscript",
    round: "1",
    isVisibleToAuthors: false,
  });
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setCurrentUserId(user?.id ?? null));
  }, [supabase]);

  const stageFiles = useMemo(() => files.filter((file) => file.stage === stage), [files, stage]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentUserId) {
      setFeedback({ tone: "error", message: "User belum terautentikasi." });
      return;
    }
    if (!form.label.trim() || !form.storagePath.trim()) {
      setFeedback({ tone: "error", message: "Label dan storage path wajib diisi." });
      return;
    }
    startTransition(async () => {
      setFeedback(null);
      try {
        const res = await fetch(`/api/editor/submissions/${submissionId}/files`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: form.label.trim(),
            storagePath: form.storagePath.trim(),
            stage,
            kind: form.kind,
            size: Number(form.size) || 0,
            versionLabel: form.versionLabel.trim() || null,
            round: Number(form.round) || 1,
            isVisibleToAuthors: form.isVisibleToAuthors,
            uploadedBy: currentUserId,
          }),
        });
        const json = await res.json();
        if (!json.ok) {
          setFeedback({ tone: "error", message: json.message ?? "Gagal menambahkan file." });
          return;
        }
        setForm({
          label: "",
          storagePath: "",
          size: "",
          versionLabel: "",
          kind: "manuscript",
          round: "1",
          isVisibleToAuthors: false,
        });
        setFeedback({ tone: "success", message: "File ditambahkan." });
        router.refresh();
      } catch {
        setFeedback({ tone: "error", message: "Kesalahan jaringan saat menambahkan file." });
      }
    });
  };

  const handleDelete = (fileId: string) => {
    setDeletingId(fileId);
    fetch(`/api/editor/submissions/${submissionId}/files`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (!json.ok) {
          setFeedback({ tone: "error", message: json.message ?? "Tidak dapat menghapus file." });
          return;
        }
        setFeedback({ tone: "success", message: "File dihapus." });
        router.refresh();
      })
      .catch(() => {
        setFeedback({ tone: "error", message: "Kesalahan jaringan saat menghapus file." });
      })
      .finally(() => setDeletingId(null));
  };

  return (
    <div className="space-y-4">
      <form className="grid gap-3 rounded-md border border-[var(--border)] bg-white p-4 shadow-inner md:grid-cols-2" onSubmit={handleSubmit}>
        <label className="text-sm font-semibold text-[var(--foreground)]">
          Label
          <Input value={form.label} onChange={(event) => setForm((prev) => ({ ...prev, label: event.target.value }))} className="mt-1" />
        </label>
        <label className="text-sm font-semibold text-[var(--foreground)]">
          Storage path
          <Input value={form.storagePath} onChange={(event) => setForm((prev) => ({ ...prev, storagePath: event.target.value }))} className="mt-1" />
        </label>
        <label className="text-sm font-semibold text-[var(--foreground)]">
          File size (bytes)
          <Input value={form.size} onChange={(event) => setForm((prev) => ({ ...prev, size: event.target.value }))} className="mt-1" />
        </label>
        <label className="text-sm font-semibold text-[var(--foreground)]">
          Version label
          <Input value={form.versionLabel} onChange={(event) => setForm((prev) => ({ ...prev, versionLabel: event.target.value }))} className="mt-1" />
        </label>
        <label className="text-sm font-semibold text-[var(--foreground)]">
          File kind
          <select
            className="mt-1 h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm shadow-inner focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-muted)]"
            value={form.kind}
            onChange={(event) => setForm((prev) => ({ ...prev, kind: event.target.value }))}
          >
            {KIND_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-[var(--foreground)]">
          Round
          <Input value={form.round} onChange={(event) => setForm((prev) => ({ ...prev, round: event.target.value }))} className="mt-1" />
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
          <input
            type="checkbox"
            checked={form.isVisibleToAuthors}
            onChange={(event) => setForm((prev) => ({ ...prev, isVisibleToAuthors: event.target.checked }))}
            className="h-4 w-4 rounded border border-[var(--border)]"
          />
          Visible to authors
        </label>
        <div className="flex items-end justify-end">
          <Button type="submit" loading={isPending} disabled={isPending}>
            Tambah File
          </Button>
        </div>
      </form>

      {feedback && <FormMessage tone={feedback.tone}>{feedback.message}</FormMessage>}

      <div className="overflow-hidden rounded-md border border-[var(--border)] bg-white">
        {stageFiles.length === 0 ? (
          <div className="px-4 py-6 text-center text-sm text-[var(--muted)]">Belum ada file pada tahap ini.</div>
        ) : (
          <table className="min-w-full divide-y divide-[var(--border)] text-sm">
            <thead className="bg-[var(--surface-muted)] text-[var(--muted)]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Label</th>
                <th className="px-4 py-3 text-left font-semibold">Kind</th>
                <th className="px-4 py-3 text-left font-semibold">Round</th>
                <th className="px-4 py-3 text-left font-semibold">Size</th>
                <th className="px-4 py-3 text-left font-semibold">Uploaded</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {stageFiles.map((file) => (
                <tr key={file.id}>
                  <td className="px-4 py-3 text-[var(--foreground)]">
                    <div className="font-semibold">{file.label}</div>
                    {file.versionLabel && <div className="text-xs text-[var(--muted)]">Version: {file.versionLabel}</div>}
                    <div className="text-xs text-[var(--muted)] break-all">{file.storagePath}</div>
                  </td>
                  <td className="px-4 py-3 text-[var(--foreground)] capitalize">{file.kind}</td>
                  <td className="px-4 py-3 text-[var(--foreground)]">{file.round}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{formatSize(file.size)}</td>
                  <td className="px-4 py-3 text-[var(--muted)]">{formatDate(file.uploadedAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(file.id)} disabled={deletingId === file.id}>
                      Hapus
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatSize(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let idx = 0;
  while (size >= 1024 && idx < units.length - 1) {
    size /= 1024;
    idx += 1;
  }
  return `${size.toFixed(1)} ${units[idx]}`;
}

