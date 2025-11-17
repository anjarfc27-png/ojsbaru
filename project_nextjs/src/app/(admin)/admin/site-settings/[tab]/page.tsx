import { notFound } from "next/navigation";

import { SITE_SETTING_TABS, type SiteSettingTab } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "@/components/ui/form-message";
import {
  getSiteSettings,
  updateSiteSettingsAction,
  getSiteAppearance,
  updateSiteAppearanceAction,
  getSitePlugins,
  toggleSitePluginAction,
} from "../actions";

type Props = {
  params: Promise<{ tab: SiteSettingTab }>;
};

export default async function SiteSettingsTabPage({ params }: Props) {
  const { tab } = await params;

  if (!SITE_SETTING_TABS.includes(tab)) {
    notFound();
  }

  const initial = await getSiteSettings();
  const appearance = await getSiteAppearance();
  const plugins = await getSitePlugins();

  return (
    <div className="space-y-8">
      {tab === "site-setup" && <SiteSetupTab initial={initial} />}
      {tab === "appearance" && <AppearanceTab initial={appearance} />}
      {tab === "languages" && <LanguagesTab />}
      {tab === "plugins" && <PluginsTab items={plugins} />}
      {tab === "navigation-menus" && <NavigationMenusTab />}
      {tab === "bulk-emails" && <BulkEmailsTab />}
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
    <div className="mb-8 space-y-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-[var(--muted)]">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function SiteSetupTab({ initial }: { initial: Awaited<ReturnType<typeof getSiteSettings>> }) {
  return (
    <>
      <Section
        title="Site Identity"
        description="Atur nama situs, logo, dan pernyataan pembuka."
      >
        <form action={updateSiteSettingsAction} className="space-y-4">
          <div>
            <Label htmlFor="site_name" className="mb-2 block text-sm font-medium">
              Site name <span className="text-[#b91c1c]">*</span>
            </Label>
            <Input id="site_name" name="site_name" defaultValue={initial.site_name} className="max-w-md" />
          </div>
          <div>
            <Label htmlFor="logo_url" className="mb-2 block text-sm font-medium">
              Site logo URL
            </Label>
            <Input id="logo_url" name="logo_url" defaultValue={initial.logo_url} className="max-w-md" />
          </div>
          <div>
            <Label htmlFor="intro" className="mb-2 block text-sm font-medium">
              Introductory statement
            </Label>
            <textarea
              id="intro"
              name="intro"
              rows={4}
              defaultValue={initial.intro}
              className="w-full max-w-2xl rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm shadow-inner focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-muted)]"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Simpan Pengaturan</Button>
          </div>
        </form>
      </Section>

      <Section
        title="Redirect Options"
        description="Alihkan pengunjung langsung ke jurnal tertentu."
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="redirect-path" className="mb-2 block text-sm font-medium">
              Redirect journal path
            </Label>
            <Input id="redirect-path" placeholder="contoh: publicknowledge" className="max-w-md" />
            <FormMessage tone="muted" className="mt-2">
              Jika hanya ada satu jurnal, Anda dapat mengarahkan pengguna langsung ke jurnal tersebut.
            </FormMessage>
          </div>
        </div>
      </Section>

      <Section
        title="Contact Information"
        description="Informasi kontak yang tampil di seluruh situs."
      >
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="support-name" className="mb-2 block text-sm font-medium">
                Support name <span className="text-[#b91c1c]">*</span>
              </Label>
              <Input id="support-name" defaultValue="Site Administrator" />
            </div>
            <div>
              <Label htmlFor="support-email" className="mb-2 block text-sm font-medium">
                Support email <span className="text-[#b91c1c]">*</span>
              </Label>
              <Input id="support-email" type="email" defaultValue="admin@example.com" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="support-phone" className="mb-2 block text-sm font-medium">
                Support phone
              </Label>
              <Input id="support-phone" defaultValue="+62 811 1234 5678" />
            </div>
            <div>
              <Label htmlFor="min-password" className="mb-2 block text-sm font-medium">
                Minimum password length <span className="text-[#b91c1c]">*</span>
              </Label>
              <Input id="min-password" type="number" defaultValue={8} className="max-w-xs" />
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button>Simulasi</Button>
          </div>
        </div>
      </Section>
    </>
  );
}

function AppearanceTab({ initial }: { initial: Awaited<ReturnType<typeof getSiteAppearance>> }) {
  return (
    <>
      <Section title="Theme" description="Pilih tema dan warna header.">
        <form action={updateSiteAppearanceAction} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="theme" className="mb-2 block text-sm font-medium">
                Theme
              </Label>
              <select
                id="theme"
                name="theme"
                defaultValue={initial.theme}
                className="h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm text-[var(--foreground)] shadow-inner focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-muted)]"
              >
                <option value="default">Default</option>
                <option value="classic">Classic</option>
                <option value="modern">Modern</option>
              </select>
            </div>
            <div>
              <Label htmlFor="header_bg" className="mb-2 block text-sm font-medium">
                Header background color
              </Label>
              <Input id="header_bg" name="header_bg" type="text" defaultValue={initial.header_bg} className="max-w-xs" />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="show_logo" defaultChecked={initial.show_logo} className="h-4 w-4 rounded border border-[var(--border)]" />
            Tampilkan logo situs di header
          </label>
          <div>
            <Label htmlFor="footer_html" className="mb-2 block text-sm font-medium">
              Footer HTML
            </Label>
            <textarea
              id="footer_html"
              name="footer_html"
              rows={4}
              defaultValue={initial.footer_html}
              className="w-full max-w-2xl rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm shadow-inner focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-muted)]"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit">Simpan Tampilan</Button>
          </div>
        </form>
      </Section>
    </>
  );
}

function LanguagesTab() {
  return (
    <>
      <Section
        title="Available Locales"
        description="Aktifkan bahasa yang dapat digunakan oleh jurnal di situs ini."
      >
        <div className="flex flex-wrap gap-3">
          {["Bahasa Indonesia", "English", "Français", "Español"].map(
            (locale) => (
              <label
                key={locale}
                className="flex items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-2 text-sm"
              >
                <input type="checkbox" defaultChecked={locale !== "Français"} />
                {locale}
                {locale === "Bahasa Indonesia" && (
                  <span className="rounded bg-[var(--primary)] px-2 py-0.5 text-xs font-semibold text-white">
                    Default
                  </span>
                )}
              </label>
            ),
          )}
        </div>
        <div className="flex gap-3">
          <Button variant="secondary">Install Locale</Button>
          <Button>Simpan</Button>
        </div>
      </Section>

      <Section
        title="Language Settings"
        description="Atur bahasa antarmuka dan form input."
      >
        <Label htmlFor="primary-locale">Primary Locale</Label>
        <select
          id="primary-locale"
          className="h-11 w-full rounded-md border border-[var(--border)] bg-white px-3 text-sm text-[var(--foreground)] shadow-inner focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-muted)]"
        >
          <option>Bahasa Indonesia</option>
          <option>English</option>
          <option>Français</option>
          <option>Español</option>
        </select>
        <FormMessage tone="muted">
          Bahasa default akan digunakan pada kunjungan pertama pengguna.
        </FormMessage>
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
      {categories.map((category) => (
        <Section key={category} title={getPluginCategoryLabel(category)}>
          <div className="space-y-4">
            {grouped[category].map((plugin) => (
              <div
                key={plugin.id}
                className="flex flex-col gap-4 rounded-md border border-[var(--border)] bg-[var(--surface-muted)] p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <h3 className="text-sm font-semibold text-[var(--foreground)]">{plugin.name}</h3>
                  <p className="mt-1 text-sm text-[var(--muted)]">{plugin.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <form action={toggleSitePluginAction} className="flex items-center gap-2">
                    <input type="hidden" name="plugin_id" value={plugin.id} />
                    <Label className="mb-0 flex items-center gap-2 text-sm">
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

function NavigationMenusTab() {
  const menus = [
    {
      name: "Primary Navigation",
      description:
        "Menu utama yang tampil di bagian atas halaman depan jurnal.",
      items: ["Home", "About", "Login", "Register"],
    },
    {
      name: "User Navigation",
      description:
        "Menu untuk user yang tampil di pojok kanan atas saat login.",
      items: ["Dashboard", "Profile", "Logout"],
    },
  ];

  return (
    <>
      {menus.map((menu) => (
        <Section key={menu.name} title={menu.name} description={menu.description}>
          <div className="space-y-3">
            {menu.items.map((item) => (
              <div
                key={item}
                className="flex items-center justify-between rounded-md border border-[var(--border)] bg-white px-4 py-3 text-sm"
              >
                <span>{item}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary">
                    Edit
                  </Button>
                  <Button size="sm" variant="ghost">
                    Hapus
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-end">
            <Button size="sm">Tambah Item</Button>
          </div>
        </Section>
      ))}
    </>
  );
}

function BulkEmailsTab() {
  const journals = [
    { id: "jpk", name: "Journal of Public Knowledge", allow: true },
    { id: "jsi", name: "Jurnal Sistem Informasi", allow: false },
    { id: "education", name: "E-Journal Pendidikan", allow: false },
  ];

  return (
    <>
      <Section
        title="Bulk Email Permissions"
        description="Tentukan jurnal yang diizinkan menggunakan fitur email massal."
      >
        <p className="text-sm text-[var(--muted)]">
          Fitur email massal dapat membantu mengirim pemberitahuan ke grup user
          tertentu. Pastikan mematuhi regulasi anti-spam.
        </p>
        <div className="space-y-3">
          {journals.map((journal) => (
            <label
              key={journal.id}
              className="flex items-center justify-between rounded-md border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3"
            >
              <span className="text-sm font-semibold text-[var(--foreground)]">
                {journal.name}
              </span>
              <input
                type="checkbox"
                defaultChecked={journal.allow}
                className="h-4 w-4 rounded border border-[var(--border)]"
              />
            </label>
          ))}
        </div>
        <div className="mt-4 flex justify-end">
          <Button>Simpan pengaturan</Button>
        </div>
      </Section>

      <Section title="Catatan Kepatuhan">
        <p className="text-sm text-[var(--muted)]">
          Penggunaan email massal harus memperhatikan peraturan anti-spam dan
          kebijakan privasi. Pastikan setiap pengguna telah memberikan
          persetujuan sebelum menerima pesan massal.
        </p>
      </Section>
    </>
  );
}

