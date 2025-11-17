/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useMemo, useState, useTransition } from "react";

import { FormMessage } from "@/components/ui/form-message";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DEFAULT_JOURNAL_SETTINGS, JOURNAL_ROLE_OPTIONS, type JournalRoleValue, type JournalSettings } from "../types";

type Props = {
  journal: { id: string; name: string };
};

const TAB_LIST = ["context", "search-indexing", "theme", "restrict-bulk-emails"] as const;
type TabId = (typeof TAB_LIST)[number];

const TAB_LABELS: Record<TabId, string> = {
  context: "Context",
  "search-indexing": "Search Indexing",
  theme: "Theme",
  "restrict-bulk-emails": "Restrict Bulk Emails",
};

type SectionKey = keyof JournalSettings;
type SectionFeedback = Partial<Record<SectionKey, { status: "success" | "error"; message: string }>>;

export function JournalSettingsWizard({ journal }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>("context");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<SectionFeedback>({});

  const [contextForm, setContextForm] = useState(DEFAULT_JOURNAL_SETTINGS.context);
  const [searchForm, setSearchForm] = useState(DEFAULT_JOURNAL_SETTINGS.search);
  const [themeForm, setThemeForm] = useState(DEFAULT_JOURNAL_SETTINGS.theme);
  const [restrictForm, setRestrictForm] = useState(DEFAULT_JOURNAL_SETTINGS.restrictBulkEmails);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch(`/api/journals/${journal.id}/settings`)
      .then(async (res) => {
        if (!active) return;
        const json = await res.json();
        if (!json.ok) {
          setError(json.message ?? "Tidak dapat memuat pengaturan jurnal.");
          return;
        }
        setContextForm(json.settings.context);
        setSearchForm(json.settings.search);
        setThemeForm(json.settings.theme);
        setRestrictForm(json.settings.restrictBulkEmails);
        setError(null);
      })
      .catch(() => {
        if (!active) return;
        setError("Tidak dapat memuat pengaturan jurnal.");
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [journal.id]);

  const handleSave = (section: SectionKey, payload: unknown) => {
    setFeedback((prev) => ({ ...prev, [section]: undefined }));
    startTransition(async () => {
      try {
        const res = await fetch(`/api/journals/${journal.id}/settings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section, payload }),
        });
        const json = await res.json();
        if (!json.ok) {
          setFeedback((prev) => ({
            ...prev,
            [section]: { status: "error", message: json.message ?? "Gagal menyimpan pengaturan." },
          }));
          return;
        }
        setContextForm(json.settings.context);
        setSearchForm(json.settings.search);
        setThemeForm(json.settings.theme);
        setRestrictForm(json.settings.restrictBulkEmails);
        setFeedback((prev) => ({
          ...prev,
          [section]: { status: "success", message: "Pengaturan tersimpan." },
        }));
      } catch {
        setFeedback((prev) => ({
          ...prev,
          [section]: { status: "error", message: "Terjadi kesalahan jaringan." },
        }));
      }
    });
  };

  const restrictSelections = useMemo(() => new Set<JournalRoleValue>(restrictForm.disabledRoles as JournalRoleValue[]), [restrictForm]);

  if (loading) {
    return <div className="py-8 text-center text-sm text-[var(--muted)]">Memuat pengaturan jurnal…</div>;
  }

  if (error) {
    return <div className="rounded-md border border-[var(--border)] bg-[#fef2f2] px-4 py-3 text-sm text-[#b91c1c]">{error}</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabId)}>
        <TabsList>
          {TAB_LIST.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {TAB_LABELS[tab]}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] p-5">
        {activeTab === "context" && (
          <ContextTab
            form={contextForm}
            onChange={setContextForm}
            onSave={() => handleSave("context", contextForm)}
            pending={isPending}
            feedback={feedback.context}
          />
        )}
        {activeTab === "search-indexing" && (
          <SearchIndexingTab
            form={searchForm}
            onChange={setSearchForm}
            onSave={() => handleSave("search", searchForm)}
            pending={isPending}
            feedback={feedback.search}
          />
        )}
        {activeTab === "theme" && (
          <ThemeTab
            form={themeForm}
            onChange={setThemeForm}
            onSave={() => handleSave("theme", themeForm)}
            pending={isPending}
            feedback={feedback.theme}
          />
        )}
        {activeTab === "restrict-bulk-emails" && (
          <RestrictBulkEmailsTab
            selections={restrictSelections}
            toggleRole={(role) => {
              const next = new Set(restrictSelections);
              if (next.has(role)) {
                next.delete(role);
              } else {
                next.add(role);
              }
              const values = Array.from(next);
              setRestrictForm({ disabledRoles: values });
            }}
            onSave={() => handleSave("restrictBulkEmails", { disabledRoles: Array.from(restrictSelections) })}
            pending={isPending}
            feedback={feedback.restrictBulkEmails}
          />
        )}
      </div>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-lg border border-[var(--border)] bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-[var(--foreground)]">{title}</h3>
        {description && <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function ContextTab({
  form,
  onChange,
  onSave,
  pending,
  feedback,
}: {
  form: JournalSettings["context"];
  onChange: (next: JournalSettings["context"]) => void;
  onSave: () => void;
  pending: boolean;
  feedback?: { status: "success" | "error"; message: string };
}) {
  return (
    <div className="space-y-6">
      <Section title="Context" description="Pengaturan dasar jurnal.">
        <LabelInput label="Journal Name" required value={form.name} onChange={(e) => onChange({ ...form, name: e.target.value })} />
        <LabelInput label="Journal initials" value={form.initials} onChange={(e) => onChange({ ...form, initials: e.target.value })} />
        <LabelInput
          label="Journal abbreviation"
          value={form.abbreviation}
          onChange={(e) => onChange({ ...form, abbreviation: e.target.value })}
        />
        <LabelInput label="Publisher" value={form.publisher} onChange={(e) => onChange({ ...form, publisher: e.target.value })} />
        <div className="grid gap-4 md:grid-cols-2">
          <LabelInput label="Online ISSN" value={form.issnOnline} onChange={(e) => onChange({ ...form, issnOnline: e.target.value })} />
          <LabelInput label="Print ISSN" value={form.issnPrint} onChange={(e) => onChange({ ...form, issnPrint: e.target.value })} />
        </div>
      </Section>

      <Section title="Focus and Scope">
        <label className="block text-sm text-[var(--foreground)]">
          <span className="mb-2 block font-semibold">Focus and Scope</span>
          <textarea
            rows={5}
            value={form.focusScope}
            onChange={(e) => onChange({ ...form, focusScope: e.target.value })}
            className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm shadow-inner focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-muted)]"
          />
        </label>
      </Section>

      {feedback && <FormMessage tone={feedback.status}>{feedback.message}</FormMessage>}
      <div className="flex justify-end">
        <Button onClick={onSave} loading={pending} disabled={pending}>
          Simpan Context
        </Button>
      </div>
    </div>
  );
}

function SearchIndexingTab({
  form,
  onChange,
  onSave,
  pending,
  feedback,
}: {
  form: JournalSettings["search"];
  onChange: (next: JournalSettings["search"]) => void;
  onSave: () => void;
  pending: boolean;
  feedback?: { status: "success" | "error"; message: string };
}) {
  return (
    <div className="space-y-6">
      <Section title="Search Indexing">
        <label className="block text-sm text-[var(--foreground)]">
          <span className="mb-2 block font-semibold">Keywords</span>
          <textarea
            rows={3}
            value={form.keywords}
            onChange={(e) => onChange({ ...form, keywords: e.target.value })}
            className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm shadow-inner focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-muted)]"
          />
        </label>
        <label className="block text-sm text-[var(--foreground)]">
          <span className="mb-2 block font-semibold">Description</span>
          <textarea
            rows={4}
            value={form.description}
            onChange={(e) => onChange({ ...form, description: e.target.value })}
            className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm shadow-inner focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-muted)]"
          />
        </label>
      </Section>

      <Section title="Search Settings">
        <label className="flex items-start gap-3 rounded-md border border-[var(--border)] bg-white p-4 text-sm font-semibold">
          <input
            type="checkbox"
            checked={form.includeSupplemental}
            onChange={(e) => onChange({ ...form, includeSupplemental: e.target.checked })}
            className="mt-1 h-4 w-4 rounded border border-[var(--border)]"
          />
          <span className="text-[var(--foreground)]">Include supplemental files in search index</span>
        </label>
      </Section>

      {feedback && <FormMessage tone={feedback.status}>{feedback.message}</FormMessage>}
      <div className="flex justify-end">
        <Button onClick={onSave} loading={pending} disabled={pending}>
          Simpan Search Settings
        </Button>
      </div>
    </div>
  );
}

function ThemeTab({
  form,
  onChange,
  onSave,
  pending,
  feedback,
}: {
  form: JournalSettings["theme"];
  onChange: (next: JournalSettings["theme"]) => void;
  onSave: () => void;
  pending: boolean;
  feedback?: { status: "success" | "error"; message: string };
}) {
  return (
    <div className="space-y-6">
      <Section title="Theme" description="Pilih tampilan yang akan digunakan jurnal ini.">
        <label className="block text-sm text-[var(--foreground)]">
          <span className="mb-2 block font-semibold">Theme</span>
          <select
            value={form.theme}
            onChange={(e) => onChange({ ...form, theme: e.target.value })}
            className="h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm text-[var(--foreground)] shadow-inner focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-muted)]"
          >
            <option value="default">Default</option>
            <option value="classic">Classic</option>
            <option value="modern">Modern</option>
          </select>
        </label>
        <LabelInput
          label="Header background color"
          value={form.headerBg}
          onChange={(e) => onChange({ ...form, headerBg: e.target.value })}
        />
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={form.useSiteTheme}
            onChange={(e) => onChange({ ...form, useSiteTheme: e.target.checked })}
            className="h-4 w-4 rounded border border-[var(--border)]"
          />
          Use site-wide theme defaults
        </label>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input
            type="checkbox"
            checked={form.showLogo}
            onChange={(e) => onChange({ ...form, showLogo: e.target.checked })}
            className="h-4 w-4 rounded border border-[var(--border)]"
          />
          Tampilkan logo jurnal di header
        </label>
      </Section>

      {feedback && <FormMessage tone={feedback.status}>{feedback.message}</FormMessage>}
      <div className="flex justify-end">
        <Button onClick={onSave} loading={pending} disabled={pending}>
          Simpan Theme
        </Button>
      </div>
    </div>
  );
}

function RestrictBulkEmailsTab({
  selections,
  toggleRole,
  onSave,
  pending,
  feedback,
}: {
  selections: Set<JournalRoleValue>;
  toggleRole: (role: JournalRoleValue) => void;
  onSave: () => void;
  pending: boolean;
  feedback?: { status: "success" | "error"; message: string };
}) {
  return (
    <div className="space-y-6">
      <Section
        title="Disable Roles"
        description="Role yang dipilih tidak dapat menerima email massal dari jurnal ini."
      >
        <div className="space-y-2">
          {JOURNAL_ROLE_OPTIONS.map((role) => (
            <label
              key={role.value}
              className="flex items-start gap-3 rounded-md border border-[var(--border)] bg-white px-4 py-2 text-sm font-semibold"
            >
              <input
                type="checkbox"
                checked={selections.has(role.value)}
                onChange={() => toggleRole(role.value)}
                className="mt-1 h-4 w-4 rounded border border-[var(--border)]"
              />
              {role.label}
            </label>
          ))}
        </div>
      </Section>

      {feedback && <FormMessage tone={feedback.status}>{feedback.message}</FormMessage>}
      <div className="flex justify-end">
        <Button onClick={onSave} loading={pending} disabled={pending}>
          Simpan Restriksi
        </Button>
      </div>
    </div>
  );
}

function LabelInput({
  label,
  required = false,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; required?: boolean }) {
  return (
    <label className="block text-sm text-[var(--foreground)]">
      <span className="mb-2 block font-semibold">
        {label} {required && <span className="text-[#b91c1c]">*</span>}
      </span>
      <Input
        {...props}
        className="h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm text-[var(--foreground)] shadow-inner focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-muted)]"
      />
    </label>
  );
}
