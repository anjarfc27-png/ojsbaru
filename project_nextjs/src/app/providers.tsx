"use client";

import { ReactNode } from "react";

import { ReactQueryProvider } from "@/providers/react-query-provider";
import { SupabaseProvider } from "@/providers/supabase-provider";

type Props = {
  children: ReactNode;
};

export function AppProviders({ children }: Props) {
  return (
    <ReactQueryProvider>
      <SupabaseProvider>{children}</SupabaseProvider>
    </ReactQueryProvider>
  );
}

