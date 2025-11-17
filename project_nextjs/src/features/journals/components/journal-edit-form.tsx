 "use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  createJournalAction,
  updateJournalAction,
} from "@/app/(admin)/admin/site-management/hosted-journals/actions";

import type { HostedJournal } from "../types";

type Props = {
  journal?: HostedJournal;
  mode: "create" | "edit";
  onCancel?: () => void;
  onSuccess?: () => void;
};

export function JournalEditForm({
  journal,
  mode,
  onCancel,
  onSuccess,
}: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = (formData.get("title") as string | null)?.trim() ?? "";
    const path = (formData.get("path") as string | null)?.trim() ?? "";
    const descriptionRaw = (formData.get("description") as string | null) ?? "";
    const isPublic = formData.get("is_public") === "on";

    const description =
      descriptionRaw.trim().length > 0 ? descriptionRaw.trim() : null;

    startTransition(async () => {
      const result =
        mode === "create"
          ? await createJournalAction({
              title,
              path,
              description,
              isPublic,
            })
          : await updateJournalAction({
              id: journal?.id ?? "",
              title,
              path,
              description,
              isPublic,
            });

      if (!result.success) {
        setError(result.message);
        return;
      }

      setError(null);
      router.refresh();
      onSuccess?.();
    });
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Label htmlFor="journal-title">
          Journal title <span className="text-[#b91c1c]">*</span>
        </Label>
        <Input
          id="journal-title"
          name="title"
          defaultValue={journal?.name ?? ""}
          placeholder="Masukkan judul jurnal"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="journal-description">Journal description</Label>
        <textarea
          id="journal-description"
          name="description"
          rows={6}
          defaultValue={journal?.description ?? ""}
          className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)] shadow-inner focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-muted)]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="journal-path">
          Path <span className="text-[#b91c1c]">*</span>
        </Label>
        <Input
          id="journal-path"
          name="path"
          defaultValue={journal?.path ?? ""}
          placeholder="contoh: publicknowledge"
          required
        />
        <p className="text-sm text-[var(--muted)]">
          Ini harus berupa kata pendek yang akan digunakan dalam URL.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-[var(--foreground)]">
        <input
          type="checkbox"
          name="is_public"
          defaultChecked={journal?.isPublic ?? true}
          className="h-4 w-4 rounded border border-[var(--border)]"
        />
        Enable this journal to appear publicly on the site
      </label>

      {error && <FormMessage tone="error">{error}</FormMessage>}

      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isPending}
        >
          Batal
        </Button>
        <Button type="submit" loading={isPending}>
          {mode === "create" ? "Buat" : "Simpan"}
        </Button>
      </div>
    </form>
  );
}


