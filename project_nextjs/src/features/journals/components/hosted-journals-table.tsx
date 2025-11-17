"use client";

import { ChevronDown, ChevronRight, Globe2, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteJournalAction } from "@/app/(admin)/admin/site-management/hosted-journals/actions";
import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Modal } from "@/components/ui/modal";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { HostedJournal } from "../types";
import { JournalEditForm } from "./journal-edit-form";
import { JournalSettingsWizard } from "./journal-settings-wizard";
import { JournalUsersPanel } from "./journal-users-panel";

type ModalState =
  | { type: "edit"; journal?: HostedJournal; mode: "create" | "edit" }
  | { type: "settings"; journal: HostedJournal }
  | { type: "users"; journal: HostedJournal }
  | null;

type Props = {
  journals: HostedJournal[];
};

export function HostedJournalsTable({ journals }: Props) {
  const router = useRouter();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [modalState, setModalState] = useState<ModalState>(null);
  const [deleteTarget, setDeleteTarget] = useState<HostedJournal | null>(null);
  const [isDeleting, startDelete] = useTransition();
  const [feedback, setFeedback] = useState<{
    tone: "success" | "error";
    message: string;
  } | null>(null);

  const emptyState = journals.length === 0;

  const closeModals = () => {
    setModalState(null);
    setDeleteTarget(null);
  };

  const handleSuccess = (message: string) => {
    setFeedback({ tone: "success", message });
    closeModals();
    router.refresh();
  };

  const handleError = (message: string) => {
    setFeedback({ tone: "error", message });
  };

  return (
    <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
        <p className="text-sm font-semibold text-[var(--foreground)]">Hosted Journals</p>
        <Button size="sm" onClick={() => setModalState({ type: "edit", mode: "create" })}>
          Create Journal
        </Button>
      </div>

      {feedback && (
        <div className="border-b border-[var(--border)] px-4 py-3">
          <FormMessage tone={feedback.tone}>{feedback.message}</FormMessage>
        </div>
      )}

      {emptyState ? (
        <div className="px-6 py-10 text-center text-sm text-[var(--muted)]">
          Belum ada jurnal yang di-host. Gunakan tombol <strong>Create Journal</strong> untuk menambahkan.
        </div>
      ) : (
        <table className="min-w-full divide-y divide-[var(--border)]">
          <thead className="bg-[var(--surface-muted)]">
            <tr>
              <th className="w-12 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]" />
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Path
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                Visibility
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {journals.map((journal) => {
              const isExpanded = expandedRow === journal.id;
              return (
                <tr key={journal.id} className="group">
                  <td className="align-top px-4 py-3">
                    <button
                      className="rounded border border-transparent p-1 text-[var(--muted)] transition-colors hover:border-[var(--border)]"
                      aria-expanded={isExpanded}
                      aria-controls={`journal-${journal.id}-details`}
                      onClick={() => setExpandedRow(isExpanded ? null : journal.id)}
                    >
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm font-semibold text-[var(--foreground)]">{journal.name}</div>
                    <p className="mt-1 text-sm text-[var(--muted)]">{journal.description}</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--foreground)]">{journal.path}</td>
                  <td className="px-4 py-4">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                      {journal.isPublic ? (
                        <>
                          <Globe2 size={14} /> Public
                        </>
                      ) : (
                        <>
                          <Lock size={14} /> Private
                        </>
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    {isExpanded && (
                      <div
                        id={`journal-${journal.id}-details`}
                        className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm"
                      >
                        <Tabs
                          defaultValue={
                            modalState?.type === "edit" && modalState.journal?.id === journal.id
                              ? "edit"
                              : modalState?.type === "settings" && modalState.journal.id === journal.id
                              ? "wizard"
                              : modalState?.type === "users" && modalState.journal.id === journal.id
                              ? "users"
                              : "edit"
                          }
                          onValueChange={(tabId) => {
                            if (tabId === "edit") {
                              setModalState({ type: "edit", journal, mode: "edit" });
                            } else if (tabId === "wizard") {
                              setModalState({ type: "settings", journal });
                            } else if (tabId === "users") {
                              setModalState({ type: "users", journal });
                            } else if (tabId === "remove") {
                              setDeleteTarget(journal);
                              setExpandedRow(null);
                            }
                          }}
                        >
                          <TabsList>
                            <TabsTrigger value="edit">Edit</TabsTrigger>
                            <TabsTrigger value="remove">Delete</TabsTrigger>
                            <TabsTrigger value="wizard">Settings Wizard</TabsTrigger>
                            <TabsTrigger value="users">Users</TabsTrigger>
                          </TabsList>
                        </Tabs>
                        <div className="mt-4 grid gap-2 text-sm text-[var(--muted)]">
                          <p>
                            Pilih tindakan untuk <strong>{journal.name}</strong>.
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" onClick={() => setModalState({ type: "edit", journal, mode: "edit" })}>
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => setDeleteTarget(journal)}
                            >
                              Delete
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setModalState({ type: "settings", journal })}
                            >
                              Settings Wizard
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setModalState({ type: "users", journal })}
                            >
                              Users
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {modalState?.type === "edit" && (
        <Modal
          open
          onClose={closeModals}
          title={modalState.mode === "create" ? "Create Journal" : "Edit Journal"}
          description={
            modalState.mode === "create"
              ? "Tambahkan jurnal baru ke instalasi OJS Anda."
              : "Perbarui informasi dasar jurnal Anda."
          }
        >
          <JournalEditForm
            journal={modalState.journal}
            mode={modalState.mode}
            onCancel={closeModals}
            onSuccess={() =>
              handleSuccess(
                modalState.mode === "create"
                  ? "Jurnal berhasil dibuat."
                  : "Perubahan jurnal berhasil disimpan.",
              )
            }
          />
        </Modal>
      )}

      {modalState?.type === "settings" && modalState.journal && (
        <Modal
          open
          onClose={closeModals}
          title="Settings Wizard"
          widthClassName="max-w-6xl"
          footer={
            <Button variant="secondary" onClick={closeModals}>
              Tutup
            </Button>
          }
        >
          <JournalSettingsWizard journal={modalState.journal} />
        </Modal>
      )}

      {modalState?.type === "users" && modalState.journal && (
        <Modal
          open
          onClose={closeModals}
          title="Users"
          description="Kelola pengguna yang memiliki akses ke jurnal ini."
          widthClassName="max-w-4xl"
          footer={
            <Button variant="secondary" onClick={closeModals}>
              Selesai
            </Button>
          }
        >
          <JournalUsersPanel journal={modalState.journal} />
        </Modal>
      )}

      {deleteTarget && (
        <Modal
          open
          onClose={closeModals}
          title="Hapus Jurnal"
          description="Tindakan ini tidak dapat dibatalkan. Seluruh konten jurnal akan dihapus permanen."
          footer={
            <>
              <Button variant="secondary" onClick={closeModals} disabled={isDeleting}>
                Batal
              </Button>
              <Button
                variant="danger"
                loading={isDeleting}
                onClick={() =>
                  startDelete(async () => {
                    const result = await deleteJournalAction(deleteTarget.id);
                    if (!result.success) {
                      handleError(result.message);
                      return;
                    }
                    handleSuccess("Jurnal berhasil dihapus.");
                  })
                }
              >
                Ya, Hapus
              </Button>
            </>
          }
        >
          <p className="text-sm text-[var(--foreground)]">
            Apakah Anda yakin ingin menghapus jurnal{" "}
            <strong>{deleteTarget.name}</strong> beserta seluruh kontennya?
          </p>
        </Modal>
      )}
    </div>
  );
}

