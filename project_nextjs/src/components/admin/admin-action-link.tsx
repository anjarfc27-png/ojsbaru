"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

type Props = {
  href: string;
  confirmMessage?: string;
  children: ReactNode;
};

export function AdminActionLink({ href, confirmMessage, children }: Props) {
  const router = useRouter();

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (confirmMessage) {
      const confirmed = window.confirm(confirmMessage);
      if (!confirmed) {
        event.preventDefault();
        return;
      }
    }
    // Navigate to the page which will handle the action
    event.preventDefault();
    router.push(href);
  };

  return (
    <Link href={href} onClick={handleClick} className="text-sm text-[var(--primary)] underline hover:no-underline">
      {children}
    </Link>
  );
}

