import os from "os";
import { Button } from "@/components/ui/button";
import { publicEnv } from "@/lib/env";

export default function SystemInformationPage() {
  const nodeVersion = process.version;
  const osInfo = `${os.type()} ${os.release()}`;
  const dbInfo = "PostgreSQL (Supabase)";
  const webServer = "Next.js / Node.js";
  const supabaseUrl = publicEnv.NEXT_PUBLIC_SUPABASE_URL;
  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-5">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              OJS Version Information
            </h2>
            <p className="text-sm text-[var(--muted)]">
              Detail versi instalasi OJS saat ini.
            </p>
          </div>
          <Button size="sm">Check for updates</Button>
        </header>
        <dl className="grid gap-4 text-sm">
          <div className="flex items-center justify-between">
            <dt className="font-semibold text-[var(--foreground)]">Current version</dt>
            <dd className="text-[var(--muted)]">3.3.0.21 (Clone)</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="font-semibold text-[var(--foreground)]">
              Latest upgrade
            </dt>
            <dd className="text-[var(--muted)]">March 10, 2025</dd>
          </div>
        </dl>
      </section>

      <section className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-5">
        <header>
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            Server Information
          </h2>
        </header>
        <dl className="grid gap-3 text-sm">
          <Row label="Operating system" value={osInfo} />
          <Row label="Node.js version" value={nodeVersion} />
          <Row label="Database" value={dbInfo} />
          <Row label="Web server" value={webServer} />
      </dl>
      </section>

      <section className="space-y-4 rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-5">
        <header className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--foreground)]">
            OJS Configuration
          </h2>
          <Button size="sm" variant="secondary">
            Extended PHP information
          </Button>
        </header>
        <table className="w-full text-sm">
          <tbody className="divide-y divide-[var(--border)] bg-white">
            {[
              ["general.locale", "id_ID"],
              ["files.directory", "/srv/ojs/files"],
              ["installed", "On"],
              ["session.force_ssl", "Off"],
              ["supabase.url", supabaseUrl],
            ].map(([key, value]) => (
              <tr key={key}>
                <td className="px-4 py-2 font-semibold text-[var(--foreground)]">
                  {key}
                </td>
                <td className="px-4 py-2 text-[var(--muted)]">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-md border border-[var(--border)] bg-white px-4 py-3">
      <span className="font-semibold text-[var(--foreground)]">{label}</span>
      <span className="text-[var(--muted)]">{value}</span>
    </div>
  );
}

