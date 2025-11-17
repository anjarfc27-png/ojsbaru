import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getSiteInformation, updateSiteInformationAction } from "../../actions";

export default async function SiteSetupInformationPage() {
  const initial = await getSiteInformation();
  return (
    <div className="space-y-6">
      <header className="border-b border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3">
        <h2 className="text-sm font-semibold text-[var(--foreground)]">Information</h2>
      </header>
      <form action={updateSiteInformationAction} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="support_name" className="mb-2 block text-sm font-medium">
              Support name <span className="text-[#b91c1c]">*</span>
            </Label>
            <Input id="support_name" name="support_name" defaultValue={initial.support_name} />
          </div>
          <div>
            <Label htmlFor="support_email" className="mb-2 block text-sm font-medium">
              Support email <span className="text-[#b91c1c]">*</span>
            </Label>
            <Input id="support_email" name="support_email" type="email" defaultValue={initial.support_email} />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="support_phone" className="mb-2 block text-sm font-medium">
              Support phone
            </Label>
            <Input id="support_phone" name="support_phone" defaultValue={initial.support_phone} />
          </div>
          <div />
        </div>
        <div className="flex justify-end">
          <Button type="submit">Save</Button>
        </div>
      </form>
    </div>
  );
}