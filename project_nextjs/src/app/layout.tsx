import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";

import "./globals.css";
import { AppProviders } from "./providers";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Open Journal Systems 3.3 Clone",
  description:
    "Replika antarmuka Site Administration OJS 3.3 menggunakan Next.js & Supabase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${openSans.variable} bg-[var(--background)] antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
