"use client";

import { ChevronDown, ChevronRight, Globe2, Lock, Settings2 } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useTransition, useEffect } from "react";
import { createPortal } from "react-dom";

import { deleteJournalAction } from "@/app/(admin)/admin/site-management/hosted-journals/actions";

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

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  useEffect(() => {
    if (modalState || deleteTarget) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [modalState, deleteTarget]);

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
    <div style={{
      overflow: 'hidden',
      borderRadius: '4px',
      border: '1px solid #e5e5e5',
      backgroundColor: '#fff',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #e5e5e5',
        backgroundColor: '#f9fafb',
        padding: '1rem 1.5rem'
      }}>
        <p style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: '#002C40',
          margin: 0
        }}>
          Hosted Journals
        </p>
        <button
          onClick={() => setModalState({ type: "edit", mode: "create" })}
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            padding: '0.375rem 0.75rem',
            backgroundColor: '#006798',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Create Journal
        </button>
      </div>

      {feedback && (
        <div style={{
          borderBottom: '1px solid #e5e5e5',
          padding: '1rem 1.5rem',
          backgroundColor: feedback.tone === 'success' ? '#d4edda' : '#f8d7da'
        }}>
          <p style={{
            fontSize: '0.875rem',
            color: feedback.tone === 'success' ? '#155724' : '#721c24',
            margin: 0
          }}>
            {feedback.message}
          </p>
        </div>
      )}

      {emptyState ? (
        <div style={{
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          fontSize: '1rem',
          color: '#666'
        }}>
          Belum ada jurnal yang di-host. Gunakan tombol <strong>Create Journal</strong> untuk menambahkan.
        </div>
      ) : (
        <table style={{
          width: '100%',
          borderCollapse: 'collapse'
        }}>
          <thead style={{
            backgroundColor: '#f9fafb'
          }}>
            <tr>
              <th style={{
                width: '3rem',
                padding: '1rem 1.5rem',
                textAlign: 'left',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#666'
              }} />
              <th style={{
                padding: '1rem 1.5rem',
                textAlign: 'left',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#666'
              }}>
                Name
              </th>
              <th style={{
                padding: '1rem 1.5rem',
                textAlign: 'left',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#666'
              }}>
                Path
              </th>
              <th style={{
                padding: '1rem 1.5rem',
                textAlign: 'left',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: '#666'
              }}>
                Visibility
              </th>
              <th style={{
                padding: '1rem 1.5rem'
              }} />
            </tr>
          </thead>
          <tbody style={{
            backgroundColor: '#fff'
          }}>
            {journals.map((journal) => {
              const isExpanded = expandedRow === journal.id;
              return [
                <tr key={journal.id}>
                  <td style={{
                    padding: '1rem 1.5rem',
                    verticalAlign: 'top'
                  }}>
                    <button
                      type="button"
                      onClick={() => setExpandedRow(isExpanded ? null : journal.id)}
                      aria-expanded={isExpanded}
                      aria-controls={`journal-${journal.id}-details`}
                      style={{
                        padding: '0.25rem',
                        border: '1px solid transparent',
                        borderRadius: '4px',
                        color: '#666',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#dee2e6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = 'transparent';
                      }}
                    >
                      {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </button>
                  </td>
                  <td style={{
                    padding: '1rem 1.5rem'
                  }}>
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#002C40',
                      marginBottom: '0.25rem'
                    }}>
                      {journal.name}
                    </div>
                    <p style={{
                      marginTop: '0.25rem',
                      fontSize: '0.875rem',
                      color: '#666',
                      margin: 0
                    }}>
                      {journal.description}
                    </p>
                  </td>
                  <td style={{
                    padding: '1rem 1.5rem',
                    fontSize: '1rem',
                    color: '#002C40'
                  }}>
                    {journal.path}
                  </td>
                  <td style={{
                    padding: '1rem 1.5rem'
                  }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      backgroundColor: '#f3f4f6',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                      color: '#374151'
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
                  <td style={{
                    padding: '1rem 1.5rem'
                  }} />
                </tr>,
                isExpanded && (
                  <tr key={`${journal.id}-details`} id={`journal-${journal.id}-details`}>
                    <td colSpan={5} style={{
                      padding: '1rem 1.5rem',
                      backgroundColor: '#f9fafb',
                      borderTop: '1px solid #e5e5e5'
                    }}>
                      <div style={{
                        padding: '1rem 1.5rem',
                        borderRadius: '4px',
                        border: '1px solid #e5e5e5',
                        backgroundColor: '#fff'
                      }}>
                        <div style={{
                          marginBottom: '1rem',
                          fontSize: '1rem',
                          color: '#666'
                        }}>
                          <p style={{ margin: '0 0 0.75rem 0' }}>
                            Pilih tindakan untuk <strong>{journal.name}</strong>.
                          </p>
                          <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '0.5rem'
                          }}>
                            <button
                              type="button"
                              onClick={() => setModalState({ type: "edit", journal, mode: "edit" })}
                              style={{
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                padding: '0.375rem 0.75rem',
                                backgroundColor: '#006798',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteTarget(journal);
                                setExpandedRow(null);
                              }}
                              style={{
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                padding: '0.375rem 0.75rem',
                                backgroundColor: '#d32f2f',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              Delete
                            </button>
                            <Link
                              href={`/admin/wizard/${journal.id}`}
                              style={{
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                padding: '0.375rem 0.75rem',
                                backgroundColor: '#f8f9fa',
                                color: '#006798',
                                border: '1px solid #dee2e6',
                                borderRadius: '4px',
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}
                            >
                              <Settings2 size={14} />
                              Settings Wizard
                            </Link>
                            <button
                              type="button"
                              onClick={() => setModalState({ type: "users", journal })}
                              style={{
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                padding: '0.375rem 0.75rem',
                                backgroundColor: 'transparent',
                                color: '#006798',
                                border: '1px solid #dee2e6',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              Users
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              ];
            })}
          </tbody>
        </table>
      )}

      {/* Modals using createPortal */}
      {typeof document !== 'undefined' && (
        <>
          {/* Edit/Create Modal */}
          {modalState?.type === "edit" && createPortal(
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem'
              }}
              onClick={closeModals}
            >
              <div
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '4px',
                  maxWidth: '48rem',
                  width: '100%',
                  maxHeight: '90vh',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #e5e5e5',
                  padding: '1.5rem'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      color: '#002C40',
                      margin: '0 0 0.25rem 0'
                    }}>
                      {modalState.mode === "create" ? "Create Journal" : "Edit Journal"}
                    </h3>
                    <p style={{
                      marginTop: '0.25rem',
                      fontSize: '0.875rem',
                      color: '#666',
                      margin: 0
                    }}>
                      {modalState.mode === "create"
                        ? "Tambahkan jurnal baru ke instalasi OJS Anda."
                        : "Perbarui informasi dasar jurnal Anda."}
                    </p>
                  </div>
                  <button
                    onClick={closeModals}
                    type="button"
                    style={{
                      fontSize: '1.5rem',
                      color: '#666',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      lineHeight: 1
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '1.25rem 1.5rem'
                }}>
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
                </div>
              </div>
            </div>,
            document.body
          )}

          {/* Settings Modal */}
          {modalState?.type === "settings" && modalState.journal && createPortal(
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem'
              }}
              onClick={closeModals}
            >
              <div
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '4px',
                  maxWidth: '72rem',
                  width: '100%',
                  maxHeight: '90vh',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #e5e5e5',
                  padding: '1.5rem'
                }}>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#002C40',
                    margin: 0
                  }}>
                    Settings Wizard
                  </h3>
                  <button
                    onClick={closeModals}
                    type="button"
                    style={{
                      fontSize: '1.5rem',
                      color: '#666',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      lineHeight: 1
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '1.25rem 1.5rem'
                }}>
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
                </div>
                <div style={{
                  borderTop: '1px solid #e5e5e5',
                  padding: '1rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    onClick={closeModals}
                    type="button"
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      padding: '0.5rem 1rem',
                      backgroundColor: '#f8f9fa',
                      color: '#006798',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

          {/* Users Modal */}
          {modalState?.type === "users" && modalState.journal && createPortal(
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem'
              }}
              onClick={closeModals}
            >
              <div
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '4px',
                  maxWidth: '64rem',
                  width: '100%',
                  maxHeight: '90vh',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #e5e5e5',
                  padding: '1.5rem'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      color: '#002C40',
                      margin: '0 0 0.25rem 0'
                    }}>
                      Users
                    </h3>
                    <p style={{
                      marginTop: '0.25rem',
                      fontSize: '0.875rem',
                      color: '#666',
                      margin: 0
                    }}>
                      Kelola pengguna yang memiliki akses ke jurnal ini.
                    </p>
                  </div>
                  <button
                    onClick={closeModals}
                    type="button"
                    style={{
                      fontSize: '1.5rem',
                      color: '#666',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      lineHeight: 1
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '1.25rem 1.5rem'
                }}>
                  <JournalUsersPanel journal={modalState.journal} />
                </div>
                <div style={{
                  borderTop: '1px solid #e5e5e5',
                  padding: '1rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    onClick={closeModals}
                    type="button"
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      padding: '0.5rem 1rem',
                      backgroundColor: '#f8f9fa',
                      color: '#006798',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Selesai
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

          {/* Delete Confirmation Modal */}
          {deleteTarget && createPortal(
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem'
              }}
              onClick={closeModals}
            >
              <div
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '4px',
                  maxWidth: '32rem',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #e5e5e5',
                  padding: '1.5rem'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      color: '#002C40',
                      margin: '0 0 0.25rem 0'
                    }}>
                      Hapus Jurnal
                    </h3>
                    <p style={{
                      marginTop: '0.25rem',
                      fontSize: '0.875rem',
                      color: '#666',
                      margin: 0
                    }}>
                      Tindakan ini tidak dapat dibatalkan. Seluruh konten jurnal akan dihapus permanen.
                    </p>
                  </div>
                  <button
                    onClick={closeModals}
                    type="button"
                    style={{
                      fontSize: '1.5rem',
                      color: '#666',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      lineHeight: 1
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{
                  padding: '1.25rem 1.5rem'
                }}>
                  <p style={{
                    fontSize: '1rem',
                    color: '#002C40',
                    margin: 0
                  }}>
                    Apakah Anda yakin ingin menghapus jurnal{" "}
                    <strong>{deleteTarget.name}</strong> beserta seluruh kontennya?
                  </p>
                </div>
                <div style={{
                  borderTop: '1px solid #e5e5e5',
                  padding: '1rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.5rem'
                }}>
                  <button
                    onClick={closeModals}
                    disabled={isDeleting}
                    type="button"
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      padding: '0.5rem 1rem',
                      backgroundColor: '#f8f9fa',
                      color: '#006798',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      cursor: isDeleting ? 'not-allowed' : 'pointer',
                      opacity: isDeleting ? 0.6 : 1
                    }}
                  >
                    Batal
                  </button>
                  <button
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
                    disabled={isDeleting}
                    type="button"
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      padding: '0.5rem 1rem',
                      backgroundColor: isDeleting ? '#ccc' : '#d32f2f',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: isDeleting ? 'not-allowed' : 'pointer',
                      opacity: isDeleting ? 0.6 : 1
                    }}
                  >
                    {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
        </>
      )}
    </div>
  );
}

                              Settings Wizard
                            </Link>
                            <button
                              type="button"
                              onClick={() => setModalState({ type: "users", journal })}
                              style={{
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                padding: '0.375rem 0.75rem',
                                backgroundColor: 'transparent',
                                color: '#006798',
                                border: '1px solid #dee2e6',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              Users
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              ];
            })}
          </tbody>
        </table>
      )}

      {/* Modals using createPortal */}
      {typeof document !== 'undefined' && (
        <>
          {/* Edit/Create Modal */}
          {modalState?.type === "edit" && createPortal(
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem'
              }}
              onClick={closeModals}
            >
              <div
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '4px',
                  maxWidth: '48rem',
                  width: '100%',
                  maxHeight: '90vh',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #e5e5e5',
                  padding: '1.5rem'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      color: '#002C40',
                      margin: '0 0 0.25rem 0'
                    }}>
                      {modalState.mode === "create" ? "Create Journal" : "Edit Journal"}
                    </h3>
                    <p style={{
                      marginTop: '0.25rem',
                      fontSize: '0.875rem',
                      color: '#666',
                      margin: 0
                    }}>
                      {modalState.mode === "create"
                        ? "Tambahkan jurnal baru ke instalasi OJS Anda."
                        : "Perbarui informasi dasar jurnal Anda."}
                    </p>
                  </div>
                  <button
                    onClick={closeModals}
                    type="button"
                    style={{
                      fontSize: '1.5rem',
                      color: '#666',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      lineHeight: 1
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '1.25rem 1.5rem'
                }}>
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
                </div>
              </div>
            </div>,
            document.body
          )}

          {/* Settings Modal */}
          {modalState?.type === "settings" && modalState.journal && createPortal(
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem'
              }}
              onClick={closeModals}
            >
              <div
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '4px',
                  maxWidth: '72rem',
                  width: '100%',
                  maxHeight: '90vh',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #e5e5e5',
                  padding: '1.5rem'
                }}>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#002C40',
                    margin: 0
                  }}>
                    Settings Wizard
                  </h3>
                  <button
                    onClick={closeModals}
                    type="button"
                    style={{
                      fontSize: '1.5rem',
                      color: '#666',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      lineHeight: 1
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '1.25rem 1.5rem'
                }}>
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
                </div>
                <div style={{
                  borderTop: '1px solid #e5e5e5',
                  padding: '1rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    onClick={closeModals}
                    type="button"
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      padding: '0.5rem 1rem',
                      backgroundColor: '#f8f9fa',
                      color: '#006798',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

          {/* Users Modal */}
          {modalState?.type === "users" && modalState.journal && createPortal(
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem'
              }}
              onClick={closeModals}
            >
              <div
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '4px',
                  maxWidth: '64rem',
                  width: '100%',
                  maxHeight: '90vh',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #e5e5e5',
                  padding: '1.5rem'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      color: '#002C40',
                      margin: '0 0 0.25rem 0'
                    }}>
                      Users
                    </h3>
                    <p style={{
                      marginTop: '0.25rem',
                      fontSize: '0.875rem',
                      color: '#666',
                      margin: 0
                    }}>
                      Kelola pengguna yang memiliki akses ke jurnal ini.
                    </p>
                  </div>
                  <button
                    onClick={closeModals}
                    type="button"
                    style={{
                      fontSize: '1.5rem',
                      color: '#666',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      lineHeight: 1
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '1.25rem 1.5rem'
                }}>
                  <JournalUsersPanel journal={modalState.journal} />
                </div>
                <div style={{
                  borderTop: '1px solid #e5e5e5',
                  padding: '1rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    onClick={closeModals}
                    type="button"
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      padding: '0.5rem 1rem',
                      backgroundColor: '#f8f9fa',
                      color: '#006798',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Selesai
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

          {/* Delete Confirmation Modal */}
          {deleteTarget && createPortal(
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem'
              }}
              onClick={closeModals}
            >
              <div
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '4px',
                  maxWidth: '32rem',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #e5e5e5',
                  padding: '1.5rem'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      color: '#002C40',
                      margin: '0 0 0.25rem 0'
                    }}>
                      Hapus Jurnal
                    </h3>
                    <p style={{
                      marginTop: '0.25rem',
                      fontSize: '0.875rem',
                      color: '#666',
                      margin: 0
                    }}>
                      Tindakan ini tidak dapat dibatalkan. Seluruh konten jurnal akan dihapus permanen.
                    </p>
                  </div>
                  <button
                    onClick={closeModals}
                    type="button"
                    style={{
                      fontSize: '1.5rem',
                      color: '#666',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      lineHeight: 1
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{
                  padding: '1.25rem 1.5rem'
                }}>
                  <p style={{
                    fontSize: '1rem',
                    color: '#002C40',
                    margin: 0
                  }}>
                    Apakah Anda yakin ingin menghapus jurnal{" "}
                    <strong>{deleteTarget.name}</strong> beserta seluruh kontennya?
                  </p>
                </div>
                <div style={{
                  borderTop: '1px solid #e5e5e5',
                  padding: '1rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.5rem'
                }}>
                  <button
                    onClick={closeModals}
                    disabled={isDeleting}
                    type="button"
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      padding: '0.5rem 1rem',
                      backgroundColor: '#f8f9fa',
                      color: '#006798',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      cursor: isDeleting ? 'not-allowed' : 'pointer',
                      opacity: isDeleting ? 0.6 : 1
                    }}
                  >
                    Batal
                  </button>
                  <button
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
                    disabled={isDeleting}
                    type="button"
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      padding: '0.5rem 1rem',
                      backgroundColor: isDeleting ? '#ccc' : '#d32f2f',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: isDeleting ? 'not-allowed' : 'pointer',
                      opacity: isDeleting ? 0.6 : 1
                    }}
                  >
                    {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
        </>
      )}
    </div>
  );
}

                              Settings Wizard
                            </Link>
                            <button
                              type="button"
                              onClick={() => setModalState({ type: "users", journal })}
                              style={{
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                padding: '0.375rem 0.75rem',
                                backgroundColor: 'transparent',
                                color: '#006798',
                                border: '1px solid #dee2e6',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              Users
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              ];
            })}
          </tbody>
        </table>
      )}

      {/* Modals using createPortal */}
      {typeof document !== 'undefined' && (
        <>
          {/* Edit/Create Modal */}
          {modalState?.type === "edit" && createPortal(
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem'
              }}
              onClick={closeModals}
            >
              <div
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '4px',
                  maxWidth: '48rem',
                  width: '100%',
                  maxHeight: '90vh',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #e5e5e5',
                  padding: '1.5rem'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      color: '#002C40',
                      margin: '0 0 0.25rem 0'
                    }}>
                      {modalState.mode === "create" ? "Create Journal" : "Edit Journal"}
                    </h3>
                    <p style={{
                      marginTop: '0.25rem',
                      fontSize: '0.875rem',
                      color: '#666',
                      margin: 0
                    }}>
                      {modalState.mode === "create"
                        ? "Tambahkan jurnal baru ke instalasi OJS Anda."
                        : "Perbarui informasi dasar jurnal Anda."}
                    </p>
                  </div>
                  <button
                    onClick={closeModals}
                    type="button"
                    style={{
                      fontSize: '1.5rem',
                      color: '#666',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      lineHeight: 1
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '1.25rem 1.5rem'
                }}>
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
                </div>
              </div>
            </div>,
            document.body
          )}

          {/* Settings Modal */}
          {modalState?.type === "settings" && modalState.journal && createPortal(
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem'
              }}
              onClick={closeModals}
            >
              <div
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '4px',
                  maxWidth: '72rem',
                  width: '100%',
                  maxHeight: '90vh',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #e5e5e5',
                  padding: '1.5rem'
                }}>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#002C40',
                    margin: 0
                  }}>
                    Settings Wizard
                  </h3>
                  <button
                    onClick={closeModals}
                    type="button"
                    style={{
                      fontSize: '1.5rem',
                      color: '#666',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      lineHeight: 1
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '1.25rem 1.5rem'
                }}>
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
                </div>
                <div style={{
                  borderTop: '1px solid #e5e5e5',
                  padding: '1rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    onClick={closeModals}
                    type="button"
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      padding: '0.5rem 1rem',
                      backgroundColor: '#f8f9fa',
                      color: '#006798',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

          {/* Users Modal */}
          {modalState?.type === "users" && modalState.journal && createPortal(
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem'
              }}
              onClick={closeModals}
            >
              <div
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '4px',
                  maxWidth: '64rem',
                  width: '100%',
                  maxHeight: '90vh',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #e5e5e5',
                  padding: '1.5rem'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      color: '#002C40',
                      margin: '0 0 0.25rem 0'
                    }}>
                      Users
                    </h3>
                    <p style={{
                      marginTop: '0.25rem',
                      fontSize: '0.875rem',
                      color: '#666',
                      margin: 0
                    }}>
                      Kelola pengguna yang memiliki akses ke jurnal ini.
                    </p>
                  </div>
                  <button
                    onClick={closeModals}
                    type="button"
                    style={{
                      fontSize: '1.5rem',
                      color: '#666',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      lineHeight: 1
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '1.25rem 1.5rem'
                }}>
                  <JournalUsersPanel journal={modalState.journal} />
                </div>
                <div style={{
                  borderTop: '1px solid #e5e5e5',
                  padding: '1rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    onClick={closeModals}
                    type="button"
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      padding: '0.5rem 1rem',
                      backgroundColor: '#f8f9fa',
                      color: '#006798',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Selesai
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

          {/* Delete Confirmation Modal */}
          {deleteTarget && createPortal(
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem'
              }}
              onClick={closeModals}
            >
              <div
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '4px',
                  maxWidth: '32rem',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #e5e5e5',
                  padding: '1.5rem'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      color: '#002C40',
                      margin: '0 0 0.25rem 0'
                    }}>
                      Hapus Jurnal
                    </h3>
                    <p style={{
                      marginTop: '0.25rem',
                      fontSize: '0.875rem',
                      color: '#666',
                      margin: 0
                    }}>
                      Tindakan ini tidak dapat dibatalkan. Seluruh konten jurnal akan dihapus permanen.
                    </p>
                  </div>
                  <button
                    onClick={closeModals}
                    type="button"
                    style={{
                      fontSize: '1.5rem',
                      color: '#666',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      lineHeight: 1
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{
                  padding: '1.25rem 1.5rem'
                }}>
                  <p style={{
                    fontSize: '1rem',
                    color: '#002C40',
                    margin: 0
                  }}>
                    Apakah Anda yakin ingin menghapus jurnal{" "}
                    <strong>{deleteTarget.name}</strong> beserta seluruh kontennya?
                  </p>
                </div>
                <div style={{
                  borderTop: '1px solid #e5e5e5',
                  padding: '1rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.5rem'
                }}>
                  <button
                    onClick={closeModals}
                    disabled={isDeleting}
                    type="button"
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      padding: '0.5rem 1rem',
                      backgroundColor: '#f8f9fa',
                      color: '#006798',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      cursor: isDeleting ? 'not-allowed' : 'pointer',
                      opacity: isDeleting ? 0.6 : 1
                    }}
                  >
                    Batal
                  </button>
                  <button
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
                    disabled={isDeleting}
                    type="button"
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      padding: '0.5rem 1rem',
                      backgroundColor: isDeleting ? '#ccc' : '#d32f2f',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: isDeleting ? 'not-allowed' : 'pointer',
                      opacity: isDeleting ? 0.6 : 1
                    }}
                  >
                    {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
        </>
      )}
    </div>
  );
}

                              Settings Wizard
                            </Link>
                            <button
                              type="button"
                              onClick={() => setModalState({ type: "users", journal })}
                              style={{
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                padding: '0.375rem 0.75rem',
                                backgroundColor: 'transparent',
                                color: '#006798',
                                border: '1px solid #dee2e6',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              Users
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              ];
            })}
          </tbody>
        </table>
      )}

      {/* Modals using createPortal */}
      {typeof document !== 'undefined' && (
        <>
          {/* Edit/Create Modal */}
          {modalState?.type === "edit" && createPortal(
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem'
              }}
              onClick={closeModals}
            >
              <div
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '4px',
                  maxWidth: '48rem',
                  width: '100%',
                  maxHeight: '90vh',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #e5e5e5',
                  padding: '1.5rem'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      color: '#002C40',
                      margin: '0 0 0.25rem 0'
                    }}>
                      {modalState.mode === "create" ? "Create Journal" : "Edit Journal"}
                    </h3>
                    <p style={{
                      marginTop: '0.25rem',
                      fontSize: '0.875rem',
                      color: '#666',
                      margin: 0
                    }}>
                      {modalState.mode === "create"
                        ? "Tambahkan jurnal baru ke instalasi OJS Anda."
                        : "Perbarui informasi dasar jurnal Anda."}
                    </p>
                  </div>
                  <button
                    onClick={closeModals}
                    type="button"
                    style={{
                      fontSize: '1.5rem',
                      color: '#666',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      lineHeight: 1
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '1.25rem 1.5rem'
                }}>
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
                </div>
              </div>
            </div>,
            document.body
          )}

          {/* Settings Modal */}
          {modalState?.type === "settings" && modalState.journal && createPortal(
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem'
              }}
              onClick={closeModals}
            >
              <div
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '4px',
                  maxWidth: '72rem',
                  width: '100%',
                  maxHeight: '90vh',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #e5e5e5',
                  padding: '1.5rem'
                }}>
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#002C40',
                    margin: 0
                  }}>
                    Settings Wizard
                  </h3>
                  <button
                    onClick={closeModals}
                    type="button"
                    style={{
                      fontSize: '1.5rem',
                      color: '#666',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      lineHeight: 1
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '1.25rem 1.5rem'
                }}>
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
                </div>
                <div style={{
                  borderTop: '1px solid #e5e5e5',
                  padding: '1rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    onClick={closeModals}
                    type="button"
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      padding: '0.5rem 1rem',
                      backgroundColor: '#f8f9fa',
                      color: '#006798',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

          {/* Users Modal */}
          {modalState?.type === "users" && modalState.journal && createPortal(
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem'
              }}
              onClick={closeModals}
            >
              <div
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '4px',
                  maxWidth: '64rem',
                  width: '100%',
                  maxHeight: '90vh',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #e5e5e5',
                  padding: '1.5rem'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      color: '#002C40',
                      margin: '0 0 0.25rem 0'
                    }}>
                      Users
                    </h3>
                    <p style={{
                      marginTop: '0.25rem',
                      fontSize: '0.875rem',
                      color: '#666',
                      margin: 0
                    }}>
                      Kelola pengguna yang memiliki akses ke jurnal ini.
                    </p>
                  </div>
                  <button
                    onClick={closeModals}
                    type="button"
                    style={{
                      fontSize: '1.5rem',
                      color: '#666',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      lineHeight: 1
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '1.25rem 1.5rem'
                }}>
                  <JournalUsersPanel journal={modalState.journal} />
                </div>
                <div style={{
                  borderTop: '1px solid #e5e5e5',
                  padding: '1rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    onClick={closeModals}
                    type="button"
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      padding: '0.5rem 1rem',
                      backgroundColor: '#f8f9fa',
                      color: '#006798',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Selesai
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}

          {/* Delete Confirmation Modal */}
          {deleteTarget && createPortal(
            <div
              style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                padding: '1rem'
              }}
              onClick={closeModals}
            >
              <div
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '4px',
                  maxWidth: '32rem',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid #e5e5e5',
                  padding: '1.5rem'
                }}>
                  <div>
                    <h3 style={{
                      fontSize: '1.125rem',
                      fontWeight: 600,
                      color: '#002C40',
                      margin: '0 0 0.25rem 0'
                    }}>
                      Hapus Jurnal
                    </h3>
                    <p style={{
                      marginTop: '0.25rem',
                      fontSize: '0.875rem',
                      color: '#666',
                      margin: 0
                    }}>
                      Tindakan ini tidak dapat dibatalkan. Seluruh konten jurnal akan dihapus permanen.
                    </p>
                  </div>
                  <button
                    onClick={closeModals}
                    type="button"
                    style={{
                      fontSize: '1.5rem',
                      color: '#666',
                      backgroundColor: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '0.25rem',
                      lineHeight: 1
                    }}
                  >
                    ✕
                  </button>
                </div>
                <div style={{
                  padding: '1.25rem 1.5rem'
                }}>
                  <p style={{
                    fontSize: '1rem',
                    color: '#002C40',
                    margin: 0
                  }}>
                    Apakah Anda yakin ingin menghapus jurnal{" "}
                    <strong>{deleteTarget.name}</strong> beserta seluruh kontennya?
                  </p>
                </div>
                <div style={{
                  borderTop: '1px solid #e5e5e5',
                  padding: '1rem 1.5rem',
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.5rem'
                }}>
                  <button
                    onClick={closeModals}
                    disabled={isDeleting}
                    type="button"
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      padding: '0.5rem 1rem',
                      backgroundColor: '#f8f9fa',
                      color: '#006798',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      cursor: isDeleting ? 'not-allowed' : 'pointer',
                      opacity: isDeleting ? 0.6 : 1
                    }}
                  >
                    Batal
                  </button>
                  <button
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
                    disabled={isDeleting}
                    type="button"
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      padding: '0.5rem 1rem',
                      backgroundColor: isDeleting ? '#ccc' : '#d32f2f',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: isDeleting ? 'not-allowed' : 'pointer',
                      opacity: isDeleting ? 0.6 : 1
                    }}
                  >
                    {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
        </>
      )}
    </div>
  );
}
