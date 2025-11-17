"use server";

import { revalidatePath } from "next/cache";

type Result = { ok: true };

export async function clearTemplateCacheAction(): Promise<Result> {
  const paths = [
    "/admin/site-settings/site-setup",
    "/admin/site-management",
    "/admin/site-management/hosted-journals",
  ];
  for (const p of paths) revalidatePath(p);
  return { ok: true };
}