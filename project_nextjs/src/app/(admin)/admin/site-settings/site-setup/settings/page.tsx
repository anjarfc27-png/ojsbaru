import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getSiteSettings, updateSiteSettingsAction } from "../../actions";

export default async function SiteSetupSettingsPage() {
  const initial = await getSiteSettings();
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Settings</h2>
        <nav className="flex gap-3 text-sm font-semibold">
          <a className="text-[var(--muted)]">Español (España)</a>
          <a className="text-[var(--muted)]">Bahasa Indonesia</a>
          <a className="text-[var(--foreground)]">English</a>
        </nav>
      </header>
      <form action={updateSiteSettingsAction} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="site_name">Site Name <span className="text-[#b91c1c]">*</span></Label>
          <Input id="site_name" name="site_name" defaultValue={initial.site_name} className="max-w-xl" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="min_password_length">Minimum password length (characters) <span className="text-[#b91c1c]">*</span></Label>
          <Input id="min_password_length" name="min_password_length" type="number" min={6} defaultValue={initial.min_password_length} className="max-w-xs" />
        </div>
        <div className="flex justify-end">
          <Button type="submit">Save</Button>
        </div>
      </form>
    </div>
  );
}