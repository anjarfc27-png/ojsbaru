import { notFound } from "next/navigation";
import Link from "next/link";

import { SITE_SETTING_TABS, type SiteSettingTab } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/ui/form-message";
import {
  getSiteSettings,
  updateSiteSettingsAction,
  getSitePlugins,
  toggleSitePluginAction,
  getSiteInformation,
  updateSiteInformationAction,
  getSiteLanguages,
  updateSiteLanguagesAction,
  installLocaleAction,
  getSiteNavigation,
  updateSiteNavigationAction,
  getBulkEmailPermissions,
  updateBulkEmailPermissionsAction,
} from "../actions";
import { LOCALE_MAP } from "@/lib/locales";
import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import BulkEmailsTabClient from "../tabs/BulkEmailsTabClient";

type Props = {
  params: Promise<{ tab: SiteSettingTab }>;
};

export default async function SiteSettingsTabPage({ params }: Props) {
  const { tab } = await params;

  if (!SITE_SETTING_TABS.includes(tab)) {
    notFound();
  }

  const initial = await getSiteSettings();
  const plugins = await getSitePlugins();
  const information = await getSiteInformation();
  const languages = await getSiteLanguages();
  const navigation = await getSiteNavigation();
  const bulkEmailPerms = await getBulkEmailPermissions();
  const supabase = getSupabaseAdminClient();
  const { data: journalRows } = await supabase
    .from("journals")
    .select("id,title,path")
    .order("created_at", { ascending: true });
  const journals = (journalRows ?? []).map((j: any) => ({ id: String(j.id), name: String(j.title ?? j.path ?? j.id) }));

  return (
    <div className="space-y-8">
      {tab === "site-setup" && <SiteSetupTab initial={initial} information={information} />}
      {tab === "languages" && <LanguagesTab initial={languages} />}
      {tab === "plugins" && <PluginsTab items={plugins} />}
      {tab === "navigation-menus" && <NavigationMenusTab initial={navigation} />}
      {tab === "bulk-emails" && <BulkEmailsTabClient journals={journals} initial={bulkEmailPerms} templates={[]} logs={[]} />}
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
    <div className="mb-8 space-y-4" style={{ marginBottom: '2rem' }}>
      <div className="mb-4" style={{ marginBottom: '1rem' }}>
        <h2 className="text-lg font-semibold text-gray-900" style={{
          fontSize: '1.125rem',
          fontWeight: '600',
          color: '#111827'
        }}>
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-base text-gray-600" style={{
            marginTop: '0.25rem',
            fontSize: '0.875rem',
            color: '#4B5563'
          }}>{description}</p>
        )}
      </div>
      <div className="space-y-4" style={{ gap: '1rem' }}>{children}</div>
    </div>
  );
}

