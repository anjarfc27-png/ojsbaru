"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { clearScheduledTaskLogsAction } from "./actions";

const MOCK_LOGS = [
  { id: "log-1", name: "Reminder email", executedAt: "2025-03-10 02:00" },
  { id: "log-2", name: "Subscription renewal", executedAt: "2025-03-09 04:30" },
  { id: "log-3", name: "Usage statistics", executedAt: "2025-03-08 23:45" },
];

export default function ClearScheduledTaskLogsPage() {
  const [state, formAction, pending] = useActionState<
    | null
    | { ok: true; deleted: number }
    | { ok: false; message: string },
    FormData
  >(async () => clearScheduledTaskLogsAction(), null);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          Clear Scheduled Task Execution Logs
        </h2>
        <p className="text-sm text-[var(--muted)]">
          Hapus file log eksekusi tugas terjadwal dari server. Anda dapat
          melakukan ini untuk menghemat ruang penyimpanan.
        </p>
      </header>

      {state?.ok && (
        <FormMessage tone="success">
          Log tugas terjadwal berhasil dihapus{typeof state.deleted === "number" ? ` (${state.deleted})` : ""}.
        </FormMessage>
      )}
      {state && !state.ok && (
        <FormMessage tone="error">{state.message}</FormMessage>
      )}

      <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-white shadow-sm">
        <table className="min-w-full divide-y divide-[var(--border)]">
          <thead className="bg-[var(--surface-muted)]">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Nama tugas
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Eksekusi terakhir
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {MOCK_LOGS.map((log) => (
              <tr key={log.id}>
                <td className="px-4 py-3 text-sm text-[var(--foreground)]">
                  {log.name}
                </td>
                <td className="px-4 py-3 text-sm text-[var(--muted)]">
                  {log.executedAt}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form action={formAction}>
        <Button variant="danger" type="submit" loading={pending}>
          Clear Logs
        </Button>
      </form>
    </div>
  );
}

