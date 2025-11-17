import { Button } from "@/components/ui/button";
import { InstallLocaleDialog } from "@/components/admin/install-locale-dialog";
import { getSiteLanguages, updateSiteLanguagesAction, installLocaleAction } from "../../actions";
import { getLocaleInfo } from "@/lib/locales";

export default async function SiteSetupLanguagesPage() {
  const initial = await getSiteLanguages();
  const installedLocales = initial.enabled_locales.map((code) => getLocaleInfo(code)).filter(Boolean);

  return (
    <div className="space-y-6">
      <header className="border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Languages</h2>
      </header>
      <form action={updateSiteLanguagesAction} className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm text-[var(--muted)]">
            Pilih bahasa yang akan diaktifkan untuk digunakan oleh jurnal di situs ini.
          </p>
          <div className="flex flex-wrap gap-3">
            {installedLocales.map((locale) => {
              if (!locale) return null;
              return (
                <label
                  key={locale.code}
                  className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    name="enabled_locales"
                    value={locale.code}
                    defaultChecked={initial.enabled_locales.includes(locale.code)}
                  />
                  <span className="font-semibold text-[var(--foreground)]">{locale.label}</span>
                  <span className="text-xs text-[var(--muted)]">({locale.nativeName})</span>
                  {initial.default_locale === locale.code && (
                    <span className="rounded bg-white px-2 py-0.5 text-xs font-semibold text-[var(--foreground)]">
                      Default
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium" htmlFor="default_locale">
            Primary Locale
          </label>
          <select
            id="default_locale"
            name="default_locale"
            defaultValue={initial.default_locale}
            className="h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm text-[var(--foreground)] shadow-inner focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-muted)]"
          >
            {installedLocales.map((locale) => {
              if (!locale) return null;
              return (
                <option key={locale.code} value={locale.code}>
                  {locale.label} ({locale.nativeName})
                </option>
              );
            })}
          </select>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Bahasa default akan digunakan pada kunjungan pertama pengguna.
          </p>
        </div>
        <div className="flex gap-3">
          <InstallLocaleDialog installedLocales={initial.enabled_locales} onInstall={installLocaleAction} />
          <Button type="submit">Save</Button>
        </div>
      </form>
    </div>
  );
}