function SiteSetupTab({ initial, information }: { initial: Awaited<ReturnType<typeof getSiteSettings>>; information: Awaited<ReturnType<typeof getSiteInformation>> }) {
  return (
    <>
      <Section
        title="Site Configuration"
        description="OJS 3.3 PKPSiteConfigForm: title, redirect, minPasswordLength"
      >
        <form action={updateSiteSettingsAction} className="space-y-4">
          <div>
            <Label htmlFor="title" className="mb-2 block font-medium" style={{
              marginBottom: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              Site title <span className="text-[#b91c1c]">*</span>
            </Label>
            <Input id="title" name="title" defaultValue={initial.title} className="max-w-md" required />
            <FormMessage tone="muted" className="mt-2">
              The title of this installation as it should appear in web browser titles.
            </FormMessage>
          </div>
          <div>
            <Label htmlFor="minPasswordLength" className="mb-2 block text-sm font-medium">
              Minimum password length <span className="text-[#b91c1c]">*</span>
            </Label>
            <Input id="minPasswordLength" name="minPasswordLength" type="number" min={6} max={64} defaultValue={initial.minPasswordLength} className="max-w-xs" required />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Simpan Pengaturan</Button>
          </div>
        </form>
      </Section>

      <Section
        title="Contact Information"
        description="OJS 3.3 PKPSiteInformationForm: about, contactName, contactEmail, privacyStatement"
      >
        <form action={updateSiteInformationAction} className="space-y-4">
          <div>
            <Label htmlFor="about" className="mb-2 block text-sm font-medium">
              About
            </Label>
            <textarea
              id="about"
              name="about"
              rows={6}
              defaultValue={information.about || ""}
              className="w-full max-w-2xl rounded-md border border-gray-300 bg-white px-3 py-2 shadow-inner focus-visible:border-[#006798] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006798]/20"
              style={{
                fontSize: '0.875rem',
                padding: '0.5rem 0.75rem'
              }}
            />
            <FormMessage tone="muted" className="mt-2">
              A brief description of this installation that will appear on the homepage.
            </FormMessage>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="contactName" className="mb-2 block text-sm font-medium">
                Contact name <span className="text-[#b91c1c]">*</span>
              </Label>
              <Input id="contactName" name="contactName" defaultValue={information.contactName || ""} required />
            </div>
            <div>
              <Label htmlFor="contactEmail" className="mb-2 block text-sm font-medium">
                Contact email <span className="text-[#b91c1c]">*</span>
              </Label>
              <Input id="contactEmail" name="contactEmail" type="email" defaultValue={information.contactEmail || ""} required />
            </div>
          </div>
          <div>
            <Label htmlFor="privacyStatement" className="mb-2 block text-sm font-medium">
              Privacy statement
            </Label>
            <textarea
              id="privacyStatement"
              name="privacyStatement"
              rows={8}
              defaultValue={information.privacyStatement || ""}
              className="w-full max-w-2xl rounded-md border border-gray-300 bg-white px-3 py-2 shadow-inner focus-visible:border-[#006798] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006798]/20"
              style={{
                fontSize: '0.875rem',
                padding: '0.5rem 0.75rem'
              }}
            />
            <FormMessage tone="muted" className="mt-2">
              A statement describing the privacy policy for this installation.
            </FormMessage>
          </div>
          <div className="flex justify-end pt-4">
            <Button type="submit">Simpan Informasi</Button>
          </div>
        </form>
      </Section>
    </>
  );
}

// AppearanceTab removed - OJS 3.3 PKPSiteAppearanceForm does not have theme, header_bg, show_logo, footer_html
// Appearance settings are now in /admin/site-settings/appearance/setup page

function LanguagesTab({ initial }: { initial: Awaited<ReturnType<typeof getSiteLanguages>> }) {
  return (
    <>
      <Section
        title="Available Locales"
        description="Aktifkan bahasa yang dapat digunakan oleh jurnal di situs ini."
      >
        <form action={updateSiteLanguagesAction} className="space-y-4">
          <div className="flex flex-wrap gap-3">
            {initial.enabled_locales.map((locale) => (
              <label
                key={locale}
                className="flex items-center gap-2 rounded-md border border-gray-300 bg-gray-50 px-4 py-2"
                style={{
                  fontSize: '0.875rem',
                  padding: '0.5rem 1rem'
                }}
              >
                <input 
                  type="checkbox" 
                  name="enabled_locales" 
                  value={locale}
                  defaultChecked={true}
                />
                {locale}
                {locale === initial.default_locale && (
                  <span className="rounded bg-[var(--primary)] px-2 py-0.5 text-xs font-semibold text-white">
                    Default
                  </span>
                )}
              </label>
            ))}
          </div>
          <div className="flex gap-3">
            <Button variant="secondary" type="button">Install Locale</Button>
            <Button type="submit">Simpan</Button>
          </div>
        </form>
      </Section>

      <Section
        title="Language Settings"
        description="Atur bahasa antarmuka dan form input."
      >
        <form action={updateSiteLanguagesAction} className="space-y-4">
          <Label htmlFor="primary-locale">Primary Locale</Label>
          <select
            id="primary-locale"
            name="default_locale"
            defaultValue={initial.default_locale}
            className="h-11 w-full rounded-md border border-gray-300 bg-white px-3 text-gray-900 shadow-inner focus-visible:border-[#006798] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#006798]/20"
            style={{
              fontSize: '0.875rem',
              height: '2.75rem',
              padding: '0.5rem 0.75rem'
            }}
          >
            {initial.enabled_locales.map((locale) => (
              <option key={locale} value={locale}>{locale}</option>
            ))}
          </select>
          <FormMessage tone="muted">
            Bahasa default akan digunakan pada kunjungan pertama pengguna.
          </FormMessage>
          <div className="flex justify-end">
            <Button type="submit">Simpan</Button>
          </div>
        </form>
      </Section>
    </>
  );
}

function PluginsTab({ items }: { items: Awaited<ReturnType<typeof getSitePlugins>> }) {
  const grouped = items.reduce<Record<string, typeof items>>((acc, plugin) => {
    const key = plugin.category ?? "other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(plugin);
    return acc;
  }, {});

  const categories = Object.keys(grouped);

  return (
    <>
      <Section title="Installed Plugins" description="Manage plugins that are currently installed on this site.">
        <div className="mb-4">
          <Link href="/admin/site-settings/plugins/gallery">
            <Button variant="primary">Browse Plugin Gallery</Button>
          </Link>
        </div>
      </Section>
      {categories.map((category) => (
        <Section key={category} title={getPluginCategoryLabel(category)}>
          <div className="space-y-4">
            {grouped[category].map((plugin) => (
              <div
                key={plugin.id}
                className="flex flex-col gap-4 rounded-md border border-[var(--border)] bg-[var(--surface-muted)] p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <h3 className="font-semibold text-gray-900" style={{
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#111827'
                  }}>{plugin.name}</h3>
                  <p className="mt-1 text-gray-600" style={{
                    marginTop: '0.25rem',
                    fontSize: '0.875rem',
                    color: '#4B5563'
                  }}>{plugin.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <form action={async (formData: FormData) => {
                    'use server'
                    await toggleSitePluginAction(formData)
                  }} className="flex items-center gap-2">
                    <input type="hidden" name="plugin_id" value={plugin.id} />
                    <Label className="mb-0 flex items-center gap-2" style={{
                      fontSize: '0.875rem'
                    }}>
                      <input
                        type="checkbox"
                        name="enabled"
                        defaultChecked={plugin.enabled}
                        className="h-4 w-4 rounded border border-[var(--border)]"
                      />
                      Aktif
                    </Label>
                    <Button size="sm" type="submit" variant="secondary">
                      Save
                    </Button>
                  </form>
                  <Button size="sm" variant="secondary">
                    Konfigurasi
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Section>
      ))}
    </>
  );
}

function getPluginCategoryLabel(category: string) {
  const labels: Record<string, string> = {
    generic: "Generic Plugins",
    importexport: "Import/Export Plugins",
    metadata: "Metadata Plugins",
    reports: "Reports & Tools",
  };
  return labels[category] ?? category.replace(/(^|\s)\w/g, (c) => c.toUpperCase());
}

function NavigationMenusTab({ initial }: { initial: Awaited<ReturnType<typeof getSiteNavigation>> }) {
  return (
    <>
      <Section title="Primary Navigation" description="Menu utama yang tampil di bagian atas halaman depan jurnal.">
        <form action={updateSiteNavigationAction} className="space-y-4">
          <div className="space-y-3">
            {initial.primary.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-3"
                style={{
                  fontSize: '0.875rem',
                  padding: '0.75rem 1rem'
                }}
              >
                <span>{item}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" type="button">
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" type="button">
                    Hapus
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <Button size="sm" type="button">Tambah Item</Button>
          </div>
        </form>
      </Section>

      <Section title="User Navigation" description="Menu untuk user yang tampil di pojok kanan atas saat login.">
        <form action={updateSiteNavigationAction} className="space-y-4">
          <div className="space-y-3">
            {initial.user.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-3"
                style={{
                  fontSize: '0.875rem',
                  padding: '0.75rem 1rem'
                }}
              >
                <span>{item}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" type="button">
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost" type="button">
                    Hapus
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <Button size="sm" type="button">Tambah Item</Button>
          </div>
        </form>
      </Section>
    </>
  );
}





