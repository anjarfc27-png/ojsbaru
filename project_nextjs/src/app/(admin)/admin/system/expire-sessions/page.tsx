"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { FormMessage } from "@/components/ui/form-message";
import { expireAllSessionsAction } from "./actions";

type State = null | { ok: true; expired: number } | { ok: false; message: string };

export default function ExpireSessionsPage() {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async () => expireAllSessionsAction(),
    null,
  );

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-[var(--foreground)]">
          Expire User Sessions
        </h2>
        <p className="text-sm text-[var(--muted)]">
          Mengakhiri seluruh sesi pengguna yang sedang aktif. Pengguna akan diminta
          login ulang. Gunakan sebelum melakukan upgrade sistem.
        </p>
      </section>

      {state?.ok && (
        <FormMessage tone="success">
          Seluruh sesi pengguna berhasil diakhiri untuk {state.expired} akun.
        </FormMessage>
      )}
      {state && !state.ok && (
        <FormMessage tone="error">{state.message}</FormMessage>
      )}

      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-5">
        <p className="text-sm text-[var(--muted)]">
          Tindakan ini bersifat langsung dan permanen. Tidak ada notifikasi yang
          dikirim ke pengguna.
        </p>
        <div className="mt-4 flex gap-3">
          <form action={formAction} className="contents">
            <Button variant="danger" type="submit" loading={pending}>
              Expire semua sesi sekarang
            </Button>
          </form>
          <Button variant="secondary" disabled={pending} onClick={() => location.reload()}>
            Muat ulang
          </Button>
        </div>
      </div>
    </div>
  );
}

