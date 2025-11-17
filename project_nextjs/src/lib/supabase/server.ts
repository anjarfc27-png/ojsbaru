import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

import { isPublicEnvValid, publicEnv } from "../env";

export function createSupabaseServerClient() {
  if (!isPublicEnvValid) {
    throw new Error(
      "Supabase environment (URL/anon key) belum dikonfigurasi. Cek file .env.",
    );
  }

  // Get cookies instance - call it once per request
  const cookieStore = cookies();

  return createServerClient(
    publicEnv.NEXT_PUBLIC_SUPABASE_URL,
    publicEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name: string) {
          try {
            const getter = (cookieStore as unknown as { get?: (n: string) => { value?: string } | undefined }).get;
            if (typeof getter === "function") {
              const cookie = getter.call(cookieStore, name);
              return cookie?.value;
            }
          } catch {}
          return undefined;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            const setter = (cookieStore as unknown as { set?: (n: string, v: string, o: CookieOptions) => void }).set;
            if (typeof setter === "function") {
              setter.call(cookieStore, name, value, options);
            }
          } catch {}
        },
        remove(name: string, options: CookieOptions) {
          try {
            const deleter = (cookieStore as unknown as { delete?: (n: string) => void }).delete;
            if (typeof deleter === "function") {
              deleter.call(cookieStore, name);
              return;
            }
            const setter = (cookieStore as unknown as { set?: (n: string, v: string, o: CookieOptions) => void }).set;
            if (typeof setter === "function") {
              setter.call(cookieStore, name, "", options);
            }
          } catch {}
        },
      },
    },
  );
}

