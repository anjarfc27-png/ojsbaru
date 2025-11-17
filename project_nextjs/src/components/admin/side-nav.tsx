"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSupabase } from "@/providers/supabase-provider";

export function SideNav() {
  const supabase = useSupabase();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [showLogo, setShowLogo] = useState<boolean>(true);
  const [hasLogo, setHasLogo] = useState(true);

  useEffect(() => {
    const fetchBranding = async () => {
      try {
        const { data: s } = await supabase
          .from("site_settings")
          .select("logo_url")
          .eq("id", "site")
          .single();
        const { data: a } = await supabase
          .from("site_appearance")
          .select("show_logo")
          .eq("id", "site")
          .single();
        const lu = (s as { logo_url?: string } | null)?.logo_url ?? null;
        const sl = (a as { show_logo?: boolean } | null)?.show_logo ?? true;
        setLogoUrl(lu && lu.length ? lu : "/images/iamjos.png");
        setShowLogo(Boolean(sl));
      } catch {
        setLogoUrl("/images/iamjos.png");
        setShowLogo(true);
      }
    };
    fetchBranding();
  }, [supabase]);

  useEffect(() => {
    const url = logoUrl ?? "/images/iamjos.png";
    if (url.startsWith("/")) {
      fetch(url + "?v=" + Date.now(), { method: "HEAD" })
        .then((r) => setHasLogo(r.ok))
        .catch(() => setHasLogo(false));
    }
  }, [logoUrl]);
  return (
    <aside className="hidden w-72 flex-col border-r border-[var(--border)] bg-[#0a2d44] text-white lg:flex">
      <div className="px-6 py-6">
        <div className="flex flex-col items-start">
          {showLogo && hasLogo ? (
            (logoUrl ?? "/images/iamjos.png").startsWith("http") ? (
              <img
                src={logoUrl ?? "/images/iamjos.png"}
                alt="Open Journal Systems"
                style={{ height: "auto", width: "150px" }}
              />
            ) : (
              <Image
                src={logoUrl ?? "/images/iamjos.png"}
                alt="Open Journal Systems"
                width={150}
                height={110}
                priority
                style={{ height: "auto", width: "150px" }}
              />
            )
          ) : (
            <svg width="160" height="130" viewBox="0 0 240 140" aria-hidden="true">
              <text x="120" y="76" fill="white" fontSize="72" fontFamily="serif" textAnchor="middle">OJS</text>
              <text x="120" y="106" fill="white" fontSize="14" fontFamily="serif" textAnchor="middle" letterSpacing="2">OPEN JOURNAL SYSTEMS</text>
              <rect x="40" y="112" width="160" height="3" fill="white" />
            </svg>
          )}
        </div>
      </div>

      <div className="px-6 pb-5 text-lg font-semibold tracking-wide">Administration</div>
    </aside>
  );
}

