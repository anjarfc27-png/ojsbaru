"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { JOURNAL_ROLE_OPTIONS } from "@/features/journals/types";
import { SUBMISSION_STAGES, type SubmissionStage } from "../types";

type Props = {
  submissionId: string;
  journalId: string;
};

type JournalUser = {
  id: string;
  name: string;
  email: string;
};

type Participant = {
  userId: string;
  name: string;
  email: string;
  role: string;
  stage: SubmissionStage;
  assignedAt: string;
};

export function SubmissionParticipantsPanel({ submissionId, journalId }: Props) {
  const router = useRouter();
  const [journalUsers, setJournalUsers] = useState<JournalUser[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [search, setSearch] = useState("");
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<string>(JOURNAL_ROLE_OPTIONS[0].value);
  const [stage, setStage] = useState<SubmissionStage>(SUBMISSION_STAGES[0]);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [isAssigning, startAssign] = useTransition();
  const [removingKey, setRemovingKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, participantsRes] = await Promise.all([
        fetch(`/api/admin/journals/${journalId}/users`),
        fetch(`/api/editor/submissions/${submissionId}/participants`),
      ]);
      const usersJson = await usersRes.json();
      const participantsJson = await participantsRes.json();
      if (usersJson.ok) {
        setJournalUsers(
          (usersJson.users ?? []).map((user: { id: string; name: string; email: string }) => ({
            id: user.id,
            name: user.name ?? user.email ?? user.id,
            email: user.email ?? "",
          })),
        );
      }
      if (participantsJson.ok) {
        setParticipants(participantsJson.participants ?? []);
      }
    } catch {
      setFeedback({ tone: "error", message: "Gagal memuat peserta workflow." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journalId, submissionId]);

  const filteredParticipants = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    if (!keyword) return participants;
    return participants.filter(
      (participant) =>
        participant.name.toLowerCase().includes(keyword) ||
        participant.email.toLowerCase().includes(keyword) ||
        participant.role.toLowerCase().includes(keyword) ||
        participant.stage.toLowerCase().includes(keyword),
    );
  }, [participants, search]);

  const handleAssign = (event: React.FormEvent) => {
    event.preventDefault();
    if (!userId) {
      setFeedback({ tone: "error", message: "Pilih pengguna untuk ditugaskan." });
      return;
    }
    startAssign(async () => {
      setFeedback(null);
      try {
        const res = await fetch(`/api/editor/submissions/${submissionId}/participants`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, role, stage }),
        });
        const json = await res.json();
        if (!json.ok) {
          setFeedback({ tone: "error", message: json.message ?? "Tidak dapat menambahkan peserta." });
          return;
        }
        setFeedback({ tone: "success", message: "Peserta berhasil ditambahkan." });
        setUserId("");
        router.refresh();
        loadData();
      } catch {
        setFeedback({ tone: "error", message: "Kesalahan jaringan saat menambahkan peserta." });
      }
    });
  };

  const handleRemove = (participant: Participant) => {
    const key = `${participant.userId}-${participant.role}-${participant.stage}`;
    setRemovingKey(key);
    fetch(`/api/editor/submissions/${submissionId}/participants`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: participant.userId, role: participant.role, stage: participant.stage }),
    })
      .then((res) => res.json())
      .then((json) => {
        if (!json.ok) {
          setFeedback({ tone: "error", message: json.message ?? "Tidak dapat menghapus peserta." });
          return;
        }
        setFeedback({ tone: "success", message: "Peserta dihapus." });
        router.refresh();
        loadData();
      })
      .catch(() => {
        setFeedback({ tone: "error", message: "Kesalahan jaringan saat menghapus peserta." });
      })
      .finally(() => setRemovingKey(null));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-[var(--border)] bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">Tambah Peserta Workflow</h3>
        <form className="mt-3 grid gap-3 md:grid-cols-[2fr_1fr_1fr_auto]" onSubmit={handleAssign}>
          <select
            className="h-11 rounded-md border border-[var(--border)] bg-white px-3 text-sm shadow-inner focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-muted)]"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
          >
            <option value="">Pilih pengguna…</option>
            {journalUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          <select
            className="h-11 rounded-md border border-[var(--border)] bg-white px-3 text-sm shadow-inner focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-muted)]"
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            {JOURNAL_ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            className="h-11 rounded-md border border-[var(--border)] bg-white px-3 text-sm shadow-inner focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-muted)]"
            value={stage}
            onChange={(event) => setStage(event.target.value as SubmissionStage)}
          >
            {SUBMISSION_STAGES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
          <Button type="submit" loading={isAssigning} disabled={isAssigning}>
            Tambah
          </Button>
        </form>
        <p className="mt-2 text-xs text-[var(--muted)]">Peserta harus sudah terdaftar sebagai pengguna jurnal.</p>
        {feedback && (
          <div className="mt-3">
            <FormMessage tone={feedback.tone}>{feedback.message}</FormMessage>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Input
            placeholder="Cari nama, email, role, atau tahap"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full md:w-72"
          />
          <p className="text-xs text-[var(--muted)]">Total peserta: {participants.length}</p>
        </div>

        <div className="mt-4 overflow-hidden rounded-md border border-[var(--border)]">
          {loading ? (
            <div className="px-4 py-6 text-center text-sm text-[var(--muted)]">Memuat peserta…</div>
          ) : filteredParticipants.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-[var(--muted)]">Belum ada peserta pada workflow.</div>
          ) : (
            <table className="min-w-full divide-y divide-[var(--border)] text-sm">
              <thead className="bg-[var(--surface-muted)] text-[var(--muted)]">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Nama</th>
                  <th className="px-4 py-3 text-left font-semibold">Email</th>
                  <th className="px-4 py-3 text-left font-semibold">Peran</th>
                  <th className="px-4 py-3 text-left font-semibold">Tahap</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredParticipants.map((participant) => {
                  const key = `${participant.userId}-${participant.role}-${participant.stage}`;
                  const roleLabel = JOURNAL_ROLE_OPTIONS.find((option) => option.value === participant.role)?.label ?? participant.role;
                  return (
                    <tr key={key}>
                      <td className="px-4 py-3 font-semibold text-[var(--foreground)]">{participant.name}</td>
                      <td className="px-4 py-3 text-[var(--muted)]">{participant.email}</td>
                      <td className="px-4 py-3 text-[var(--foreground)]">{roleLabel}</td>
                      <td className="px-4 py-3 text-[var(--foreground)]">{participant.stage}</td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemove(participant)}
                          disabled={removingKey === key}
                        >
                          Hapus
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

