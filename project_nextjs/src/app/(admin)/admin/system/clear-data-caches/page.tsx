"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { clearDataCachesAction } from "./actions";

const CACHE_ITEMS = [
  { id: "locale", label: "Locale data cache", description: "Istilah dan terjemahan." },
  { id: "help", label: "Help cache", description: "Konten bantuan pengguna." },
  { id: "search", label: "Search cache", description: "Index pencarian artikel." },
];

export default function ClearDataCachesPage() {
  const [state, formAction, pending] = useActionState<{ ok: true } | null, FormData>(
    async () => clearDataCachesAction(),
    null,
  );

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          Clear Data Caches
        </h2>
        <p className="text-sm text-[var(--muted)]">
          Paksa pemuatan ulang data setelah melakukan perubahan konfigurasi atau penyesuaian.
        </p>
      </header>

      {state && (
        <FormMessage tone="success">
          Cache data berhasil dibersihkan. Versi terbaru akan dibuat ulang secara otomatis.
        </FormMessage>
      )}

      <div className="space-y-4">
        {CACHE_ITEMS.map((item) => (
          <div
            key={item.id}
            className="rounded-md border border-[var(--border)] bg-[var(--surface-muted)] p-4"
          >
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              {item.label}
            </h3>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      <form action={formAction}>
        <Button type="submit" loading={pending}>Clear Data Caches</Button>
      </form>
    </div>
  );
}

