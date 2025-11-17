import { Button } from "@/components/ui/button";
import { getSiteNavigation, updateSiteNavigationAction } from "../../actions";

export default async function SiteSetupNavigationPage() {
  const initial = await getSiteNavigation();
  return (
    <div className="space-y-6">
      <header className="border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Navigation</h2>
      </header>
      <form action={updateSiteNavigationAction} className="space-y-6">
        <div>
          <label htmlFor="primary" className="mb-2 block text-sm font-medium">Primary Navigation</label>
          <textarea
            id="primary"
            name="primary"
            rows={3}
            defaultValue={initial.primary.join(", ")}
            className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm shadow-inner focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-muted)]"
          />
        </div>
        <div>
          <label htmlFor="user" className="mb-2 block text-sm font-medium">User Navigation</label>
          <textarea
            id="user"
            name="user"
            rows={3}
            defaultValue={initial.user.join(", ")}
            className="w-full rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm shadow-inner focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-muted)]"
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit">Save</Button>
        </div>
      </form>
    </div>
  );
}