"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { clearTemplateCacheAction } from "./actions";

export default function ClearTemplateCachePage() {
  const [state, formAction, pending] = useActionState<{ ok: true } | null, FormData>(
    async () => clearTemplateCacheAction(),
    null,
  );

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          Clear Template Cache
        </h2>
        <p className="text-sm text-[var(--muted)]">
          Hapus versi cache dari template HTML. Berguna setelah melakukan perubahan tampilan.
        </p>
      </header>

      {state && (
        <FormMessage tone="success">
          Template cache berhasil dibersihkan. Template terbaru akan dimuat saat permintaan berikutnya.
        </FormMessage>
      )}

      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-5">
        <p className="text-sm text-[var(--muted)]">
          Proses ini hanya memengaruhi file template. Tidak ada konten jurnal yang berubah.
        </p>
        <form action={formAction}>
          <Button className="mt-4" type="submit" loading={pending}>
            Clear Template Cache
          </Button>
        </form>
      </div>
    </div>
  );
}

