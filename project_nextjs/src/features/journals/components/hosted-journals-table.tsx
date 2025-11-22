"use client";

import { ChevronDown, ChevronRight, Globe2, Lock, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-6 py-4" style={{
        padding: '1rem 1.5rem'
      }}>
        <p className="text-base font-semibold text-gray-900" style={{
          fontSize: '1rem',
          fontWeight: '600'
        }}>Hosted Journals</p>
        <Button size="sm" onClick={() => setModalState({ type: "edit", mode: "create" })}>
          Create Journal
        </Button>
      </div>

      {feedback && (
        <div className="border-b border-gray-200 px-6 py-4" style={{
          padding: '1rem 1.5rem'
        }}>
          <FormMessage tone={feedback.tone}>{feedback.message}</FormMessage>
        </div>
      )}

      {emptyState ? (
        <div className="px-6 py-10 text-center text-base text-gray-600" style={{
          padding: '2.5rem 1.5rem',
          fontSize: '1rem'
        }}>
          Belum ada jurnal yang di-host. Gunakan tombol <strong>Create Journal</strong> untuk menambahkan.
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-12 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600" style={{
                padding: '1rem 1.5rem',
                fontSize: '0.75rem'
              }} />
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600" style={{
                padding: '1rem 1.5rem',
                fontSize: '0.75rem'
              }}>
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600" style={{
                padding: '1rem 1.5rem',
                fontSize: '0.75rem'
              }}>
                Path
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-gray-600" style={{
                padding: '1rem 1.5rem',
                fontSize: '0.75rem'
              }}>
                Visibility
              </th>
              <th className="px-6 py-4" style={{
                padding: '1rem 1.5rem'
              }} />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {journals.map((journal) => {
              const isExpanded = expandedRow === journal.id;
              return (
                <tr key={journal.id} className="group">
                  <td className="align-top px-6 py-4" style={{
                    padding: '1rem 1.5rem'
                  }}>
                    <button
                      className="rounded border border-transparent p-1 text-gray-600 transition-colors hover:border-gray-300"
                      aria-expanded={isExpanded}
                      aria-controls={`journal-${journal.id}-details`}
                      onClick={() => setExpandedRow(isExpanded ? null : journal.id)}
                    >
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                  </td>
                  <td className="px-6 py-4" style={{
                    padding: '1rem 1.5rem'
                  }}>
                    <div className="text-base font-semibold text-gray-900" style={{
                      fontSize: '1rem',
                      fontWeight: '600'
                    }}>{journal.name}</div>
                    <p className="mt-1 text-sm text-gray-600" style={{
                      marginTop: '0.25rem',
                      fontSize: '0.875rem'
                    }}>{journal.description}</p>
                  </td>
                  <td className="px-6 py-4 text-base text-gray-900" style={{
                    padding: '1rem 1.5rem',
                    fontSize: '1rem'
                  }}>{journal.path}</td>
                  <td className="px-6 py-4" style={{
                    padding: '1rem 1.5rem'
                  }}>
                    <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gray-700" style={{
                      padding: '0.25rem 0.75rem',
                      fontSize: '0.75rem'
                    }}>
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
                  <td className="px-6 py-4" style={{
                    padding: '1rem 1.5rem'
                  }}>
                    {isExpanded && (
                      <div
                        id={`journal-${journal.id}-details`}
                        className="rounded-md border border-gray-200 bg-gray-50 px-6 py-4"
                        style={{
                          padding: '1rem 1.5rem'
                        }}
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
                        <div className="mt-4 grid gap-2 text-base text-gray-600" style={{
                          marginTop: '1rem',
                          gap: '0.5rem',
                          fontSize: '1rem'
                        }}>
                          <p>
                            Pilih tindakan untuk <strong>{journal.name}</strong>.
                          </p>
                          <div className="flex flex-wrap gap-2" style={{
                            gap: '0.5rem'
                          }}>
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
                            <Link href={`/admin/wizard/${journal.id}`}>
                              <Button
                                size="sm"
                                variant="secondary"
                              >
                                <Settings2 size={14} className="mr-1" />
                                Settings Wizard
                              </Button>
                            </Link>
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
          <JournalSettingsWizard 
            journalId={modalState.journal.id} 
            initialData={{
              id: modalState.journal.id,
              name: modalState.journal.name,
              path: modalState.journal.path,
              description: modalState.journal.description,
              settings: [],
            }}
          />
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
          <p className="text-base text-gray-900" style={{
            fontSize: '1rem'
          }}>
            Apakah Anda yakin ingin menghapus jurnal{" "}
            <strong>{deleteTarget.name}</strong> beserta seluruh kontennya?
          </p>
        </Modal>
      )}
    </div>
  );
}

