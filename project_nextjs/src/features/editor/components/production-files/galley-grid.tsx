"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { SubmissionStage } from "../../types";

export type Galley = {
  id: string;
  label: string;
  locale: string;
  fileId?: string;
  remoteUrl?: string;
  submissionFileId?: string;
  sequence: number;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  submissionId: string;
  stage: SubmissionStage;
  galleys: Galley[];
  onEdit?: (galleyId: string) => void;
  onDelete?: (galleyId: string) => Promise<void>;
};

/**
 * Galley Grid
 * Displays all galleys for a submission in production stage
 * Based on OJS PKP 3.3 galley grid
 */
export function GalleyGrid({
  submissionId,
  stage,
  galleys,
  onEdit,
  onDelete,
}: Props) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (galleyId: string) => {
    if (!onDelete) return;
    
    setDeletingId(galleyId);
    try {
      await onDelete(galleyId);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete galley:", error);
    } finally {
      setDeletingId(null);
    }
  };

  if (galleys.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-6 text-center text-sm text-[var(--muted)]">
        No galleys created yet.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-[var(--border)] bg-white">
      <table className="min-w-full divide-y divide-[var(--border)] text-sm">
        <thead className="bg-[var(--surface-muted)] text-[var(--muted)]">
          <tr>
            <th className="px-4 py-3 text-left font-semibold">Label</th>
            <th className="px-4 py-3 text-left font-semibold">Locale</th>
            <th className="px-4 py-3 text-left font-semibold">Type</th>
            <th className="px-4 py-3 text-left font-semibold">Status</th>
            <th className="px-4 py-3 text-left font-semibold">Created</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border)]">
          {galleys.map((galley) => (
            <tr key={galley.id}>
              <td className="px-4 py-3 font-semibold text-[var(--foreground)]">
                {galley.label}
              </td>
              <td className="px-4 py-3 text-[var(--muted)]">
                {galley.locale}
              </td>
              <td className="px-4 py-3 text-[var(--muted)]">
                {galley.remoteUrl ? "Remote URL" : galley.fileId ? "File" : "—"}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-medium ${
                    galley.isApproved
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {galley.isApproved ? "Approved" : "Draft"}
                </span>
              </td>
              <td className="px-4 py-3 text-[var(--muted)]">
                {formatDate(galley.createdAt)}
              </td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  {onEdit && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(galley.id)}
                    >
                      Edit
                    </Button>
                  )}
                  {onDelete && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(galley.id)}
                      disabled={deletingId === galley.id}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("en", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}
